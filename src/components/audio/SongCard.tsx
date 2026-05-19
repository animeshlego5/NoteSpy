"use client";

import { useState, useRef, useEffect } from "react";
import TiltedCard from "@/components/ui/tilted-card";
import { Button } from "@/components/ui/button";
import { Play, Pause, ExternalLink } from "lucide-react";

export interface SongMetadata {
    trackId: number;
    title: string;
    artist: string;
    album: string;
    artworkUrl: string;
    previewUrl: string;
    trackViewUrl: string;
}

interface SongCardProps {
    metadata: SongMetadata;
    matchScore?: number;
    volume?: number;
    isMuted?: boolean;
}

export default function SongCard({ metadata, matchScore, volume = 0.75, isMuted = false }: SongCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Sync volume and mute state with the preview audio element
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
            audioRef.current.muted = isMuted;
        }
    }, [volume, isMuted]);

    const handlePlayPause = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio(metadata.previewUrl);
            audioRef.current.volume = isMuted ? 0 : volume;
            audioRef.current.muted = isMuted;
            audioRef.current.addEventListener("ended", () => setIsPlaying(false));
        }

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Simplified overlay with just song name and artist on glass background
    const overlayContent = (
        <div className="song-info-glass">
            <h3 className="song-title">{metadata.title}</h3>
            <p className="song-artist">{metadata.artist}</p>
        </div>
    );

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
            <TiltedCard
                imageSrc={metadata.artworkUrl}
                altText={`${metadata.title} by ${metadata.artist}`}
                captionText={`${metadata.title} - ${metadata.artist}`}
                containerHeight="350px"
                containerWidth="100%"
                imageHeight="300px"
                imageWidth="300px"
                scaleOnHover={1.05}
                rotateAmplitude={12}
                showMobileWarning={false}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={overlayContent}
            />

            {/* Match percentage displayed below the card */}
            {matchScore !== undefined && (
                <p className="text-white text-lg font-medium">
                    Match: {Math.min(100, Math.round(matchScore * 100))}%
                </p>
            )}

            {/* Action buttons below the card */}
            <div className="flex gap-3">
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={handlePlayPause}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                >
                    {isPlaying ? (
                        <Pause className="w-4 h-4" />
                    ) : (
                        <Play className="w-4 h-4" />
                    )}
                    <span className="ml-1">{isPlaying ? "Pause" : "Preview"}</span>
                </Button>
                <Button
                    size="sm"
                    variant="secondary"
                    asChild
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                >
                    <a
                        href={metadata.trackViewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span className="ml-1">iTunes</span>
                    </a>
                </Button>
            </div>
        </div>
    );
}
