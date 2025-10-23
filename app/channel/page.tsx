import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { ChannelEditForm } from "@/components/channel-edit-form"
import { VideoGrid } from "@/components/video-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function MyChannelPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/channel")
  }

  // Get user's channel
  const { data: channel } = await supabase.from("channels").select("*").eq("user_id", user.id).single()

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
    .eq("channel_id", channel?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Channel</h1>
          <p className="text-muted-foreground">Manage your channel and videos</p>
        </div>

        <Tabs defaultValue="videos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="settings">Channel Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-6">
            {videos && videos.length > 0 ? (
              <VideoGrid videos={videos} />
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <p className="text-muted-foreground">You haven't uploaded any videos yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Channel Settings</CardTitle>
                <CardDescription>Customize your channel information</CardDescription>
              </CardHeader>
              <CardContent>
                <ChannelEditForm channel={channel} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
