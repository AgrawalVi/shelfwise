type GroceryItemBase = {
  name: string
  perishable: boolean
}

type NonPerishableItem = GroceryItemBase & {
  perishable: false
  expirationDate?: never
}

type PerishableItem = GroceryItemBase & {
  perishable: true
  expirationDate: Date
}

export type GroceryItem = NonPerishableItem | PerishableItem
