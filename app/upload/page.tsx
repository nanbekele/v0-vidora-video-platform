import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { VideoUploadForm } from "@/components/video-upload-form"

export default async function UploadPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/upload")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Upload Video</h1>
          <p className="text-muted-foreground">Share your content with the Vidora community</p>
        </div>

        <VideoUploadForm />
      </div>
    </div>
  )
}
