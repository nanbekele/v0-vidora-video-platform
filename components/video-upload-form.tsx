"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Video, ImageIcon, Loader2 } from "lucide-react"
import { createVideo } from "@/app/upload/actions"

export function VideoUploadForm() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>("")
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setThumbnailFile(file)
      const url = URL.createObjectURL(file)
      setThumbnailPreview(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoFile || !thumbnailFile || !title) {
      alert("Please fill in all required fields")
      return
    }

    setIsUploading(true)

    try {
      // Upload video
      setUploadProgress("Uploading video...")
      const videoFormData = new FormData()
      videoFormData.append("file", videoFile)

      const videoResponse = await fetch("/api/upload/video", {
        method: "POST",
        body: videoFormData,
      })

      if (!videoResponse.ok) {
        throw new Error("Video upload failed")
      }

      const videoData = await videoResponse.json()

      // Upload thumbnail
      setUploadProgress("Uploading thumbnail...")
      const thumbnailFormData = new FormData()
      thumbnailFormData.append("file", thumbnailFile)

      const thumbnailResponse = await fetch("/api/upload/thumbnail", {
        method: "POST",
        body: thumbnailFormData,
      })

      if (!thumbnailResponse.ok) {
        throw new Error("Thumbnail upload failed")
      }

      const thumbnailData = await thumbnailResponse.json()

      // Get video duration
      const duration = videoRef.current?.duration || 0

      // Create video record
      setUploadProgress("Creating video record...")
      const result = await createVideo({
        title,
        description,
        videoUrl: videoData.url,
        thumbnailUrl: thumbnailData.url,
        duration: Math.floor(duration),
      })

      if (result.error) {
        throw new Error(result.error)
      }

      // Success! Redirect to home
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed. Please try again.")
      setIsUploading(false)
      setUploadProgress("")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Video Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Video File</CardTitle>
            <CardDescription>Upload your video file (MP4, WebM, etc.)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {videoPreview ? (
                  <div className="space-y-4">
                    <video ref={videoRef} src={videoPreview} controls className="w-full max-h-64 rounded-lg mx-auto" />
                    <p className="text-sm text-muted-foreground">{videoFile?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Video className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload video</p>
                  </div>
                )}
              </div>
              <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
            </div>
          </CardContent>
        </Card>

        {/* Thumbnail Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Thumbnail</CardTitle>
            <CardDescription>Upload a thumbnail image for your video</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {thumbnailPreview ? (
                  <div className="space-y-4">
                    <img
                      src={thumbnailPreview || "/placeholder.svg"}
                      alt="Thumbnail preview"
                      className="w-full max-h-48 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-sm text-muted-foreground">{thumbnailFile?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload thumbnail</p>
                  </div>
                )}
              </div>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Video Details */}
        <Card>
          <CardHeader>
            <CardTitle>Video Details</CardTitle>
            <CardDescription>Add information about your video</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell viewers about your video"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading || !videoFile || !thumbnailFile || !title}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadProgress}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Video
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
