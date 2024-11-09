'use server'

import { groceryItem } from "@/types"
import { parseOCR } from "./parse-ocr";
import { getExpirationDate } from "./get-expiration-date";

const validFileTypes: { [key: string]: string[] } = {
  "image/jpeg": [".jpeg", ".jpg"],
  "image/png": [".png"],
}

export const uploadImage = async (formData: FormData) => {
  // check if formData contains an image
  const file = formData.get('image');

  if (!file || !(file instanceof File)) {
    return { error: "No image found"}
  }

  const fileExtension = `.${file.name.split(".").pop()?.trim()}`
  if (!fileExtension) {
    return { error: "File extension not found" }
  }

  const validExtensions = validFileTypes[file.type]
  const isValidType = validExtensions
    ? validExtensions.includes(fileExtension)
    : false

  if (!isValidType) {
    return { error: "File type not supported" }
  }

  // send image to our image parsing service

  // get parsed list of groceries
  const items = await parseOCR('asdf')
  if (!items) {
    return { error: "Failed to parse image" }
  }

  const toReturn: groceryItem[] = []
  
  // call the openAI endpoint to generate expiration dates for each grocery
  items.split("--").forEach(async (item) => {
    let date = await getExpirationDate(item)
    if (date) {
      toReturn.push({ name: item, expirationDate: new Date(date) })
    }
    else {
      toReturn.push({ name: item, expirationDate: undefined })
    }
  })

  return toReturn
}