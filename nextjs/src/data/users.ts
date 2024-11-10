import "server-only"

import { db } from "@/lib/db"

export async function createUser(email: string, firstName: string | null, lastName: string | null, clerkId: string) {
  try {
    await db.user.create({
      data: {
        id: clerkId,
        email,
        firstName,
        lastName
      }
    })
  } catch (e) {
    console.error(e)
  }
}

export async function updateUserByClerkId(clerkId: string, email: string, firstName: string | null, lastName: string | null) {
  try {
    await db.user.update({
      where: {
        id: clerkId
      },
      data: {
        email,
        firstName,
        lastName
      }
    })
  } catch (e) {
    console.error(e)
  }
}

export async function getUserById(id: string){
  try{
    return await db.user.findUnique({
      where: {
        id: id
      }
    })
  } catch (e) {
    console.error(e)
    return null
  }
}