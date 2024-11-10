import GroceryList from "@/components/general/groceries/grocery-list"
import { getGroceriesByUser } from "@/data/grocery-item"
import { auth } from "@clerk/nextjs/server"

export default async function Dashboard() {
  const currentUser = auth()
  if (!currentUser || !currentUser.userId) {
    return <div>Please sign in to view your grocery list.</div>
  }

  const groceries = await getGroceriesByUser(currentUser.userId)
  console.log(groceries)

  return <GroceryList groceries={groceries} />
}
