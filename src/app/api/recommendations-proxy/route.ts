import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'
import { getCorsHeaders, isOriginAllowed, handleCorsPreflightResponse } from '@/lib/cors'
import { validateSearchParam, sanitizeText } from '@/lib/validation'
import { createRequestLogger, getSafeErrorMessage } from '@/lib/logger'

export const runtime = 'nodejs'

// Request timeout in milliseconds (10 seconds)
const REQUEST_TIMEOUT = 10000

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin')
    return handleCorsPreflightResponse(origin)
}

/**
 * GET /api/recommendations-proxy?title=...&artist=...
 * Proxies requests to the Shazam backend's /recommendations endpoint
 */
export async function GET(request: NextRequest) {
    const origin = request.headers.get('origin')
    const corsHeaders = getCorsHeaders(origin)
    const logger = createRequestLogger()

    try {
        logger.info('Receiving recommendations request')

        // Check CORS
        if (origin && !isOriginAllowed(origin)) {
            logger.warn('CORS violation attempt', { origin })
            return NextResponse.json(
                { error: 'Origin not allowed' },
                { status: 403, headers: corsHeaders }
            )
        }

        // Check rate limit
        const clientIP = getClientIP(request)
        const rateLimit = checkRateLimit(`recommendations:${clientIP}`, RATE_LIMITS.recommendations)

        if (rateLimit.limited) {
            logger.warn('Rate limit exceeded', { clientIP })
            return NextResponse.json(
                { error: RATE_LIMITS.recommendations.message },
                {
                    status: 429,
                    headers: { ...corsHeaders, ...rateLimit.headers }
                }
            )
        }

        // Extract and validate query parameters
        const { searchParams } = new URL(request.url)
        const title = searchParams.get('title')
        const artist = searchParams.get('artist')

        const titleValidation = validateSearchParam(title, 'title')
        if (!titleValidation.valid) {
            return NextResponse.json(
                { error: titleValidation.error },
                { status: 400, headers: { ...corsHeaders, ...rateLimit.headers } }
            )
        }

        const sanitizedArtist = artist ? sanitizeText(artist, 200) : ''

        logger.info('Fetching recommendations', {
            title: titleValidation.value,
            artist: sanitizedArtist,
        })

        // Build backend URL
        const backendParams = new URLSearchParams()
        backendParams.set('title', titleValidation.value!)
        if (sanitizedArtist) {
            backendParams.set('artist', sanitizedArtist)
        }

        const backendUrl = `https://shazam-efve.onrender.com/recommendations?${backendParams.toString()}`

        // Add timeout to the backend request
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

        try {
            const backendRes = await fetch(backendUrl, {
                method: 'GET',
                signal: controller.signal,
            })

            clearTimeout(timeout)

            logger.info('Backend response received', { status: backendRes.status })

            // Handle non-JSON responses
            const contentType = backendRes.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await backendRes.text()
                logger.error('Non-JSON response from backend', { response: text.substring(0, 100) })
                return NextResponse.json(
                    { error: 'Backend service error. Please try again later.' },
                    { status: 502, headers: { ...corsHeaders, ...rateLimit.headers } }
                )
            }

            const json = await backendRes.json()
            logger.info('Recommendations result', {
                count: json.recommendations?.length || 0,
            })

            return NextResponse.json(json, {
                status: backendRes.status,
                headers: { ...corsHeaders, ...rateLimit.headers },
            })
        } catch (fetchError) {
            clearTimeout(timeout)

            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                logger.error('Backend request timed out')
                return NextResponse.json(
                    { error: 'Request timed out. The server is taking too long to respond.' },
                    { status: 504, headers: { ...corsHeaders, ...rateLimit.headers } }
                )
            }
            throw fetchError
        }
    } catch (error: unknown) {
        const safeMessage = getSafeErrorMessage(error)
        logger.error('Recommendations proxy error', {
            error: error instanceof Error ? error.message : 'Unknown error',
        })
        return NextResponse.json(
            { error: safeMessage },
            { status: 500, headers: corsHeaders }
        )
    }
}
