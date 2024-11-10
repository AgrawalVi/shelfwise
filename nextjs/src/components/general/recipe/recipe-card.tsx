import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Recipe } from "@prisma/client"
import { Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link href={`/dashboard/recipes/${recipe.id}`}>
      <Card>
        <CardHeader className="grid grid-cols-3 space-x-4">
          {recipe.imageURL && (
            <div className="aspect-square overflow-hidden">
              <img
                className="object-fit object-center"
                src={recipe.imageURL}
                alt={recipe.name}
                height={200}
                width={200}
              />
            </div>
          )}
          <div
            className={cn(
              "flex flex-col justify-between py-1",
              recipe.imageURL ? "col-span-2" : "col-span-3"
            )}
          >
            <CardTitle
              className={cn(
                "flex flex-col items-center justify-start leading-5 text-center"
              )}
            >
              {recipe.name}
            </CardTitle>
            <div className="flex justify-between px-6">
              <div className="flex items-center">
                <Clock size={17} />{" "}
                <span className="ml-1">
                  {recipe.timeToMakeInSeconds / 60 + "m"}
                </span>
              </div>
              <div>
                {recipe.difficulty === "Easy" && (
                  <>
                    <span className="text-2xl text-green-600">•</span>
                    <span className="text-2xl text-muted">•</span>
                    <span className="text-2xl text-muted">•</span>
                  </>
                )}
                {recipe.difficulty === "Medium" && (
                  <>
                    <span className="text-2xl text-orange-500">•</span>
                    <span className="text-2xl text-orange-500">•</span>
                    <span className="text-2xl text-muted">•</span>
                  </>
                )}
                {recipe.difficulty === "Hard" && (
                  <>
                    <span className="text-2xl text-red-600">•</span>
                    <span className="text-2xl text-red-600">•</span>
                    <span className="text-2xl text-red-600">•</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="">
          <CardDescription>{recipe.description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}
