"use client"

import { createGrocery } from "@/actions/groceries/add-groceries"
import { deleteGrocery } from "@/actions/groceries/delete-grocery"
import { editGrocery } from "@/actions/groceries/edit-grocery"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { nlpActions, ProcessedItem } from "@/types"
import { format } from "date-fns"
import { useState } from "react"
import { z } from "zod"

const nlpActionLabels: { [key in nlpActions]: string } = {
  [nlpActions.ADD]: "ADD",
  [nlpActions.EDIT]: "EDIT",
  [nlpActions.DELETE]: "DELETE",
}

export default function ConfirmCard({
  item,
  removeCard,
}: {
  item: ProcessedItem
  removeCard: (item: ProcessedItem) => void
}) {
  // error handling
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleAccept = async () => {
    setLoading(true)

    let response
    switch (item.action) {
      case nlpActions.ADD:
        response = await createGrocery({
          name: item.groceryItem.name,
          perishable: item.groceryItem.perishable,
          expirationDate: item.groceryItem.expirationDate,
        })
        if (response.success) {
          toast({ title: "Grocery Item added successfully" })
        } else {
          toast({
            title: "Something went wrong!",
            description: response.error,
            variant: "destructive",
          })
        }
        break
      case nlpActions.EDIT:
        if (item.itemId) {
          response = await editGrocery(
            {
              name: item.groceryItem.name,
              perishable: item.groceryItem.perishable,
              expirationDate: item.groceryItem.expirationDate,
            },
            item.itemId
          )
          if (response.success) {
            toast({ title: "Grocery Item edited successfully" })
          } else {
            toast({
              title: "Something went wrong!",
              description: response.error,
              variant: "destructive",
            })
          }
        } else {
          toast({ title: "Invalid item ID" })
        }
        break
      case nlpActions.DELETE:
        if (item.itemId) {
          response = await deleteGrocery(item.itemId)
          if (response.success) {
            toast({ title: "Grocery Item deleted successfully" })
          } else {
            toast({
              title: "Something went wrong!",
              description: response.error,
              variant: "destructive",
            })
          }
        } else {
          toast({ title: "Invalid item ID" })
        }
        break
    }

    removeCard(item)

    setLoading(false)
  }

  if (
    (item.action === nlpActions.EDIT || item.action === nlpActions.DELETE) &&
    item.itemId === null
  ) {
    return (
      <Card>
        <CardContent>
          An error occurred while{" "}
          {item.action === nlpActions.EDIT ? "editing" : "deleting"} the item{" "}
          {`${item.groceryItem.name}`}.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between pb-1">
          <Badge>{nlpActionLabels[item.action]}</Badge>
          {item.groceryItem.expirationDate ? (
            <div className="text-sm">
              {format(item.groceryItem.expirationDate, "P")}
            </div>
          ) : (
            <Badge variant="default">No Expiry</Badge>
          )}
        </div>
        <div className="capitalize text-2xl text-center">
          {item.groceryItem.name}
        </div>
        <div className="grid grid-cols-2 w-full gap-2 pt-1">
          <Button
            variant="destructive"
            disabled={loading}
            onClick={() => removeCard(item)}
          >
            Reject
          </Button>
          <Button value="outline" disabled={loading} onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
