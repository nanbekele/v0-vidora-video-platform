"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { display_name: string; bio: string }) {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase.from("profiles").update(data).eq("id", user.id)

  if (error) {
    console.error("Profile update error:", error)
    return { error: "Failed to update profile" }
  }

  revalidatePath("/profile")
  return { success: true }
}
