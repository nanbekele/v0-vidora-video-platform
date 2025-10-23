"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function subscribeToChannel(channelId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase.from("subscriptions").insert({
    subscriber_id: user.id,
    channel_id: channelId,
  })

  if (error) {
    console.error("Subscribe error:", error)
    return { error: "Failed to subscribe" }
  }

  // Increment subscriber count
  await supabase.rpc("increment_subscriber_count", { channel_id: channelId })

  revalidatePath("/watch/[id]")
  return { success: true }
}

export async function unsubscribeFromChannel(channelId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("subscriber_id", user.id)
    .eq("channel_id", channelId)

  if (error) {
    console.error("Unsubscribe error:", error)
    return { error: "Failed to unsubscribe" }
  }

  // Decrement subscriber count
  await supabase.rpc("decrement_subscriber_count", { channel_id: channelId })

  revalidatePath("/watch/[id]")
  return { success: true }
}

export async function addComment(videoId: string, content: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      video_id: videoId,
      user_id: user.id,
      content,
    })
    .select(`
      *,
      profiles (
        display_name,
        avatar_url
      )
    `)
    .single()

  if (error) {
    console.error("Comment error:", error)
    return { error: "Failed to add comment" }
  }

  revalidatePath("/watch/[id]")
  return { success: true, comment }
}

export async function likeVideo(videoId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .single()

  if (existingLike) {
    return { error: "Already liked" }
  }

  const { error } = await supabase.from("likes").insert({
    user_id: user.id,
    video_id: videoId,
  })

  if (error) {
    console.error("Like error:", error)
    return { error: "Failed to like video" }
  }

  // Increment like count
  await supabase.rpc("increment_video_likes", { video_id: videoId })

  revalidatePath("/watch/[id]")
  return { success: true }
}

export async function unlikeVideo(videoId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase.from("likes").delete().eq("user_id", user.id).eq("video_id", videoId)

  if (error) {
    console.error("Unlike error:", error)
    return { error: "Failed to unlike video" }
  }

  // Decrement like count
  await supabase.rpc("decrement_video_likes", { video_id: videoId })

  revalidatePath("/watch/[id]")
  return { success: true }
}
