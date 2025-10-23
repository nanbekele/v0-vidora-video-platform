"use client"

import { useRef, useState } from "react"

interface VideoPlayerProps {
  videoUrl: string
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full h-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
