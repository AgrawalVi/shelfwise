"use client"

import { uploadImage } from "@/actions/image-upload.ts/upload-image"
import { generateAndSaveRecipes } from "@/actions/generate-recipes"

export default function Home() {
  const handleClick = async () => {
    await uploadImage(new FormData())
  }

  async function generateRecipes() {
    await generateAndSaveRecipes()
  }

  return (
    <>
      <button onClick={generateRecipes}>generate recipes</button>
      <button onClick={handleClick}>test upload</button>
    </>
  )
}
