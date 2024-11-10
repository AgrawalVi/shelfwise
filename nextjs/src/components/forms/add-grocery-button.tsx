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

export default function AddGroceryButton({
  children,
}: {
  children: React.ReactNode
}) {
  const [mainOpen, setMainOpen] = useState(false)

  return (
    <Dialog open={mainOpen} onOpenChange={setMainOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Grocery</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <VisuallyHidden.Root>New Grocery</VisuallyHidden.Root>
        </DialogDescription>
        <GroceryForm setOpen={setMainOpen} editing={false} />
      </DialogContent>
    </Dialog>
  )
}
