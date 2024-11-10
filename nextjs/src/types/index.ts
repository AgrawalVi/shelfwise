import { Item, Recipe, RecipeItem, RecipeStep } from "@prisma/client"

export type GroceryItem = {
  name: string
  perishable: boolean
  expirationDate?: Date
}

export type ProcessedItem = {
  action: nlpActions
  itemId: number | null
  groceryItem: GroceryItem
}

export enum nlpActions {
  ADD,
  EDIT,
  DELETE,
}

export type RecipeWithData = Recipe & { RecipeStep: RecipeStep[] } & {
  RecipeItem: (RecipeItem & { item: Item })[]
}
