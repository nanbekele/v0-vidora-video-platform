"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createVideo(formData: {
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  duration: number
}) {
  const supabase = await createServerClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  // Check if user has a channel, create one if not
  const { data: existingChannel } = await supabase.from("channels").select("id").eq("user_id", user.id).single()

  let channelId = existingChannel?.id

  if (!channelId) {
    // Get user profile for channel name
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single()

    // Create channel
    const { data: newChannel, error: channelError } = await supabase
      .from("channels")
      .insert({
        user_id: user.id,
        name: profile?.display_name || "My Channel",
        description: "Welcome to my channel!",
      })
      .select("id")
      .single()

    if (channelError) {
      console.error("Error creating channel:", channelError)
      return { error: "Failed to create channel" }
    }

    channelId = newChannel.id
  }

  // Create video record
  const { data: video, error: videoError } = await supabase
    .from("videos")
    .insert({
      channel_id: channelId,
      title: formData.title,
      description: formData.description,
      video_url: formData.videoUrl,
      thumbnail_url: formData.thumbnailUrl,
      duration: formData.duration,
      status: "published",
    })
    .select()
    .single()

  if (videoError) {
    console.error("Error creating video:", videoError)
    return { error: "Failed to create video" }
  }

  revalidatePath("/")
  return { success: true, video }
}
