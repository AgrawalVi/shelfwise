import { db } from '@/lib/db';
import { RecipeDifficulty } from '@prisma/client';

// Function to fetch unexpired items for the user
export async function getUserItems(userId: string) {
  const currentDate = new Date();
  const userItems = await db.item.findMany({
    where: {
      userId,
      expiresAt: {
        gte: currentDate,
      },
    },
    select: {
      name: true,
    },
  });
  console.log(`Fetched ${userItems.length} unexpired items for user ${userId}.`);
  return userItems;
}

// Function to save recipes to the database
export async function saveRecipesToDatabase(recipes: any[], userId: string): Promise<void> {
  for (const recipe of recipes) {
    try {
      console.log(`\nStarting to save recipe: "${recipe.name || 'Unnamed Recipe'}"`);

      // Map difficulty string to enum value
      let difficultyEnumValue: RecipeDifficulty;
      switch (recipe.difficulty?.toLowerCase()) {
        case 'easy':
          difficultyEnumValue = RecipeDifficulty.Easy;
          break;
        case 'medium':
          difficultyEnumValue = RecipeDifficulty.Medium;
          break;
        case 'hard':
          difficultyEnumValue = RecipeDifficulty.Hard;
          break;
        default:
          difficultyEnumValue = RecipeDifficulty.Medium; // Default to Medium if not specified
      }

      // Save the recipe
      const savedRecipe = await db.recipe.create({
        data: {
          name: recipe.name || 'Unnamed Recipe',
          description: recipe.description || '',
          timeToMakeInSeconds: recipe.timeToMakeInSeconds || 0,
          difficulty: difficultyEnumValue,
          userId,
        },
      });
      console.log(`Recipe saved with ID: ${savedRecipe.id}`);

      // Save Recipe Steps
      if (recipe.steps && recipe.steps.length > 0) {
        console.log(`Saving ${recipe.steps.length} steps for recipe ID: ${savedRecipe.id}`);
        for (const step of recipe.steps) {
          const savedStep = await db.recipeStep.create({
            data: {
              text: step.text,
              time: 0, // Adjust as needed; currently set to 0 as time per step isn't provided
              recipeId: savedRecipe.id,
            },
          });
          console.log(`Saved step with ID: ${savedStep.id}`);
        }
      } else {
        console.log('No steps to save for this recipe.');
      }

      // Save Recipe Items (Ingredients)
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        console.log(`Processing ${recipe.ingredients.length} ingredients for recipe ID: ${savedRecipe.id}`);
        for (const ingredient of recipe.ingredients) {
          // Skip assumed ingredients if they are not in the user's items
          if (ingredient.assumed) {
            console.log(`Skipping assumed ingredient: "${ingredient.name}"`);
            continue;
          }

          const existingItem = await db.item.findFirst({
            where: { name: ingredient.name, userId },
          });

          if (existingItem) {
            const savedRecipeItem = await db.recipeItem.create({
              data: {
                quantity: ingredient.quantity || 0,
                unit: ingredient.unit || '',
                itemId: existingItem.id,
                recipeId: savedRecipe.id,
              },
            });
            console.log(`Saved ingredient "${ingredient.name}" with ID: ${savedRecipeItem.id}`);
          } else {
            console.warn(`Ingredient "${ingredient.name}" not found for user ${userId}.`);
          }
        }
      } else {
        console.log('No ingredients to save for this recipe.');
      }

      console.log(`Finished saving recipe: "${savedRecipe.name}"\n`);
    } catch (dbError) {
      console.error('Error saving recipe to the database:', dbError);
      throw new Error('Failed to save recipe to the database');
    }
  }
}
