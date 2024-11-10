"use client"

import { useEffect, useTransition } from "react"
import { z } from "zod"
import { groceryItemSchema } from "@/schemas"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { addGroceries } from "@/actions/groceries/add-groceries"

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
import { GroceryItem } from "@/types"
import DatePickerFormElement from "../ui/date-picker-form"
import { Checkbox } from "../ui/checkbox"

const ConfirmItemsForm = ({ groceries }: { groceries: GroceryItem[] }) => {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<{
    items: z.infer<typeof groceryItemSchema>[]
  }>({
    resolver: zodResolver(groceryItemSchema),
    defaultValues: {
      items: groceries, // Initialize with groceries array
    },
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "items",
  })

  function onSubmit(data: { items: z.infer<typeof groceryItemSchema>[] }) {}

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col items-center space-y-4"
      >
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
            <FormField
              control={form.control}
              name={`items.${index}.name`}
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
              name={`items.${index}.perishable`}
              render={({ field }) => (
                <FormItem className="flex">
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
              name={`items.${index}.expirationDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Applied</FormLabel>
                  <DatePickerFormElement
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
        <Button type="submit" className="w-2/3" disabled={isPending}>
          Save
        </Button>
      </form>
    </Form>
  )
}

export default ConfirmItemsForm
