"use client"

import { useTransition } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import DatePickerFormElement from "../ui/date-picker-form"
import { Item } from "@prisma/client"
import { groceryItemSchema } from "@/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { editGrocery } from "@/actions/groceries/edit-grocery"
import { createGrocery } from "@/actions/groceries/add-groceries"

interface GroceryFormPropsEditing {
  groceryItem: Item // Required when editing is true
  setOpen: (value: boolean) => void
  editing: true // Discriminator field
}

interface GroceryFormPropsNotEditing {
  groceryItem?: Item // Optional when editing is false
  setOpen: (value: boolean) => void
  editing: false // Discriminator field
}

type GroceryFormProps = GroceryFormPropsEditing | GroceryFormPropsNotEditing

const GroceryForm = ({ groceryItem, setOpen, editing }: GroceryFormProps) => {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof groceryItemSchema>>({
    resolver: zodResolver(groceryItemSchema),
    defaultValues: {
      name: groceryItem?.name ?? "",
      perishable: groceryItem?.perishable ?? false,
      expirationDate: groceryItem?.expiresAt ?? undefined,
    },
  })

  const onSubmit = (data: z.infer<typeof groceryItemSchema>) => {
    startTransition(() => {
      if (editing) {
        editGrocery(data, groceryItem.id)
          .then((response) => {
            if (response.success) {
              form.reset()
              setOpen(false)
              toast({ title: "Grocery Item edited successfully" })
            } else {
              toast({
                title: "Something went wrong!",
                description: response.error,
                variant: "destructive",
              })
            }
          })
          .catch(() => {
            toast({
              title: "Something went wrong!",
              description: "An unknown error has occurred",
              variant: "destructive",
            })
          })
      } else {
        createGrocery(data)
          .then((response) => {
            if (response.success) {
              form.reset()
              setOpen(false)
              toast({ title: "Grocery logged successfully" })
            } else {
              toast({
                title: "Something went wrong!",
                description: response.error,
                variant: "destructive",
              })
            }
          })
          .catch(() => {
            toast({
              title: "Something went wrong!",
              description: "An unknown error has occurred",
              variant: "destructive",
            })
          })
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col items-center space-y-4"
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Item Name"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="perishable"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
                <FormLabel>Perishable</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expirationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiration Date</FormLabel>
                <DatePickerFormElement
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isPending || !form.getValues("perishable")}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-2/3" disabled={isPending}>
          Save
        </Button>
      </form>
    </Form>
  )
}

export default GroceryForm
