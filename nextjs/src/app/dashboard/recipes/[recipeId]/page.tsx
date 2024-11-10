import { getRecipeWithDataById } from "@/data/recipes";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function page({ params }: { params: { recipeId: string } }) {
  const currentUser = auth();

  // Parse and validate the recipe ID
  const parsedRecipeId = parseInt(params.recipeId);
  if (isNaN(parsedRecipeId) || parsedRecipeId < 1) {
    redirect("/dashboard/recipes");
  }

  // Ensure user authentication
  if (!currentUser || !currentUser.userId) {
    return <div>Please sign in to view your recipes.</div>;
  }

  // Fetch recipe data
  const recipe = await getRecipeWithDataById(parsedRecipeId, currentUser.userId);
  if (!recipe) {
    return <div>Recipe not found.</div>;
  }

  // Render recipe details
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {/* Back to Recipes Link */}
      <div className="mb-6">
        <Link
          href="/dashboard/recipes"
          className="text-blue-500 hover:underline text-sm font-medium"
        >
          ← Back to Recipes
        </Link>
      </div>

      {/* Recipe Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold mb-2">{recipe.name}</h1>
        <p className="text-gray-600">{recipe.description}</p>
        <div className="flex justify-center items-center gap-4 mt-4">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
            Difficulty: {recipe.difficulty}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
            Time: {recipe.timeToMakeInSeconds / 60} mins
          </span>
        </div>
      </div>

      {/* Recipe Image */}
      {recipe.imageURL && (
        <div className="text-center mb-6">
          <img
            src={recipe.imageURL}
            alt={recipe.name}
            className="w-full max-h-64 object-cover rounded-md"
          />
        </div>
      )}

      {/* Ingredients Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
        <ul className="list-disc pl-6 space-y-2">
          {recipe.RecipeItem.map((item) => (
            <li key={item.id}>
              {item.quantity} {item.unit} of {item.item.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Steps Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Steps</h2>
        <ol className="list-decimal pl-6 space-y-2">
          {recipe.RecipeStep.map((step, index) => (
            <li key={step.id}>
              <p>
             {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
