import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { GroceryItem } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function transformGroceryItems(items: GroceryItem[], userId: string) {
  return items.map((item) => ({
    name: item.name,
    expiresAt: item.expirationDate,
    userId: userId,
    perishable: item.perishable,
  }))
}
