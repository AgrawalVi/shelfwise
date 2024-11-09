import * as z from 'zod'

export const groceryItemSchema = z.object({
  name: z.string(),
  perishable: z.boolean(),
  expirationDate: z.date().optional()
}).refine(
  (data) => !data.perishable || data.expirationDate !== undefined,
  {
    message: "Expiration date is required for perishable items",
    path: ["expirationDate"],
  }
);