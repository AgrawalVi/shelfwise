import { openai } from "@ai-sdk/openai"
import { generateText, convertToCoreMessages } from "ai"
import { format } from "date-fns"

const prompt = `
You are a helpful assistant that will estimate expiration dates for grocery items. 
You will be given a grocery item name, and using your best judgement, return the estimated expiration date. 
If the item does not have an expiration date, return "N/A". 
Otherwise, return the estimated expiration date in the format "MM/DD/YYYY" using your best judgement. Better to be on the conservative side when making these estimates. 

Only return the estimated expiration date in the format "MM/DD/YYYY" or "N/A" using your best judgement.

---
Here are a few examples of input and output:

---
Input: 
Date: 11/9/2024
Item: Organic Fuji Apples
---
Output:
11/19/2024
---

---
Input:
Date: 11/9/2024
Item: Organic Avocados
---
Output:
N/A
---

---
Never use the above example as input, as it is just an example. It is imperative that you ONLY return either a date or N/A.
---
`

export const getExpirationDate = async (item: string) => {
  try {
    const response = await generateText({
      model: openai("gpt-4o"),
      messages: convertToCoreMessages([
        {
          role: "user",
          content: `${prompt}\nDate: ${format(new Date(), "P")}\n"Item:${item}`,
        },
      ]),
    })

    console.log(item, response.text)
    if (response.text.toLowerCase().includes("n/a")) {
      return null
    }
    return response.text
  } catch (error) {
    console.error(error)
    return null
  }
}
