import { Item } from "@prisma/client"
import GroceryListItem from "./grocery-list-item"

export default function GroceryList({ groceries }: { groceries: Item[] }) {
  return (
    <div className="flex flex-col gap-4 overflow-x-hidden">
      {groceries.map((grocery) => (
        <GroceryListItem key={grocery.id} grocery={grocery} />
      ))}
    </div>
  )
}
