"use client"

import { ClerkLoading, SignedIn, UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { Skeleton } from "./ui/skeleton"

export default function Header() {
  const pathname = usePathname()

  let headerText

  if (pathname === "/dashboard") {
    headerText = "Your Shelf"
  } else if (pathname === "/dashboard/shelf-mate") {
    headerText = "Shelf Mate"
  } else {
    headerText = "Recipe Book"
  }

  return (
    <header className="p-4 border-b flex justify-between items-center bg-background sticky top-0">
      <h1 className="text-4xl font-bold text-left">{headerText}</h1>
      <ClerkLoading>
        <Skeleton className="h-7 w-7 rounded-full" />
      </ClerkLoading>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  )
}
