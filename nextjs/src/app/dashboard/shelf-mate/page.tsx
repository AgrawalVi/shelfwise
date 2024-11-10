"use client"

import ShelfMateForm from "@/components/forms/shelf-mate-form"
import ConfirmCard from "@/components/general/shelf-mate/confirm-cards"
import { ProcessedItem } from "@/types"
import { useState } from "react"

export default function ShelfMatePage() {
  const [NLPOutput, setNLPOutput] = useState<ProcessedItem[]>([])

  const removeCard = (item: ProcessedItem) => {
    setNLPOutput(NLPOutput.filter((data) => data !== item))
  }

  return (
    <div className="space-y-4">
      <ShelfMateForm setNLPOutput={setNLPOutput} />
      {NLPOutput && NLPOutput.length > 0 && (
        <>
          {NLPOutput.map((item, index) => (
            <ConfirmCard key={index} item={item} removeCard={removeCard} />
          ))}
        </>
      )}
    </div>
  )
}
