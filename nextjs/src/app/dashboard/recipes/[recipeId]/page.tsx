import { getRecipeWithDataById } from "@/data/recipes"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function page(params: { recipeId: string }) {
  const currentUser = auth()

  const parsedRecipeId = parseInt(params.recipeId)
  if (isNaN(parsedRecipeId) || parsedRecipeId < 1) {
    redirect("/dashboard/recipes")
  }

  if (!currentUser || !currentUser.userId) {
    return <div>Please sign in to view your recipes.</div>
  }

  const recipeId = params.recipeId

  if (!recipeId) {
    redirect("/dashboard/recipes")
  }

  const recipe = await getRecipeWithDataById(parsedRecipeId, currentUser.userId)

  return <div>Recipe Page</div>
}
