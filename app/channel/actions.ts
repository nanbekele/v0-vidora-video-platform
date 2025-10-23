"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateChannel(data: { name: string; description: string }) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  // Get user's channel
  const { data: channel } = await supabase.from("channels").select("id").eq("user_id", user.id).single()

  if (!channel) {
    return { error: "Channel not found" }
  }

  const { error } = await supabase.from("channels").update(data).eq("id", channel.id)

  if (error) {
    console.error("Channel update error:", error)
    return { error: "Failed to update channel" }
  }

  revalidatePath("/channel")
  return { success: true }
}
