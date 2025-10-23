import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, ThumbsUp, Users, Video } from "lucide-react"
import { AnalyticsChart } from "@/components/analytics-chart"
import { TopVideos } from "@/components/top-videos"

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export default async function AnalyticsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/analytics")
  }

  // Get user's channel
  const { data: channel } = await supabase.from("channels").select("*").eq("user_id", user.id).single()

  if (!channel) {
    redirect("/upload")
  }

  // Get channel videos
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("channel_id", channel.id)
    .order("created_at", { ascending: false })

  // Calculate total stats
  const totalViews = videos?.reduce((sum, video) => sum + video.views, 0) || 0
  const totalLikes = videos?.reduce((sum, video) => sum + video.likes, 0) || 0
  const totalVideos = videos?.length || 0

  // Get views data for chart (last 30 days)
  const { data: viewsData } = await supabase
    .from("views")
    .select("created_at")
    .in("video_id", videos?.map((v) => v.id) || [])
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: true })

  // Group views by date
  const viewsByDate = viewsData?.reduce(
    (acc, view) => {
      const date = new Date(view.created_at).toLocaleDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Convert to chart data
  const chartData = Object.entries(viewsByDate || {}).map(([date, views]) => ({
    date,
    views,
  }))

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track your channel's performance and growth</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalViews)}</div>
              <p className="text-xs text-muted-foreground">Across all videos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(channel.subscriber_count)}</div>
              <p className="text-xs text-muted-foreground">Channel subscribers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalLikes)}</div>
              <p className="text-xs text-muted-foreground">Across all videos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVideos}</div>
              <p className="text-xs text-muted-foreground">Published videos</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Views Over Time</CardTitle>
              <CardDescription>Daily views for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart data={chartData} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Performing Videos</CardTitle>
              <CardDescription>Your most viewed videos</CardDescription>
            </CardHeader>
            <CardContent>
              <TopVideos videos={videos || []} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
