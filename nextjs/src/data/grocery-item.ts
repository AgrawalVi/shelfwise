import { db } from "@/lib/db"
import { transformGroceryItems } from "@/lib/utils"
import { GroceryItem } from "@/types"

export const addGroceriesBulk = async (
  userId: string,
  groceries: GroceryItem[]
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

export const deleteGroceriesBulk = async (
  userId: string,
  groceryIds: number[]
) => {
  try {
    await db.item.deleteMany({
      where: {
        id: {
          in: groceryIds
        },
        userId
      }
    })
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const addGrocery = async (userId: string, grocery: GroceryItem) => {
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

export const getGroceriesByUser = async (userId: string) => {
  try {
    return await db.item.findMany({
      where: {
        userId,
      },
      orderBy: {
        expiresAt: {
          sort: "asc",
          nulls: "last",
        },
      },
    })
  } catch (e) {
    console.error(e)
    return []
  }
}

export const editGrocery = async (
  groceryId: number,
  userId: string,
  name: string,
  perishable: boolean,
  expiresAt: Date | null
) => {
  try {
    await db.item.update({
      where: {
        id: groceryId,
        userId,
      },
      data: {
        name,
        perishable,
        expiresAt,
      },
    })
  } catch (e) {
    console.error(e)
  }
}

export const deleteGrocery = async (userId: string, groceryId: number) => {
  try {
    await db.item.delete({
      where: {
        id: groceryId,
        userId,
      },
    })
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
