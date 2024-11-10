"use client"

import { uploadImage } from "@/actions/image-upload.ts/upload-image"
import { Button } from "../ui/button"
import { useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { GroceryItem } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog"
import { Camera } from "lucide-react"

export const UploadButton = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [previewURL, setPreviewURL] = useState<string | null>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click() // Open file input when button is clicked
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFileName(selectedFile.name)
      setFile(selectedFile)

      // Revoke the previous URL if exists to avoid memory leaks
      if (previewURL) {
        URL.revokeObjectURL(previewURL)
      }

      // Set a new preview URL
      setPreviewURL(URL.createObjectURL(selectedFile))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)

    if (!file) {
      toast({ title: "Please select a file first.", variant: "destructive" })
      setLoading(false)
      return
    }

    // Create FormData object and append the file
    const formData = new FormData()
    formData.append("image", file)

    const response = await uploadImage(formData)
    if (response.error || !response.success) {
      toast({
        title: "An error occurred",
        description: response.error,
        variant: "destructive",
      })
    } else {
      setOpen(false)
      setFile(null)
      setFileName(null)
      setPreviewURL(null)
      toast({
        title: "Your groceries have been added to your shelf",
      })
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="p-4 -translate-y-[8px] -mt-[22px] rounded-full bg-accent border">
          <Camera size={32} />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-center">Scan Your Receipt</DialogTitle>
        <DialogDescription className="text-center">
          Scan your receipt to add your new groceries to your shelf :)
        </DialogDescription>
        <div className="flex flex-col space-y-4">
          <Button onClick={handleButtonClick} disabled={loading}>
            {file ? <span>Retake Image</span> : <span>Take Image</span>}
          </Button>

          <span className="text-center">
            {!fileName && "No image uploaded"}
          </span>
          {previewURL && (
            <img
              src={previewURL}
              alt="Preview your image"
              className="h-96 object-contain"
            />
          )}

          <form onSubmit={handleSubmit} className="flex flex-col">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }} // Hide the file input
              onChange={handleFileChange}
            />
            <Button type="submit" disabled={!file || loading}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UploadButton
