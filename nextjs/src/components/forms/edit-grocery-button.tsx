"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useState } from "react"
import { PencilIcon } from "lucide-react"
import { Item } from "@prisma/client"
import GroceryForm from "./grocery-form"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

interface EditGroceryButtonProps {
  grocery: Item
}

export default function EditGroceryButton({ grocery }: EditGroceryButtonProps) {
  const [mainOpen, setMainOpen] = useState(false)

  return (
    <Dialog open={mainOpen} onOpenChange={setMainOpen}>
      <Button variant="ghost" className="border border-dashed" size="icon">
        <DialogTrigger asChild>
          <span className="flex h-full w-full items-center justify-center">
            <PencilIcon size="20" />
          </span>
        </DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Grocery</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <VisuallyHidden.Root>Edit Grocery</VisuallyHidden.Root>
        </DialogDescription>
        <GroceryForm
          groceryItem={grocery}
          setOpen={setMainOpen}
          editing={true}
        />
      </DialogContent>
    </Dialog>
  )
}
