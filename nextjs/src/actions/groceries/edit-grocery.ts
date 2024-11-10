"use server"

import { groceryItemSchema } from "@/schemas"
import { auth } from "@clerk/nextjs/server"
import { editGrocery as editGroceryDB } from "@/data/grocery-item"
import * as z from "zod"
import { revalidatePath } from "next/cache"

export async function editGrocery(
  data: z.infer<typeof groceryItemSchema>,
  id: number
) {
  const currentUser = auth()

  if (!currentUser || !currentUser.userId) {
    return { error: "User not authenticated" }
  }

  const values = groceryItemSchema.safeParse(data)

  if (!values.success) {
    return { error: "Invalid data" }
  }

  await editGroceryDB(
    id,
    currentUser.userId,
    values.data.name,
    values.data.perishable,
    values.data.expirationDate ?? null
  )

  revalidatePath("/dashboard")

  return {
    success: true,
  }
}
