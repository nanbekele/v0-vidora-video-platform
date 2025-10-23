"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { updateChannel } from "@/app/channel/actions"

interface ChannelEditFormProps {
  channel: {
    id: string
    name: string
    description: string | null
  } | null
}

export function ChannelEditForm({ channel }: ChannelEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(channel?.name || "")
  const [description, setDescription] = useState(channel?.description || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateChannel({
        name,
        description,
      })

      if (result.error) {
        alert(result.error)
      } else {
        alert("Channel updated successfully!")
        router.refresh()
      }
    } catch (error) {
      console.error("Channel update error:", error)
      alert("Failed to update channel")
    } finally {
      setIsLoading(false)
    }
  }

  if (!channel) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You don't have a channel yet. Upload a video to create one!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Channel Name</Label>
        <Input
          id="name"
          placeholder="Enter your channel name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Channel Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your channel"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}
