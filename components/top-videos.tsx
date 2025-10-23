import Link from "next/link"
import { Eye, ThumbsUp } from "lucide-react"

interface TopVideosProps {
  videos: Array<{
    id: string
    title: string
    thumbnail_url: string
    views: number
    likes: number
  }>
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function TopVideos({ videos }: TopVideosProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No videos yet. Upload your first video to see analytics!
      </div>
    )
  }

  // Sort by views and take top 5
  const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 5)

  return (
    <div className="space-y-4">
      {topVideos.map((video, index) => (
        <Link
          key={video.id}
          href={`/watch/${video.id}`}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors group"
        >
          <div className="text-2xl font-bold text-muted-foreground w-8 text-center">{index + 1}</div>

          <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <img
              src={video.thumbnail_url || "/placeholder.svg"}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{formatNumber(video.views)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                <span>{formatNumber(video.likes)}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
