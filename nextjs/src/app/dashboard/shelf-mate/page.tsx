"use client"

import ShelfMateForm from "@/components/forms/shelf-mate-form"
import { ProcessedItem } from "@/types"
import { useState } from "react"

export default function ShelfMatePage() {
  const [NLPOutput, setNLPOutput] = useState<ProcessedItem[]>([])

  return <ShelfMateForm setNLPOutput={setNLPOutput} />
}
