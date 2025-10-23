import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Eye } from "lucide-react"

interface VideoCardProps {
  video: {
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
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
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

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/watch/${video.id}`} className="group">
      <div className="space-y-3">
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
          <img
            src={video.thumbnail_url || "/placeholder.svg"}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>

        {/* Video info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{video.channels.profiles.display_name || video.channels.name}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{formatViews(video.views)} views</span>
            </div>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
