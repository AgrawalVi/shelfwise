"use server"

import { openai } from "@ai-sdk/openai"
import { generateText, convertToCoreMessages } from "ai"
import { db } from "@/lib/db"
import { GroceryItem, ProcessedItem, nlpActions } from "@/types"
import { NLP_PROMPT } from "./nlp-prompt"
import { auth } from "@clerk/nextjs/server"
import { shelfMateSchema } from "@/schemas"
import { z } from "zod"

export async function processNlpInput(
  data: z.infer<typeof shelfMateSchema>
): Promise<ProcessedItem[]> {
  const currentUser = auth()

  if (!currentUser || !currentUser.userId) {
    console.error("User ID is required")
  }

  const userId = currentUser.userId

  const values = shelfMateSchema.safeParse(data)

  if (!values.success) {
    console.error("Invalid data")
    throw new Error("Invalid data")
  }

  const inputText = values.data.text

  if (!userId) {
    console.error("User ID is required")
    throw new Error("User ID is required")
  }

  // Query to get all the ingredients for the user
  const userIngredients = await db.item.findMany({
    where: { userId },
    select: { id: true, name: true, perishable: true },
  })

  // Create a map for easy lookup of ingredient names (case-insensitive)
  const ingredientMap = new Map(
    userIngredients.map((item) => [item.name.toLowerCase(), item])
  )

  const completePrompt = `${NLP_PROMPT}\n${inputText}`
  console.log("Complete prompt for NLP:", completePrompt)

  let response
  try {
    response = await generateText({
      model: openai("gpt-4o"),
      messages: convertToCoreMessages([
        { role: "user", content: completePrompt },
      ]),
      maxTokens: 1000,
    })
  } catch (apiError) {
    console.error("Error with OpenAI API call:", apiError)
    throw new Error("Failed to call OpenAI API")
  }

  let responseText
  try {
    responseText = await response.text
  } catch (responseError) {
    console.error("Error reading response text:", responseError)
    throw new Error("Failed to parse response text")
  }

  console.log("Original AI Response:", responseText)

  // Construct a new prompt for singular/plural adjustments
  const correctionPrompt = `
Given this response text:
${responseText}

And this list of existing ingredients:
${userIngredients.map((item) => item.name).join(", ")}

Please adjust the response text to match the exact ingredient names provided in the list. If an ingredient in the response text differs in form (such as plural vs. singular) or spelling from the list, correct it to match the exact format found in the list. If an ingredient has a similar alternative name (e.g., "kraft mac and cheese" vs. "mac and cheese"), standardize it according to the closest match in the list. Leave any item not in the list unchanged.
Also only correct it if the command is edit, or delete, don't cahnge anything that might be after add, only items of edit and delete should be adjusted
Only provide the corrected text.

For example ingredients: apple, banana, rice, kraft mac and cheese, sugar

Original response text: "EDIT; apples: 11-11-24"
Corrected response: "EDIT; apple: 11-11-24"

Another example:
ingredients : trader joe's beef stew, kraft mac and cheese

Original response text: """
ADD; beef stew: 11-11-24
EDIT; mac and cheese: 11-11-24
"""
Corrected response: """
ADD; beef stew: 11-11-24
EDIT; kraft mac and cheese: 11-11-24
"""

Only provide the corrected response text without additional explanations. Make sure the replacements you are doing are for products that are really close to each other, I don't want something that is losely related to be corrected, only those that have a very high chance of being the same products such as:
"mac and cheese" and "kraft mac and cheese"
"nacho chips" and "nacho crisps"
"bag of apple" and "apples"
"read to eat oats" and "readymade oatmeals"
they essentially be the same things, doesn't have to be perfectly same but same enough. only do this for edit and delete though
just give a formatted string, no need to add the quotes
`

  // Make another query to the OpenAI API for singular/plural correction
  let correctedResponse
  try {
    correctedResponse = await generateText({
      model: openai("gpt-4o"),
      messages: convertToCoreMessages([
        { role: "user", content: correctionPrompt },
      ]),
      maxTokens: 1000,
    })
  } catch (apiError) {
    console.error("Error with OpenAI correction API call:", apiError)
    throw new Error("Failed to call OpenAI API for correction")
  }

  let correctedResponseText
  try {
    correctedResponseText = await correctedResponse.text
  } catch (responseError) {
    console.error("Error reading corrected response text:", responseError)
    throw new Error("Failed to parse corrected response text")
  }

  console.log("Corrected AI Response:", correctedResponseText)

  // Parse the corrected response by newline and process each line
  const lines = correctedResponseText
    .split("\n")
    .filter((line) => line.trim() !== "")

  const processedItems: ProcessedItem[] = []

  for (const line of lines) {
    const [command, itemsString] = line.split(";", 2).map((part) => part.trim())

    let action: nlpActions | undefined
    switch (command) {
      case "ADD":
        action = nlpActions.ADD
        break
      case "EDIT":
        action = nlpActions.EDIT
        break
      case "DELETE":
        action = nlpActions.DELETE
        break
      default:
        console.error("Unknown command:", command)
        continue
    }

    console.log(`Command: ${command}`)

    const items = itemsString.split(",").map((item) => item.trim())

    for (const item of items) {
      const [itemName, dateStr] = item.split(":").map((part) => part.trim())
      const ingredientKey = itemName.toLowerCase()

      // Determine expirationDate and perishable
      const expirationDate =
        dateStr && dateStr !== "null" ? new Date(dateStr) : undefined
      const perishable = expirationDate ? true : false

      // Set itemId based on action type and ingredient existence
      let itemId = null
      if (action !== nlpActions.ADD && ingredientMap.has(ingredientKey)) {
        itemId = ingredientMap.get(ingredientKey)!.id
      }

      // Create the GroceryItem object with new info
      const groceryItem: GroceryItem = {
        name: itemName,
        perishable,
        expirationDate,
      }

      console.log(
        `Processed item - Action: ${action}, ItemID: ${itemId}, GroceryItem:`,
        groceryItem
      )

      // Add to the processed items array
      processedItems.push({
        action,
        itemId,
        groceryItem,
      })
    }
  }

  // Return the processed items array
  return processedItems
}
