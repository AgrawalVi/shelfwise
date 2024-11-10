import { clerkClient, UserJSON } from "@clerk/nextjs/server"
import { createUser } from "@/data/users"

export const newUser = async (user: UserJSON) => {
  // need to create the user in the database
  const userEmail = user.email_addresses.filter(
    (email) => email.id === user.primary_email_address_id
  )

  await createUser(
    userEmail[0].email_address,
    user.first_name,
    user.last_name,
    user.id
  )

  return { success: "user created" }
}
