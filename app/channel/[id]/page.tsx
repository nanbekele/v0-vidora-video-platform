import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { VideoGrid } from "@/components/video-grid"
import { Button } from "@/components/ui/button"
import { Users, Video } from "lucide-react"

interface ChannelPageProps {
  params: Promise<{ id: string }>
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

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  // Get channel info
  const { data: channel, error } = await supabase
    .from("channels")
    .select(`
      *,
      profiles (
        display_name,
        bio,
        avatar_url
      )
    `)
    .eq("id", id)
    .single()

  if (error || !channel) {
    notFound()
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user is subscribed
  let isSubscribed = false
  if (user) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("subscriber_id", user.id)
      .eq("channel_id", id)
      .single()

    isSubscribed = !!subscription
  }

  // Get channel videos
  const { data: videos } = await supabase
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
    .eq("channel_id", id)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  // Count total videos
  const { count: videoCount } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true })
    .eq("channel_id", id)
    .eq("status", "published")

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Channel Header */}
        <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-4xl font-bold flex-shrink-0">
              {channel.profiles.display_name?.[0] || channel.name[0]}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">{channel.name}</h1>
                <p className="text-muted-foreground">{channel.profiles.display_name}</p>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{formatNumber(channel.subscriber_count)} subscribers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>{videoCount || 0} videos</span>
                </div>
              </div>

              {channel.description && <p className="text-foreground">{channel.description}</p>}

              {channel.profiles.bio && <p className="text-sm text-muted-foreground">{channel.profiles.bio}</p>}
            </div>

            {user && user.id !== channel.user_id && (
              <Button variant={isSubscribed ? "outline" : "default"} size="lg">
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            )}
          </div>
        </div>

        {/* Videos */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Videos</h2>
          {videos && videos.length > 0 ? (
            <VideoGrid videos={videos} />
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">This channel hasn't uploaded any videos yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
