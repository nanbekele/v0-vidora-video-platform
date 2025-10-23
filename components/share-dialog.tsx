"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Copy, Facebook, Twitter, Linkedin } from "lucide-react"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  videoId: string
  videoTitle: string
}

export function ShareDialog({ open, onOpenChange, videoId, videoTitle }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)

  const videoUrl = typeof window !== "undefined" ? `${window.location.origin}/watch/${videoId}` : ""

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(videoUrl)
    const encodedTitle = encodeURIComponent(videoTitle)

    let shareUrl = ""

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Video</DialogTitle>
          <DialogDescription>Share this video with your friends and followers</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy link */}
          <div className="flex items-center gap-2">
            <Input value={videoUrl} readOnly className="flex-1" />
            <Button onClick={handleCopy} size="icon" variant="outline">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Social media buttons */}
          <div className="flex items-center gap-2">
            <Button onClick={() => handleShare("twitter")} variant="outline" className="flex-1">
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button onClick={() => handleShare("facebook")} variant="outline" className="flex-1">
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button onClick={() => handleShare("linkedin")} variant="outline" className="flex-1">
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
