import { uploadImage } from "@/actions/image-upload.ts/upload-image"
import ConfirmItemsForm from "@/components/forms/confirm-items-form"
import GroceryList from "@/components/general/groceries/grocery-list"
import { getGroceriesByUser } from "@/data/grocery-item"
import { GroceryItem } from "@/types"
import { auth } from "@clerk/nextjs/server"
import { useState } from "react"

export default async function Dashboard() {
  const currentUser = auth()
  if (!currentUser || !currentUser.userId) {
    return <div>Please sign in to view your grocery list.</div>
  }
  // const response = await uploadImage(new FormData())

  // if (response.error || !response.success) {
  //   return <div>Error: {response.error}</div>
  // }

  const groceries = await getGroceriesByUser(currentUser.userId)

  // return <ConfirmItemsForm groceries={} />
  return (
    // <main className="w-full flex flex-col overflow-x-hidden">
    <GroceryList groceries={groceries} />
    // </main>
  )
}
