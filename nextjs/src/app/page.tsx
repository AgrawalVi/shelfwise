'use client'

import { generateAndSaveRecipes } from "@/actions/generate-recipes"



export default function Home() {
  async function generateRecipes() {
    await generateAndSaveRecipes('user_2od8V4jeOCOts6kmv1HljvV07Ny')
  }

  return (
    <button onClick={generateRecipes}>generate</button>
  )
}
