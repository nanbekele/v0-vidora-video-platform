"use client"

import type React from "react"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addComment } from "@/app/watch/[id]/actions"

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    display_name: string
    avatar_url: string | null
  }
}

interface CommentListProps {
  comments: Comment[]
  videoId: string
  currentUserId?: string
}

export function CommentList({ comments: initialComments, videoId, currentUserId }: CommentListProps) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUserId) {
      window.location.href = "/auth/login?redirect=/watch/" + videoId
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const result = await addComment(videoId, newComment)
      if (result.comment) {
        setComments([result.comment, ...comments])
        setNewComment("")
      }
    } catch (error) {
      console.error("Comment error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add comment form */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setNewComment("")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? "Posting..." : "Comment"}
            </Button>
          </div>
        </form>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                {comment.profiles.display_name[0]}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{comment.profiles.display_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-foreground">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
