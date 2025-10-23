import { createServerClient } from "@/lib/supabase/server"
import { CommentList } from "@/components/comment-list"

interface CommentSectionProps {
  videoId: string
  currentUserId?: string
}

export async function CommentSection({ videoId, currentUserId }: CommentSectionProps) {
  const supabase = await createServerClient()

  // Fetch comments
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      profiles (
        display_name,
        avatar_url
      )
    `)
    .eq("video_id", videoId)
    .is("parent_id", null)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Comments</h2>
      <CommentList comments={comments || []} videoId={videoId} currentUserId={currentUserId} />
    </div>
  )
}
