"use server"

import { addGroceriesBulk, addGrocery } from "@/data/grocery-item"
import { groceryItemSchema } from "@/schemas"
import { GroceryItem } from "@/types"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import * as z from "zod"

export const addGroceries = async (groceries: GroceryItem[]) => {
  const user = auth()
  if (!user || !user.userId) {
    return { error: "User not authenticated" }
  }
  // save groceries to database

  addGroceriesBulk(user.userId, groceries)
}

export async function createGrocery(data: z.infer<typeof groceryItemSchema>) {
  const currentUser = auth()

  if (!currentUser || !currentUser.userId) {
    return { error: "User not authenticated" }
  }

  const values = groceryItemSchema.safeParse(data)

  if (!values.success) {
    console.log("INVALID DATA NOT WORKING asdfasdfads")
    console.error(values.data)
    return { error: "Invalid data" }
  }


  await addGrocery(currentUser.userId, {
    name: values.data.name,
    perishable: values.data.perishable,
    expirationDate: values.data.expirationDate,
  })

  revalidatePath("/dashboard")

  return {
    success: true,
  }
}
