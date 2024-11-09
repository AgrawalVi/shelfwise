"use server"

import { addGroceriesBulk } from "@/data/grocery-item"
import { groceryItem } from "@/types"
import { auth } from "@clerk/nextjs/server"

export const addGroceries = async (groceries: groceryItem[]) => {
  const user = auth()
  if (!user || !user.userId) {
    return { error: "User not authenticated" }
  }
  // save groceries to database

  addGroceriesBulk(user.userId, groceries)
}
