"use client"

import { GroceryItem } from "@/types"
import { Button } from "../ui/button"
import { useRef, useState } from "react"

export const UploadButton = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!file) {
      alert("Please select a file first.")
      return
    }

    // Create FormData object and append the file
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error uploading file")
      }

      const data = await response.json()
      console.log("File uploaded successfully:", data)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  return (
    <div>
      <Button onClick={handleButtonClick}>Take Image</Button>
      <span>{fileName || "No file chosen"}</span>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }} // Hide the file input
          onChange={handleFileChange}
        />
        <button type="submit">Upload</button>
      </form>
    </div>
  )
}

export default UploadButton
