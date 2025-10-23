"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Share2, Eye } from "lucide-react"
import { subscribeToChannel, unsubscribeFromChannel, likeVideo, unlikeVideo } from "@/app/watch/[id]/actions"
import { ShareDialog } from "@/components/share-dialog"

interface VideoInfoProps {
  video: {
    id: string
    title: string
    description: string | null
    views: number
    likes: number
    created_at: string
  }
  channel: {
    id: string
    name: string
    subscriber_count: number
    profiles: {
      display_name: string
      avatar_url: string | null
    }
  }
  isSubscribed: boolean
  hasLiked: boolean
  currentUserId?: string
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

export function VideoInfo({
  video,
  channel,
  isSubscribed: initialIsSubscribed,
  hasLiked: initialHasLiked,
  currentUserId,
}: VideoInfoProps) {
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed)
  const [subscriberCount, setSubscriberCount] = useState(channel.subscriber_count)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLiked, setHasLiked] = useState(initialHasLiked)
  const [likeCount, setLikeCount] = useState(video.likes)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  const handleSubscribe = async () => {
    if (!currentUserId) {
      window.location.href = "/auth/login?redirect=/watch/" + video.id
      return
    }

    setIsLoading(true)
    try {
      if (isSubscribed) {
        await unsubscribeFromChannel(channel.id)
        setIsSubscribed(false)
        setSubscriberCount((prev) => prev - 1)
      } else {
        await subscribeToChannel(channel.id)
        setIsSubscribed(true)
        setSubscriberCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Subscription error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!currentUserId) {
      window.location.href = "/auth/login?redirect=/watch/" + video.id
      return
    }

    setIsLikeLoading(true)
    try {
      if (hasLiked) {
        await unlikeVideo(video.id)
        setHasLiked(false)
        setLikeCount((prev) => prev - 1)
      } else {
        await likeVideo(video.id)
        setHasLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Like error:", error)
    } finally {
      setIsLikeLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground">{video.title}</h1>

      {/* Stats and actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{formatViews(video.views)} views</span>
          </div>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={hasLiked ? "default" : "outline"} size="sm" onClick={handleLike} disabled={isLikeLoading}>
            <ThumbsUp className="h-4 w-4 mr-2" />
            {formatViews(likeCount)}
          </Button>
          <Button variant="outline" size="sm">
            <ThumbsDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Channel info */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
            {channel.profiles.display_name?.[0] || channel.name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{channel.profiles.display_name || channel.name}</h3>
            <p className="text-sm text-muted-foreground">{formatViews(subscriberCount)} subscribers</p>
          </div>
        </div>

        <Button onClick={handleSubscribe} disabled={isLoading} variant={isSubscribed ? "outline" : "default"}>
          {isSubscribed ? "Subscribed" : "Subscribe"}
        </Button>
      </div>

      {/* Description */}
      {video.description && (
        <div className="p-4 rounded-xl bg-muted">
          <p className="text-sm text-foreground whitespace-pre-wrap">{video.description}</p>
        </div>
      )}

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        videoId={video.id}
        videoTitle={video.title}
      />
    </div>
  )
}
