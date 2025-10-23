import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Eye } from "lucide-react"

interface RelatedVideo {
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

interface RelatedVideosProps {
  videos: RelatedVideo[]
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`
  }
  return views.toString()
}

export function RelatedVideos({ videos }: RelatedVideosProps) {
  if (videos.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Related Videos</h2>
      <div className="space-y-3">
        {videos.map((video) => (
          <Link key={video.id} href={`/watch/${video.id}`} className="flex gap-3 group">
            <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img
                src={video.thumbnail_url || "/placeholder.svg"}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                {formatDuration(video.duration)}
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {video.channels.profiles.display_name || video.channels.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{formatViews(video.views)}</span>
                </div>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
