"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="relative w-full py-6">
            {/* Vignette gradient - extends above footer for smooth transition */}
            <div
                className="absolute -top-32 left-0 right-0 h-32 z-[1]"
                style={{
                    background: 'linear-gradient(to bottom, transparent 0%, #000000 100%)',
                }}
            />
            {/* Solid black background */}
            <div className="absolute inset-0 z-0 bg-black" />

            <div className="relative z-10 max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Branding & License */}
                    <div className="text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-2">NoteSpy</h3>
                        <p className="text-white/50 text-sm">
                            Open source music recognition for the web.
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                            Released under the MIT License
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="https://github.com/animeshlego5/NoteSpy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span className="text-sm font-medium">GitHub</span>
                        </Link>

                        <Link
                            href="https://animeshlego5.github.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium">Portfolio</span>
                        </Link>
                    </div>
                </div>

                {/* Copyright & Status */}
                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-white/40 text-xs text-center md:text-left">
                        © {new Date().getFullYear()} Animesh Gosain. Built with Next.js & Tailwind CSS.
                    </p>

                    <a
                        href="mailto:animeshlego5@gmail.com"
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-white/60 text-xs font-medium group-hover:text-white transition-colors">
                            Open to Internships
                        </span>
                    </a>
                </div>
            </div>
        </footer>
    );
}
