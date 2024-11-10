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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import DatePickerFormElement from "../ui/date-picker-form"
import { Item } from "@prisma/client"
import { shelfMateSchema } from "@/schemas"
import { Checkbox } from "@radix-ui/react-checkbox"
import { editGrocery } from "@/actions/groceries/edit-grocery"
import { createGrocery } from "@/actions/groceries/add-groceries"
import { Textarea } from "../ui/textarea"
import { processNlpInput } from "@/actions/nlp/nlp-input"
import { ProcessedItem } from "@/types"

const ShelfMateForm = ({
  setNLPOutput,
}: {
  setNLPOutput: (output: ProcessedItem[]) => void
}) => {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof shelfMateSchema>>({
    resolver: zodResolver(shelfMateSchema),
    defaultValues: {
      text: "",
    },
  })

  const onSubmit = (data: z.infer<typeof shelfMateSchema>) => {
    startTransition(() => {
      processNlpInput(data)
        .then((response) => {
          if (response) {
            setNLPOutput(response)
            form.reset()
          } else {
            toast({
              title: "Something went wrong!",
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
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col items-center space-y-4"
      >
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Chat with Shelf Mate</FormLabel>
              <FormDescription>
                Write a message here to manage your shelf
              </FormDescription>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="I just bought some bananas to replace my finished apples"
                  disabled={isPending}
                  className="h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-2/3" disabled={isPending}>
          Save
        </Button>
      </form>
    </Form>
  )
}

export default ShelfMateForm
