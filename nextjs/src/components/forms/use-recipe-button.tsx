"use client"

import { RecipeWithData } from "@/types"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogContent,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { CheckCheck } from "lucide-react"
import { Switch } from "../ui/switch"
import { useState } from "react"
import { deleteGroceriesBulk } from "@/actions/groceries/delete-grocery"
import { useToast } from "@/hooks/use-toast"

export default function UseRecipeButton({
  recipe,
}: {
  recipe: RecipeWithData
}) {
  const { toast } = useToast()
  const recipe_items = recipe.RecipeItem

  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [toggledItems, setToggledItems] = useState<Set<number>>(new Set())

  const handleButtonPress = async () => {
    setLoading(true)

    const response = await deleteGroceriesBulk(
      Array.from(toggledItems),
      recipe.id
    )
    if (response && response.error) {
      toast({
        title: "Something went wrong!",
        description: response.error,
        variant: "destructive",
      })
    } else {
      toast({ title: "Recipe marked as used successfully" })
      setOpen(false)
    }

    setLoading(false)
  }

  const handleToggleChange = (item_id: number) => {
    setToggledItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(item_id)) {
        newSet.delete(item_id)
      } else {
        newSet.add(item_id)
      }
      console.log(newSet)
      return newSet
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <CheckCheck />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark this recipe as used</DialogTitle>
          <DialogDescription>
            You can select any ingredients that you have finished while making
            this recipe.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between border-b">
          <div>Ingredient</div>
          <div>Mark as used</div>
        </div>
        {recipe_items.map((item) => {
          return (
            <div className="flex justify-between">
              <div key={item.id} className="capitalize">
                {item.item.name}
              </div>
              <Switch
                disabled={loading}
                onClick={() => handleToggleChange(item.id)}
              />
            </div>
          )
        })}
        <Button
          variant={"default"}
          onClick={handleButtonPress}
          disabled={loading}
        >
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  )
}
