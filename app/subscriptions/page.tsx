import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { VideoGrid } from "@/components/video-grid"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users } from "lucide-react"

export default async function SubscriptionsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/subscriptions")
  }

  // Get user's subscriptions
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select(`
      channel_id,
      channels (
        id,
        name,
        profiles (
          display_name,
          avatar_url
        )
      )
    `)
    .eq("subscriber_id", user.id)

  const channelIds = subscriptions?.map((sub) => sub.channel_id) || []

  // Get videos from subscribed channels
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
    .in("channel_id", channelIds.length > 0 ? channelIds : [""])
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(24)

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Subscriptions</h1>
          <p className="text-muted-foreground">Videos from channels you follow</p>
        </div>

        {/* Subscribed Channels */}
        {subscriptions && subscriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Your Channels</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {subscriptions.map((sub) => (
                <Link
                  key={sub.channel_id}
                  href={`/channel/${sub.channel_id}`}
                  className="flex flex-col items-center gap-2 min-w-[100px] group"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-2xl font-bold group-hover:scale-105 transition-transform">
                    {sub.channels.profiles.display_name?.[0] || sub.channels.name[0]}
                  </div>
                  <span className="text-sm text-center text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {sub.channels.profiles.display_name || sub.channels.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Videos Feed */}
        {videos && videos.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Latest Videos</h2>
            <VideoGrid videos={videos} />
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center space-y-4">
              <Users className="h-16 w-16 mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">No subscriptions yet</h3>
                <p className="text-muted-foreground">Subscribe to channels to see their latest videos here</p>
              </div>
              <Button asChild>
                <Link href="/">Explore Videos</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
