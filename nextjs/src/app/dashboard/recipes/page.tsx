import RecipeCard from "@/components/general/recipe/recipe-card"
import { getRecipesByUser } from "@/data/recipes"
import { auth } from "@clerk/nextjs/server"

export default async function RecipesPage() {
  const currentUser = auth()

  if (!currentUser || !currentUser.userId) {
    return <div>Please sign in to view your recipes.</div>
  }

  const recipes = await getRecipesByUser(currentUser.userId)

  if (!recipes) {
    return <div>You have no recipes yet. Add some food to your shelf!</div>
  }

  console.log(recipes)

  return (
    <div className="space-y-4 flex flex-col ">
      {recipes.map((recipe, index) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}
