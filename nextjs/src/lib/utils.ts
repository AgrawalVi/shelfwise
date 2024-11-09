import { GroceryItem } from "@/types"

export function transformGroceryItems(items: GroceryItem[], userId: string) {
  return items.map((item) => ({
    name: item.name,
    expiresAt: item.expirationDate,
    userId: userId,
    perishable: item.perishable,
  }))
}
