'use server'

import { auth } from "@clerk/nextjs/server"
import { deleteGroceriesBulk as deleteGroceriesBulkDb, deleteGrocery as deleteGroceryDb } from "@/data/grocery-item"
import { revalidatePath } from "next/cache"
import { generateAndSaveRecipes } from "../generate-recipes/generate-recipes"
import { deleteRecipeById } from "@/data/recipes"
import { redirect } from "next/navigation"

export const deleteGrocery = async (groceryId: number) => {
  const currentUser = auth()

  if (!currentUser || !currentUser.userId) {
    return { error: "Not authenticated" }
  }

  const response = await deleteGroceryDb(currentUser.userId, groceryId)

  if (!response) {
    return { error: "Failed to delete grocery" }
  }

  revalidatePath("/dashboard")

  return { success: "Grocery deleted successfully" }
}

export const deleteGroceriesBulk = async (groceryIds: number[], recipeId: number) => {
  console.log("GroceryIDS", groceryIds)
  const currentUser = auth()

  if (!currentUser || !currentUser.userId) {
    return { error: "User not authenticated" }
  }

  const response1 = await deleteGroceriesBulkDb(currentUser.userId, groceryIds)
  const response2 = await deleteRecipeById(recipeId, currentUser.userId)

  if (!response1 || !response2) {
    return { error: "Failed to delete groceries" }
  }

  if (groceryIds.length > 2) {
    generateAndSaveRecipes()
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/recipes")

  redirect("/dashboard/recipes")
}