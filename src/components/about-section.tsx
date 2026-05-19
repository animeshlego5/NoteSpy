"use client";

import React from "react";
import { Accordion } from "@/components/ui/accordion";
import { motion, Variants } from "framer-motion";


const transitionVariants: { item: Variants } = {
    item: {
        hidden: {
            opacity: 0,
            filter: "blur(12px)",
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            transition: {
                type: "spring",
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
};

const aboutItems = [
    {
        id: "what-is-notespy",
        title: "What is NoteSpy?",
        content: (
            <p>
                NoteSpy is a browser-based music recognition tool that lets you identify songs by either
                recording a short audio snippet or uploading an audio file. It focuses on fast matching,
                clean design, and privacy-friendly processing so you can quickly discover what you are
                listening to without extra friction.
            </p>
        ),
    },
    {
        id: "how-it-works",
        title: "How NoteSpy Works",
        content: (
            <p>
                NoteSpy converts your audio into a compact "fingerprint" representation using signal
                processing techniques. This fingerprint is then compared against a database of known song
                fingerprints using hash matching and time-offset alignment, returning the exact match along with a
                confidence score.
            </p>
        ),
    },
    {
        id: "technologies",
        title: "Technologies Behind the Scenes",
        content: (
            <p>
                The frontend is built with Next.js and React, styled with Tailwind CSS and ShadCN-based
                components for consistent, accessible UI elements like buttons, cards, and dialogs. The
                backend exposes a simple upload API that accepts recorded or uploaded audio, extracts
                features with audio-processing libraries, and runs a matching algorithm over stored song
                fingerprints.
            </p>
        ),
    },
    {
        id: "dsp-audio",
        title: "Digital Signal Processing",
        content: (
            <p>
                Under the hood, NoteSpy relies on audio fingerprinting concepts similar to those used in
                commercial music ID systems. It does not use machine learning; instead, it uses pure
                Digital Signal Processing (DSP). It transforms raw audio into a time–frequency spectrogram,
                extracts peak frequencies, and uses combinatorial hashing to find exact matches in the
                database. This design emphasizes robustness to noise and allows a track to be identified
                from just a few seconds of audio.
            </p>
        ),
    },
    {
        id: "design-interaction",
        title: "Design & Interaction",
        content: (
            <p>
                The interface uses animated hero text, scramble effects, and reactive hover gradients to
                give the project a modern, "alive" feel while keeping the core workflow—record, upload,
                match—clear and simple. Background effects such as animated boxes and carefully layered
                z-index stacking ensure the hero content remains readable while still feeling dynamic and
                immersive.
            </p>
        ),
    },
];

export default function AboutSection() {
    return (
        <section
            id="about"
            className="relative w-full py-20 md:py-32 overflow-hidden"
        >
            {/* Semi-transparent overlay for readability while keeping background visible */}
            <div className="absolute inset-0 -z-20 bg-black/70" />


            {/* Animated Gradient Blobs */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {/* Dark Blue Blob */}
                <div
                    className="absolute w-[600px] h-[600px] rounded-full opacity-40 blur-[120px]"
                    style={{
                        background: 'radial-gradient(circle, #1e3a5f 0%, transparent 70%)',
                        top: '20%',
                        left: '10%',
                        animation: 'floatBlue 20s ease-in-out infinite',
                    }}
                />
                {/* Dark Purple Blob */}
                <div
                    className="absolute w-[500px] h-[500px] rounded-full opacity-40 blur-[100px]"
                    style={{
                        background: 'radial-gradient(circle, #4c1d6e 0%, transparent 70%)',
                        top: '40%',
                        right: '10%',
                        animation: 'floatPurple 18s ease-in-out infinite',
                    }}
                />
                {/* Secondary Blue Blob */}
                <div
                    className="absolute w-[400px] h-[400px] rounded-full opacity-30 blur-[80px]"
                    style={{
                        background: 'radial-gradient(circle, #1a365d 0%, transparent 70%)',
                        bottom: '10%',
                        left: '30%',
                        animation: 'floatBlue2 22s ease-in-out infinite reverse',
                    }}
                />
                {/* Secondary Purple Blob */}
                <div
                    className="absolute w-[450px] h-[450px] rounded-full opacity-35 blur-[90px]"
                    style={{
                        background: 'radial-gradient(circle, #3b1963 0%, transparent 70%)',
                        bottom: '20%',
                        right: '25%',
                        animation: 'floatPurple2 24s ease-in-out infinite',
                    }}
                />
            </div>

            <style jsx>{`
        @keyframes floatBlue {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(50px, -30px) scale(1.1);
          }
          50% {
            transform: translate(20px, 40px) scale(0.95);
          }
          75% {
            transform: translate(-30px, 20px) scale(1.05);
          }
        }
        @keyframes floatPurple {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(-40px, 30px) scale(1.05);
          }
          50% {
            transform: translate(30px, -20px) scale(1.1);
          }
          75% {
            transform: translate(20px, 50px) scale(0.95);
          }
        }
        @keyframes floatBlue2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-40px, -20px) scale(1.08);
          }
          66% {
            transform: translate(30px, 30px) scale(0.92);
          }
        }
        @keyframes floatPurple2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(40px, 20px) scale(0.95);
          }
          66% {
            transform: translate(-20px, -30px) scale(1.1);
          }
        }
      `}</style>

            <div className="relative mx-auto max-w-4xl px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.15,
                                delayChildren: 0.1,
                            },
                        },
                    }}
                    className="flex flex-col gap-12"
                >
                    {/* Section Header */}
                    <motion.div
                        className="text-center"
                        variants={{
                            hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                            visible: {
                                opacity: 1,
                                y: 0,
                                filter: "blur(0px)",
                                transition: { duration: 0.8, ease: "easeOut" }
                            },
                        }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            About NoteSpy
                        </h2>
                        <p className="text-white/60 text-lg">
                            Everything you need to know about how we identify your music
                        </p>
                    </motion.div>

                    {/* Accordion */}
                    <motion.div
                        className="bg-white/5 rounded-2xl border border-white/10 p-6 md:p-10 backdrop-blur-sm"
                        variants={{
                            hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
                            visible: {
                                opacity: 1,
                                y: 0,
                                filter: "blur(0px)",
                                transition: { duration: 0.8, ease: "easeOut" }
                            },
                        }}
                    >
                        <Accordion items={aboutItems} />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

