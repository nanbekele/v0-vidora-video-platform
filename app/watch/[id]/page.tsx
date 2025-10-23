import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { VideoPlayer } from "@/components/video-player"
import { VideoInfo } from "@/components/video-info"
import { CommentSection } from "@/components/comment-section"
import { RelatedVideos } from "@/components/related-videos"

interface WatchPageProps {
  params: Promise<{ id: string }>
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  // Fetch video with channel info
  const { data: video, error } = await supabase
    .from("videos")
    .select(`
      *,
      channels (
        id,
        name,
        description,
        subscriber_count,
        user_id,
        profiles (
          display_name,
          avatar_url
        )
      )
    `)
    .eq("id", id)
    .eq("status", "published")
    .single()

  if (error || !video) {
    notFound()
  }

  // Increment view count
  await supabase.rpc("increment_video_views", { video_id: id })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user is subscribed to this channel
  let isSubscribed = false
  let hasLiked = false
  if (user) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("subscriber_id", user.id)
      .eq("channel_id", video.channels.id)
      .single()

    isSubscribed = !!subscription

    const { data: like } = await supabase.from("likes").select("id").eq("user_id", user.id).eq("video_id", id).single()

    hasLiked = !!like
  }

  // Fetch related videos
  const { data: relatedVideos } = await supabase
    .from("videos")
    .select(`
      *,
      channels (
        id,
        name,
        profiles (
          display_name,
          avatar_url
        )
      )
    `)
    .eq("status", "published")
    .neq("id", id)
    .limit(10)

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <VideoPlayer videoUrl={video.video_url} />
            <VideoInfo
              video={video}
              channel={video.channels}
              isSubscribed={isSubscribed}
              hasLiked={hasLiked}
              currentUserId={user?.id}
            />
            <CommentSection videoId={video.id} currentUserId={user?.id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <RelatedVideos videos={relatedVideos || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
