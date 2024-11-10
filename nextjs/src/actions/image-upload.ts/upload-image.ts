"use server"

import { GroceryItem } from "@/types"
import { parseOCR } from "./parse-ocr"
import { getExpirationDate } from "./get-expiration-date"
import { auth } from "@clerk/nextjs/server"

const validFileTypes: { [key: string]: string[] } = {
  "image/jpeg": [".jpeg", ".jpg"],
  "image/png": [".png"],
}

const sample = `
6343 Penn Avenue\nPittsburgh PA 15206\nStore #638 - (412) 363-5748\n\nOPEN 8:00AM TO 9:00PM DAILY\nA-APPLE EACH ORG FUJI 1,38\n\n2EA _-@ 0.69/EA\nA-GRAPEFRUIT BAG RUBY RED 5 LB 4,49\n\nA-POTATO BAG SHEET 2 LB 1,69\nA-TOMATOES ON VINE PEARL 14 0Z 2.99\nAVOCADOS ORGANIC 4 COUNT 3.99\nBANANAS 0.76\n\n4EA -@.0.19/EA\nB-BREAD WHOLE WHEAT FIBER (5G/ 2.99\nBURGER MASALA VEGETABLE 2.49\nCEREAL BRAN FLAKES TJ'S 1,99\nCHEDDAR SHARP WISCONSIN TJ'S. 2.62\nCOFFEE GROUND FRENCH ROAST 5.49\nCORN ON THE COB EACH 1.47\n3EA \u2014-@ 0.49/EA\nFRUIT APPLESAUCE ORGANIC\nFRUIT APPLESAUCE ORGANIC\nMILK REDUCED FAT 2% GALLON TJ\u2019\n\n2)\n\n2\n\n3.51\nORGANIC BROCCOLI FZN 2.49\nSPARKLING SPRING WATER TJ'S P 0.79\nTANALES BEEF 2.29\nTAMALES GRN CHILE&CHEESE 2.29\nWH TUSCAN PANE 5.98\n\n202 @ 2.99/02\n\nWH TUSCAN PANE 2.99\nSUBTOTAL $57.75\nTOTAL $57.75\nDEBIT $57.75\nspeeobetaeeB545\nPURCHASE -:\nSWIPED\n\nAUTH# 225442\n\nINVOICE #: 246\n1638, ,00,\n\n05-01-2012 03:01PM\n\nREFERENCE #: 383074\n\nTTENS 28 W., Sharon\n05-01-2012 05:59PM 0638 04 0832 0246\n\nTHANK YOU FOR SHOPPING AT\nTRADER JOE'S\nwww. trader joes .com\n"`

export const uploadImage = async (formData: FormData) => {
  // check if formData contains an image

  // const user = auth()

  // if (!user || !user.userId) {
  //   return { error: "User not authenticated" }
  // }

  // const file = formData.get('image');

  // if (!file || !(file instanceof File)) {
  //   return { error: "No image found"}
  // }

  // const fileExtension = `.${file.name.split(".").pop()?.trim()}`
  // if (!fileExtension) {
  //   return { error: "File extension not found" }
  // }

  // const validExtensions = validFileTypes[file.type]
  // const isValidType = validExtensions
  //   ? validExtensions.includes(fileExtension)
  //   : false

  // if (!isValidType) {
  //   return { error: "File type not supported" }
  // }

  // send image to our image parsing service

  // get parsed list of groceries
  const items = await parseOCR(sample)
  if (!items) {
    return { error: "Failed to parse image" }
  }

  console.log(items)

  const toReturn: GroceryItem[] = []

  // call the openAI endpoint to generate expiration dates for each grocery
  const itemPromises = items.split("--").map(async (item) => {
    item = item.trim()
    if (!item) return
    const date = await getExpirationDate(item)
    if (date) {
      toReturn.push({
        name: item,
        perishable: true,
        expirationDate: new Date(date),
      })
    } else {
      toReturn.push({ name: item, perishable: false })
    }
  })

  await Promise.all(itemPromises)

  console.log("toReturn", toReturn)

  return { success: toReturn }
}
