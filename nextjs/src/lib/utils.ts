import { groceryItem } from "@/types"

export function transformGroceryItems(items: groceryItem[], userId: string) {
  return items.map((item) => ({
    name: item.name,
    expiresAt: item.expirationDate,
    userId: userId,
    perishable: item.expirationDate !== undefined,
  }))
}
