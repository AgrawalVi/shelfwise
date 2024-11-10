"use client"

import { BookOpen, Plus, RotateCcw, Vegan, WandSparkles } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import UploadButton from "./general/upload-button"
import { Button } from "./ui/button"
import { generateAndSaveRecipes } from "@/actions/generate-recipes/generate-recipes"
import { useState } from "react"
import AddGroceryButton from "./forms/add-grocery-button"
import { useToast } from "@/hooks/use-toast"

export default function Footer() {
  const pathname = usePathname()
  const [recipesLoading, setRecipesLoading] = useState(false)
  const { toast } = useToast()

  const refreshRecipes = async () => {
    setRecipesLoading(true)
    await generateAndSaveRecipes()
    toast({ title: "Recipes regenerated successfully" })
    setRecipesLoading(false)
  }

  return (
    <footer className="p-4 border-t sticky bottom-0 bg-background">
      <div className="grid grid-cols-3">
        <div className="flex flex-col items-center justify-center">
          <Link
            href="/dashboard/recipes"
            className={
              pathname.startsWith("/dashboard/recipes")
                ? "bg-accent/50 p-2 rounded-lg"
                : ""
            }
          >
            <BookOpen size={28} />
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center relative">
          {pathname === "/dashboard" ? (
            <UploadButton />
          ) : (
            <Link href="/dashboard">
              <Vegan size={28} />
            </Link>
          )}
        </div>
        <div className="flex flex-col items-center justify-center relative">
          <Link
            href="/dashboard/shelf-mate"
            className={
              pathname === "/dashboard/shelf-mate"
                ? "bg-accent/50 p-2 rounded-lg"
                : ""
            }
          >
            <WandSparkles size={28} />
          </Link>
          {pathname === "/dashboard/recipes" && (
            <Button
              onClick={refreshRecipes}
              disabled={recipesLoading}
              className="absolute h-12 w-12 text-md -top-20 right-0 rounded-full p-2 bg-accent"
            >
              <RotateCcw size={25} />
            </Button>
          )}
          {pathname === "/dashboard" && (
            <AddGroceryButton>
              <Button className="absolute h-12 w-12 text-md -top-20 right-0 rounded-full p-2 bg-accent">
                <Plus size={25} />
              </Button>
            </AddGroceryButton>
          )}
        </div>
      </div>
    </footer>
  )
}
