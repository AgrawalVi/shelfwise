"use server"

import { GroceryItem } from "@/types"
import { parseOCR } from "./parse-ocr"
import { getExpirationDate } from "./get-expiration-date"

const validFileTypes: { [key: string]: string[] } = {
  "image/jpeg": [".jpeg", ".jpg"],
  "image/png": [".png"],
}

const sample = `
~ @TARGET Le

EXPECT MORE PAY LESS:

07/18/2010 01:51 PM EXPIRES 10/16/10
QA
ACCESSORIES
061041991 CHECK CLUTCH T $12.99

BABY
030050284 MILK STORAGE T $8.94 4
Saved $1.00 off $9.94

CLEANING SUPPLIES

002090549 Pach rer T $2.89
003050316 T $3.84
003050598 SWIFEER 7 ‘$4.49

GROCERY
071090734 MP COOKIES FO

$1.77
071091011 PEPPERIDGE FD $2.54
071200475 ‘SPECIAL K FD ara
071200582 NATUREVALLEY FD 2.69
212180856 MP SOUP. FD 0.89
231100893 AF COFFEE FD 6.99
231181089 MP FILTERS FT 0.87
270020427 LEAN CUISINE FD 1.94
270060019 LEAN POCKETS FD $2.04
284000048 PILSBRY CRES FD $1.89
284050061 COFFEEMATE FO $2.04
TH-BEAUTY -COSMETICS
049090436. COLGATE T $1.99 |
535000525760 MFR COUPON $1.00-
Coupon $1.00 off $2.99
HOME
249050082 BOOKCASE $16.00 1
Seed | $3.99 of f he 99
253010027 ZIPLOC $4.89 4
‘SPECIALTY .
245030540 KY JELLY 402 L $3.50 4
Toys- So RE
2040200; NC re ‘OOTBALL T $1.48
= ~-SPECIAL COUPON--------------~
053221371 WEDDING CARD _ $3.59
Refund Value $3 T
053226306 WED CARD $1.99
Refund Value $1.76
053201726 RPG CARD $2.99
Refund Value $2.64 T

PACKAGE SUBTOTAL
TARGET COUPON

PACKAGE TOTAL

SUBTOTAL = $93.78
50% on $68 a Bi 3
50% on $25.3
foiaL $100: %
VISA CHARGE $100.42
4 INDICATES SAVINGS

YOU SAVED $8.68

om
=

ae
ae

Get 5 cents off every
time you use a
reusable bagt
`

export const uploadImage = async (formData: FormData) => {
  // check if formData contains an image
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

  return toReturn
}
