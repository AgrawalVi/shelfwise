"use client"

import { uploadImage } from "@/actions/image-upload.ts/upload-image"
import { Button } from "../ui/button"
import { useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { GroceryItem } from "@/types"

export const UploadButton = ({ groceries }: { groceries: GroceryItem[] }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleButtonClick = () => {
    fileInputRef.current?.click() // Open file input when button is clicked
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setFile(file)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    if (!file) {
      toast({title: "Please select a file first.", variant: "destructive"})
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
      groceries = response.success
    }
    setLoading(false)
  }

  return (
    <div>
      <Button onClick={handleButtonClick} disabled={loading}>Take Image</Button>
      <span>{fileName || "No file chosen"}</span>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }} // Hide the file input
          onChange={handleFileChange}
        />
        <Button type="submit" disabled={!file}>Upload</Button>
      </form>
    </div>
  )
}

export default UploadButton
