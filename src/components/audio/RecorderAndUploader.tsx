"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import SongCard, { SongMetadata } from "./SongCard";
import RecommendationsSection from "./RecommendationsSection";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square, Play, Pause, Volume2, VolumeX, RotateCcw, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const fadeIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as const, // easeInOut cubic bezier
};

interface RecorderAndUploaderProps {
  onShowTestSongs?: () => void;
}

type RecordingState = "idle" | "recording" | "recorded";

export default function RecorderAndUploader({ onShowTestSongs }: RecorderAndUploaderProps) {
  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);

  // Match state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [songMetadata, setSongMetadata] = useState<SongMetadata | null>(null);
  const [matchScore, setMatchScore] = useState<number | undefined>(undefined);
  const [matchedTitle, setMatchedTitle] = useState<string | null>(null);
  const [matchedArtist, setMatchedArtist] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openError, setOpenError] = useState(false);

  // Refs
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const MIN_RECORDING_SECONDS = 5;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start recording
  const startRecording = async () => {
    // Clear any previous results and abort pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setResult(null);
    setSongMetadata(null);
    setMatchScore(undefined);
    setMatchedTitle(null);
    setMatchedArtist(null);
    setLoading(false);

    setIsInitializing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/wav" });
        const file = new File([blob], `recording_${Date.now()}.wav`, {
          type: "audio/wav",
        });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioFile(file);
        setRecordingState("recorded");

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setRecordingDuration(0);
      setRecordingState("recording");

      // Start timer
      timerInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError("Could not access microphone. Please ensure microphone permissions are granted.");
      setOpenError(true);
    } finally {
      setIsInitializing(false);
    }
  };

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  }, []);

  // Record again
  const recordAgain = () => {
    // Abort any pending match request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setAudioFile(null);
    setRecordingDuration(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setLoading(false);
    setResult(null);
    setSongMetadata(null);
    setMatchedTitle(null);
    setMatchedArtist(null);
    setMatchScore(undefined);
    setRecordingState("idle");
  };

  // Audio player controls
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioURL]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  // iTunes metadata fetch
  const fetchItunesMetadata = async (title: string, artist: string) => {
    try {
      const params = new URLSearchParams({ title, artist });
      const response = await fetch(`/api/itunes-search?${params}`);

      if (!response.ok) {
        console.error("iTunes API error:", response.statusText);
        return null;
      }

      const data = await response.json();

      if (data.found) {
        return data as SongMetadata;
      }
      return null;
    } catch (err) {
      console.error("Error fetching iTunes metadata:", err);
      return null;
    }
  };

  // Upload and match
  const handleFindMatch = async () => {
    if (!audioFile) {
      setError("No recording available.");
      setOpenError(true);
      return;
    }

    setLoading(true);
    setResult(null);
    setSongMetadata(null);
    setMatchScore(undefined);
    setMatchedTitle(null);
    setMatchedArtist(null);
    setError(null);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("file", audioFile);

      const response = await fetch("/api/match-proxy", {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      // Clear the abort controller after successful fetch
      abortControllerRef.current = null;

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.match) {
        setMatchScore(data.score);
        setMatchedTitle(data.title);
        setMatchedArtist(data.artist);
        const metadata = await fetchItunesMetadata(data.title, data.artist);

        if (metadata) {
          setSongMetadata(metadata);
        } else {
          setResult(
            `Match found: ${data.title} by ${data.artist} (score: ${data.score})`
          );
        }
      } else {
        setResult(`No suitable match found.\nPlease check the available test songs and try a longer or clearer audio sample.`);
        if (onShowTestSongs) {
          onShowTestSongs();
        }
      }
    } catch (err: unknown) {
      // Ignore abort errors (user clicked Record Again)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  const canStopRecording = recordingDuration >= MIN_RECORDING_SECONDS;

  return (
    <div className="flex flex-col items-center w-full space-y-6">
      {/* Hidden audio element for playback */}
      {audioURL && (
        <audio ref={audioRef} src={audioURL} preload="metadata" />
      )}

      {/* IDLE STATE - Start Recording Button */}
      <AnimatePresence mode="wait">
        {recordingState === "idle" && (
          <motion.div
            key="idle"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeInUp}
            transition={transition}
          >
            <Button
              onClick={startRecording}
              size="lg"
              disabled={isInitializing}
              className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl hover:from-blue-700 hover:to-violet-700 transition-all duration-300 shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:shadow-[0_0_35px_rgba(37,99,235,0.7)] disabled:opacity-50"
            >
              {isInitializing ? (
                <span className="flex items-center gap-3">
                  <span className="animate-spin">⏳</span>
                  Initializing...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Mic className="w-5 h-5" />
                  Start Recording
                </span>
              )}
            </Button>
          </motion.div>
        )}

        {/* RECORDING STATE - Stop Recording with Live Timer */}
        {recordingState === "recording" && (
          <motion.div
            key="recording"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeInUp}
            transition={transition}
            className="flex flex-col items-center gap-4"
          >
            {/* Live Recording Indicator */}
            <div className="flex items-center gap-3 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-full">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-red-400 font-mono text-lg font-semibold">
                {formatTime(recordingDuration)}
              </span>
            </div>

            {/* Stop Recording Button */}
            <Button
              onClick={stopRecording}
              size="lg"
              disabled={!canStopRecording}
              className={`px-8 py-4 text-lg rounded-xl transition-all duration-300 ${canStopRecording
                ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-[0_0_25px_rgba(220,38,38,0.5)] hover:shadow-[0_0_35px_rgba(220,38,38,0.7)]"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                }`}
            >
              <span className="flex items-center gap-3">
                <Square className="w-5 h-5" />
                Stop Recording
              </span>
            </Button>

            {/* Minimum duration hint */}
            {!canStopRecording && (
              <p className="text-sm text-zinc-400">
                Record at least {MIN_RECORDING_SECONDS} seconds ({MIN_RECORDING_SECONDS - recordingDuration}s remaining)
              </p>
            )}
          </motion.div>
        )}

        {/* RECORDED STATE - Audio Player + Actions */}
        {recordingState === "recorded" && (
          <motion.div
            key="recorded"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeInUp}
            transition={transition}
            className="w-full max-w-md space-y-4"
          >
            {/* Custom Audio Player */}
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-4 space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div
                  ref={progressRef}
                  onClick={handleProgressClick}
                  className="relative h-2 bg-zinc-700 rounded-full cursor-pointer group"
                >
                  <div
                    className="absolute h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all"
                    style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: duration > 0 ? `calc(${(currentTime / duration) * 100}% - 8px)` : "0%" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-400 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-blue-500 to-violet-500 rounded-full hover:from-blue-600 hover:to-violet-600 transition-all shadow-lg hover:shadow-xl"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-1" />
                  )}
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <div className="relative w-20 h-2 flex items-center group">
                    {/* Background Track */}
                    <div className="absolute w-full h-full bg-zinc-700 rounded-full pointer-events-none" />
                    
                    {/* Gradient Fill */}
                    <div
                      className="absolute h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all pointer-events-none"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                    
                    {/* Hover Thumb */}
                    <div
                      className="absolute w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)` }}
                    />
                    
                    {/* Invisible Native Input overlay */}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={recordAgain}
                variant="outline"
                size="lg"
                className="flex-1 py-3 border-zinc-600 bg-zinc-800/50 hover:bg-zinc-700/50 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Record Again
              </Button>
              <Button
                onClick={handleFindMatch}
                size="lg"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_rgba(124,58,237,0.7)]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Matching...
                  </span>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Match
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rich Song Card with iTunes metadata */}
      <AnimatePresence>
        {songMetadata && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <SongCard metadata={songMetadata} matchScore={matchScore} volume={volume} isMuted={isMuted} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback text result (when iTunes fails or no match) */}
      <AnimatePresence>
        {result && !songMetadata && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Card className="max-w-lg border-primary/20 bg-primary/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-primary">Song Match Result</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-lg whitespace-pre-line">{result}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations Section */}
      <AnimatePresence>
        {matchedTitle && matchedArtist && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <RecommendationsSection title={matchedTitle} artist={matchedArtist} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error as Alert Dialog */}
      <AlertDialog open={openError} onOpenChange={setOpenError}>
        <AlertDialogContent className="border-destructive/50 bg-destructive/10 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              Error
            </AlertDialogTitle>
            <AlertDialogDescription className="text-destructive-foreground/90 font-medium">
              {error}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={() => setOpenError(false)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            OK
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
