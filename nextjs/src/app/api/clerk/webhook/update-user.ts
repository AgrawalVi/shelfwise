import { updateUserByClerkId } from "@/data/users"
import { db } from "@/lib/db"
import { UserJSON } from "@clerk/nextjs/server"

export const updateUser = async (user: UserJSON) => {
  // check email
  const userEmail = user.email_addresses.filter(
    (email) => email.id === user.primary_email_address_id
  )

  await updateUserByClerkId(
    user.id,
    userEmail[0].email_address,
    user.first_name,
    user.last_name
  )

  return {
    success: "user updated successfully",
  }
}
