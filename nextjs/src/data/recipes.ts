import { db } from "@/lib/db"

export const getRecipesByUser = async (userId: string) => {
  try {
    return await db.recipe.findMany({
      where: {
        userId,
      },
      orderBy: {
        id: "desc",
      },
      take: 5,
    })
  } catch (e) {
    console.error(e)
    return null
  }
}

export const getRecipeWithDataById = async (
  recipeId: number,
  userId: string
) => {
  try {
    return await db.recipe.findUnique({
      where: {
        userId,
        id: recipeId,
      },
      include: {
        RecipeItem: {
          include: {
            item: true,
          },
        },
        RecipeStep: {
          orderBy: {
            id: "asc",
          },
        },
      },
    })
  } catch (e) {
    console.error(e)
    return null
  }
}

export const deleteRecipeById = async (recipeId: number, userId: string) => {
  try {
    await db.recipe.delete({
      where: {
        id: recipeId,
        userId,
      },
    })
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
