'use server'

import { auth } from "@clerk/nextjs/server"
import { deleteGrocery as deleteGroceryDb } from "@/data/grocery-item"

export const deleteGrocery = async (groceryId: number) => {
  const currentUser = auth()

  if (!currentUser || !currentUser.userId) {
    return { error: "Not authenticated" }
  }

  const response = await deleteGroceryDb(currentUser.userId, groceryId)

  if (!response) {
    return { error: "Failed to delete grocery" }
  }

  return { success: "Grocery deleted successfully" }
}
