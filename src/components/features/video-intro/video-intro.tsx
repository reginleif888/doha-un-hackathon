import { useState, useRef, useCallback, useEffect } from "react";
import { PlayIcon, PauseIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/shared/lib/cn";

interface VideoIntroProps {
  src: string;
  className?: string;
}

export const VideoIntro = ({ src, className }: VideoIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Size configuration
  const size = 300;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Button size (w-20 = 80px, so radius is 40px, add 10px padding)
  const buttonRadius = 50;

  // Calculate angle from click position (returns 0-1 percentage)
  const calculateAnglePercentage = useCallback(
    (clientX: number, clientY: number): number | null => {
      const container = containerRef.current;
      if (!container) return null;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      // Calculate distance from center
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Check if click is in the seekable area (outside button, inside circle)
      const outerRadius = size / 2;
      if (distance < buttonRadius || distance > outerRadius) {
        return null;
      }

      // Calculate angle from top (12 o'clock = 0)
      // atan2 returns angle from positive X axis, we want from negative Y axis
      let angle = Math.atan2(deltaX, -deltaY);

      // Normalize to 0-2π
      if (angle < 0) {
        angle += 2 * Math.PI;
      }

      // Convert to percentage (0-1)
      return angle / (2 * Math.PI);
    },
    [size, buttonRadius]
  );

  // Seek video to percentage
  const seekToPercentage = useCallback((percentage: number) => {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration)) return;

    const newTime = percentage * video.duration;
    video.currentTime = newTime;
    setProgress(percentage * 100);
  }, []);

  // Handle pointer down (mouse or touch)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isPlaying) return;

      const percentage = calculateAnglePercentage(e.clientX, e.clientY);

      if (percentage !== null) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        seekToPercentage(percentage);

        // Capture pointer for drag tracking
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [isPlaying, calculateAnglePercentage, seekToPercentage]
  );

  // Handle pointer move (drag)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Calculate angle even if outside the circle (for smooth dragging)
      let angle = Math.atan2(deltaX, -deltaY);
      if (angle < 0) {
        angle += 2 * Math.PI;
      }

      const percentage = angle / (2 * Math.PI);
      seekToPercentage(percentage);
    },
    [isDragging, seekToPercentage]
  );

  // Handle pointer up (end drag)
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging) {
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      }
    },
    [isDragging]
  );

  // Update progress bar from video time
  const handleTimeUpdate = useCallback(() => {
    if (isDragging) return;
    const video = videoRef.current;
    if (video && video.duration && !isNaN(video.duration)) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  }, [isDragging]);

  // Handle video end
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, []);

  // Play video
  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = false;
      await video.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Play failed:", err);
      // If autoplay fails due to browser policy, try muted
      if (err instanceof Error && err.name === "NotAllowedError") {
        try {
          video.muted = true;
          await video.play();
          setIsPlaying(true);
          console.warn("Video started muted due to browser autoplay policy");
        } catch (mutedErr) {
          console.error("Muted play also failed:", mutedErr);
        }
      }
    }
  }, []);

  // Pause video
  const pause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setIsPlaying(false);
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    },
    [isPlaying, play, pause]
  );

  // Cleanup
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) {
        video.pause();
      }
    };
  }, []);

  const controlsVisible = showControls || !isPlaying;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("flex justify-center py-4", className)}>
      <div
        ref={containerRef}
        className={cn("relative touch-none", isPlaying && "cursor-pointer")}
        style={{ width: size, height: size }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isDragging && setShowControls(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Glow effect */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 blur-xl -z-10 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* Progress Ring */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ transform: "rotate(-90deg)" }}
          width={size}
          height={size}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          {/* Progress indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={isDragging ? strokeWidth + 2 : strokeWidth}
            strokeLinecap="round"
            className={cn(
              "text-primary",
              isDragging && "drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]"
            )}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {/* Video Container */}
        <div
          className="absolute rounded-full overflow-hidden bg-black pointer-events-none"
          style={{
            top: strokeWidth,
            left: strokeWidth,
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
          }}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-cover"
            playsInline
            preload="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />

          {/* Dark overlay when controls visible */}
          <AnimatePresence>
            {controlsVisible && (
              <motion.div
                className="absolute inset-0 bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Play/Pause Button - centered, with pointer-events */}
        <AnimatePresence>
          {controlsVisible && (
            <motion.button
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl cursor-pointer z-10"
              style={{ pointerEvents: "auto" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={togglePlay}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <PauseIcon className="w-10 h-10 text-primary" />
              ) : (
                <PlayIcon className="w-10 h-10 text-primary ml-1" />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Visual feedback ring when dragging */}
        {isDragging && (
          <div className="absolute inset-0 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background pointer-events-none" />
        )}
      </div>
    </div>
  );
};
