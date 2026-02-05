# NoteSpy - Project Documentation

#### Project is Live at- https://notespy.vercel.app/

## 1. Overview
**NoteSpy** is a modern, high-performance music recognition web application. Inspired by Shazam, it allows users to identify songs by recording audio directly from their browser or uploading audio files. The project emphasizes a premium user experience with advanced animations and a clean, futuristic interface.

## 2. Technical Stack
The project is built using a robust and modern stack:

- **Frontend Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: 
  - **GSAP (GreenSock Animation Platform)**: Used for complex timeline animations, scrambling text effects, and custom transformations.
  - **Framer Motion**: Powering layout transitions and reactive UI elements.
- **Audio Processing**: Web Audio API for recording and client-side processing.
- **Backend Matching**: Python-based Shazam API wrapper (hosted on Render).

## 3. Project Structure
The project follows a standard Next.js directory structure with a heavy focus on reusable UI components:

```text
/src
  /app                # Main application routes and API endpoints
    /api/match-proxy  # Node.js proxy to bypass CORS for audio matching
    /layout.tsx       # Root layout with providers and global styles
    /page.tsx         # Main landing page (integrates all sections)
  /components         # Core UI and Feature components
    /audio            # Audio recording, uploading, and result handling
    /layout           # Structural layout components (Theme, Nav)
    /ui               # Reusable primitive and effect-heavy components
    about-section.tsx # "How it works" accordion
    hero-section.tsx  # Main call-to-action and primary recognition UI
    footer.tsx        # Footer with social links and recruitment status
  /lib                # Shared utilities (Tailwind merges, etc.)
  /styles             # Global CSS and Tailwind theme configurations
```

## 4. How it Works (Technical Flow)

### Step 1: Audio Capture
The user can capture audio in two ways:
1. **Recording**: Uses the browser's `MediaRecorder` API to capture a high-quality PCM/WAV buffer from the microphone.
2. **Uploading**: Standard file input restricted to audio formats (`.mp3`, `.wav`, `.m4a`).

### Step 2: The Matching Proxy
To protect keys and bypass CORS issues, the frontend sends the audio `FormData` to a local Next.js route (`/api/match-proxy`). This proxy then forwards the request to the dedicated music recognition backend.

### Step 3: Fingerprinting & Search
The backend (external to this repository) processes the raw audio, generates a unique "fingerprint," and queries it against a massive database of song signatures.

### Step 4: UI Representation
Once a match is found:
- **Scramble Effect**: Text dynamically "decodes" using GSAP `ScrambleTextPlugin`.
- **Spotlight/Flashlight**: Results are presented with decorative spotlight effects that follow the mouse or pulse automatically.
- **Song Cards**: Display metadata retrieved from the matching service, including album art and links.

## 5. Key Features & Animations
- **Global Flashlight Synchronization**: All decorative "flashlight" effects across the site are synchronized to a global timer, ensuring a cohesive visual pulse.
- **Reactive Navigation**: A custom `PillNav` component that uses physics-like animations to follow the active state.
- **Mobile-First Responsiveness**: Every component is built with Tailwind's mobile-first breakpoints, ensuring a seamless experience on phones.

## 6. Security & Scalability

NoteSpy implements comprehensive security measures to protect against abuse and ensure reliable service:

### 🛡️ Rate Limiting
- **IP-based throttling** prevents abuse by limiting requests per user
- `/api/match-proxy`: 10 requests/minute (audio matching is resource-intensive)
- `/api/itunes-search`: 30 requests/minute
- Returns `429 Too Many Requests` with `Retry-After` header when exceeded
- Sliding window algorithm for smooth rate limiting

### 🌐 CORS Configuration
- Strict origin validation for API endpoints
- Allowed origins:
  - Production: `https://notespy.vercel.app`
  - Development: `localhost:3000`
  - Uptime monitoring services (UptimeRobot, Cronitor, BetterUptime)
  - Vercel preview deployments
- Preflight request caching (24 hours)

### ✅ Input Validation & Sanitization
- **Text inputs**: Length limits, character validation, HTML/script tag removal
- **Audio files**: Type validation (WAV, WebM, MP4, MP3), size limits (10MB max)
- **Filename sanitization**: Path traversal prevention, dangerous character removal
- Suspicious pattern detection (XSS attempts, event handlers)

### 🔒 Security Headers (via Middleware)
All responses include protective headers:
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-Frame-Options: DENY` - Clickjacking protection
- `X-XSS-Protection: 1; mode=block` - Legacy XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Referrer control
- `Permissions-Policy` - Restricts browser feature access
- `Content-Security-Policy` - XSS and injection prevention (production)

### ⏱️ Request Timeout Handling
- Backend requests timeout after 30 seconds
- iTunes API requests timeout after 10 seconds
- Prevents resource exhaustion from slow/stuck requests
- Returns `504 Gateway Timeout` with user-friendly message

### 📋 Structured Logging
- Request ID tracking for debugging
- Automatic sensitive data redaction (passwords, tokens, API keys)
- Safe error messages for clients (no internal details leaked)
- Log levels: debug, info, warn, error

### 📁 File Security
- Maximum upload size: 10MB
- Audio MIME type validation
- Minimum file size check (prevents empty uploads)
- Filename length limits (255 characters)

## 7. How to Run Locally
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

