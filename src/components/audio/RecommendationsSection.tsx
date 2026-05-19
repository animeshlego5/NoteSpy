"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Music } from "lucide-react";

interface Recommendation {
    title: string;
    artist: string;
    lastfm_url: string;
    match_score: string;
}

interface RecommendationsSectionProps {
    title: string;
    artist: string;
}

export default function RecommendationsSection({ title, artist }: RecommendationsSectionProps) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!title || !artist) return;

        let cancelled = false;
        const fetchRecommendations = async () => {
            setLoading(true);
            setError(false);
            setRecommendations([]);

            try {
                const params = new URLSearchParams({ title, artist });
                const response = await fetch(`/api/recommendations-proxy?${params}`);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                if (!cancelled && data.recommendations?.length > 0) {
                    setRecommendations(data.recommendations);
                } else if (!cancelled) {
                    // No recommendations found — silently hide
                    setError(true);
                }
            } catch {
                if (!cancelled) {
                    setError(true);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchRecommendations();
        return () => { cancelled = true; };
    }, [title, artist]);

    // Don't render anything if there was an error or no results
    if (error && !loading) return null;

    return (
        <div className="w-full max-w-md mx-auto mt-8">
            <AnimatePresence mode="wait">
                {loading ? (
                    /* Loading Skeleton */
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                    >
                        {/* Section title skeleton */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 rounded bg-white/10 animate-pulse" />
                            <div className="h-5 w-56 rounded bg-white/10 animate-pulse" />
                        </div>

                        {/* Card skeletons */}
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                            >
                                <div className="w-10 h-10 rounded-lg bg-white/10 animate-pulse flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 rounded bg-white/10 animate-pulse" />
                                    <div className="h-3 w-1/2 rounded bg-white/[0.06] animate-pulse" />
                                </div>
                                <div className="w-8 h-4 rounded-full bg-white/[0.06] animate-pulse" />
                            </div>
                        ))}
                    </motion.div>
                ) : recommendations.length > 0 ? (
                    /* Populated recommendations */
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className="space-y-3"
                    >
                        {/* Section title */}
                        <div className="flex items-center gap-2 mb-4">
                            <Music className="w-4 h-4 text-violet-400" />
                            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                                Similar Songs you might like
                            </h3>
                        </div>

                        {recommendations.map((rec, index) => {
                            const scorePercent = Math.round(parseFloat(rec.match_score) * 100);

                            return (
                                <motion.a
                                    key={`${rec.title}-${rec.artist}-${index}`}
                                    href={rec.lastfm_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.08,
                                        ease: [0.4, 0, 0.2, 1],
                                    }}
                                    className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-300 cursor-pointer"
                                >
                                    {/* Icon */}
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:from-violet-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                                        <Music className="w-4 h-4 text-violet-400" />
                                    </div>

                                    {/* Song info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate group-hover:text-violet-200 transition-colors duration-200">
                                            {rec.title}
                                        </p>
                                        <p className="text-xs text-white/50 truncate">
                                            {rec.artist}
                                        </p>
                                    </div>

                                    {/* Match score badge */}
                                    {!isNaN(scorePercent) && (
                                        <span className="text-[10px] font-mono font-medium text-violet-300/70 bg-violet-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                            {scorePercent}%
                                        </span>
                                    )}

                                    {/* External link icon */}
                                    <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors duration-200 flex-shrink-0" />
                                </motion.a>
                            );
                        })}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
