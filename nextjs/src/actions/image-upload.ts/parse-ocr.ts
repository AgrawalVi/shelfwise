import { openai } from "@ai-sdk/openai"
import { generateText, convertToCoreMessages } from "ai"

const prompt = `
You are a helpful assistant that will extract grocery items from the text that is provided.
The provided text that was extracted from an OCR that was used on a receipt.

Task:
>Based on the provided text, extract the grocery items in a human friendly manner. 
>Only return the name of items that are groceries and food items. Do not return any other items. 
>Make sure the item names are recognizable and the user can understand them easily
>Get rid of unnecassry letters or number preceeding to succeeding the item name that is not necessary
> Make sure Each item entry is followed by "--" and a new line. This is necessary for the parser to know that the item is done.

Here is an example of input text:

Food Item
MP COOKIES FO
PEPPERIDGE FD
SPECIAL K FD ara
NATUREVALLEY FD
FD
AF COFFEE FD
MP FILTERS FT
LEAN CUISINE FD
A-Potato FD
LEAN POCKETS FD
PILSBRY CRES FD
COFFEEMATE FO
COSMETICS
COLGATE T
off
HOME
BOOKCASE
of f he
ZIPLOC
SPECIALTY
KY JELLY
L
So RE
OOTBALL T
Refund Value
T
WED CARD
Refund Value
RPG CARD
Refund Value
on
a Bi
on
foiaL

The output for this list should be:

MP Cookies --
Pepperidge Farm Cookies --
Special K Ceral --
Naturevalley Cookies --
AP Coffee --
Lean Cuisine Frozen --
Potato --
Lean Pockets Frozen --
Coffeemate --
Pillsbury Crescents --

---
Never use the above example as input, as it is just an example.

Below is the text that was extracted from the receipt:
`

export const parseOCR = async (items: string) => {
  try {
    const response = await generateText({
      model: openai("gpt-4o"),
      messages: convertToCoreMessages([{role: 'user', content: `${prompt}\n\n${items}`}]),
    })

    console.log(response.text)
    return response.text
  } catch (error) {
    console.error(error)
    return null
  }
}