import { VideoCard } from "@/components/video-card"

interface Video {
  id: string
  title: string
  thumbnail_url: string
  duration: number
  views: number
  created_at: string
  channels: {
    id: string
    name: string
    profiles: {
      display_name: string
      avatar_url: string | null
    }
  }
}

interface VideoGridProps {
  videos: Video[]
}

export function VideoGrid({ videos }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">No videos yet. Be the first to upload!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}
