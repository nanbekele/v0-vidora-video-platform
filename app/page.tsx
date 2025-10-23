import { createServerClient } from "@/lib/supabase/server"
import { VideoGrid } from "@/components/video-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function HomePage() {
  let supabase
  try {
    supabase = await createServerClient()
  } catch (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Configuration Required</h2>
          <p className="text-sm text-foreground mb-4">
            Supabase environment variables are not configured. Please add the following variables in the Vars section:
          </p>
          <ul className="text-sm space-y-2 mb-4 font-mono bg-background p-3 rounded">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            You can find these values in your Supabase dashboard under Settings → API
          </p>
        </div>
      </main>
    )
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: allVideos } = await supabase
    .from("videos")
    .select(`
      *,
      channels (
        id,
        name,
        user_id
      )
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(24)

  const profilesMap: Record<string, any> = {}
  if (allVideos && allVideos.length > 0) {
    const userIds = [...new Set(allVideos.map((v: any) => v.channels?.user_id).filter(Boolean))]

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds)

      profiles?.forEach((profile) => {
        profilesMap[profile.id] = profile
      })
    }
  }

  const videosWithProfiles =
    allVideos?.map((video: any) => ({
      ...video,
      channels: {
        ...video.channels,
        profiles: profilesMap[video.channels?.user_id] || { display_name: "Unknown", avatar_url: null },
      },
    })) || []

  let forYouVideos = null
  if (user) {
    // Get user's subscriptions
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("channel_id")
      .eq("subscriber_id", user.id)

    const channelIds = subscriptions?.map((sub) => sub.channel_id) || []

    if (channelIds.length > 0) {
      const { data: subscribedVideos } = await supabase
        .from("videos")
        .select(`
          *,
          channels (
            id,
            name,
            user_id
          )
        `)
        .in("channel_id", channelIds)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(24)

      forYouVideos =
        subscribedVideos?.map((video: any) => ({
          ...video,
          channels: {
            ...video.channels,
            profiles: profilesMap[video.channels?.user_id] || { display_name: "Unknown", avatar_url: null },
          },
        })) || null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Discover</h1>
          <p className="text-muted-foreground">Watch the latest videos from creators around the world</p>
        </div>

        {user && forYouVideos && forYouVideos.length > 0 ? (
          <Tabs defaultValue="for-you" className="space-y-6">
            <TabsList>
              <TabsTrigger value="for-you">For You</TabsTrigger>
              <TabsTrigger value="all">All Videos</TabsTrigger>
            </TabsList>

            <TabsContent value="for-you">
              <VideoGrid videos={forYouVideos} />
            </TabsContent>

            <TabsContent value="all">
              <VideoGrid videos={videosWithProfiles} />
            </TabsContent>
          </Tabs>
        ) : (
          <VideoGrid videos={videosWithProfiles} />
        )}
      </main>
    </div>
  )
}
