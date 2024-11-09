import { db } from "@/lib/db"
import { transformGroceryItems } from "@/lib/utils"
import { groceryItem } from "@/types"

export const addGroceriesBulk = async (
  userId: string,
  groceries: groceryItem[]
) => {
  const transformedGroceryItems = transformGroceryItems(groceries, userId)

  try {
    await db.item.createMany({
      data: transformedGroceryItems,
    })
  } catch (e) {
    console.error(e)
  }
}

export const addGrocery = async (userId: string, grocery: groceryItem) => {
  try {
    await db.item.create({
      data: {
        userId,
        name: grocery.name,
        perishable: grocery.expirationDate !== undefined,
        expiresAt: grocery.expirationDate,
      },
    })
  } catch (e) {
    console.error(e)
  }
}
