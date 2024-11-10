"use client"

import { BookOpen, Camera, Upload, Vegan, WandSparkles } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import UploadButton from "./general/upload-button"

export default function Footer() {
  const pathname = usePathname()

  return (
    <footer className="p-4 border-t sticky bottom-0 bg-background">
      <div className="grid grid-cols-3">
        <div className="flex flex-col items-center justify-center">
          <Link
            href="/dashboard/recipes"
            className={
              pathname.startsWith("/dashboard/recipes")
                ? "bg-accent/50 p-2 rounded-lg"
                : ""
            }
          >
            <BookOpen size={28} />
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center relative">
          {pathname === "/dashboard" ? (
            <UploadButton />
          ) : (
            <Link href="/dashboard">
              <Vegan size={28} />
            </Link>
          )}
        </div>
        <div className="flex flex-col items-center justify-center">
          <Link
            href="/dashboard/shelf-mate"
            className={
              pathname === "/dashboard/shelf-mate"
                ? "bg-accent/50 p-2 rounded-lg"
                : ""
            }
          >
            <WandSparkles size={28} />
          </Link>
        </div>
      </div>
    </footer>
  )
}
