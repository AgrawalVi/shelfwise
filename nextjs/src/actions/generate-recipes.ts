'use server';

import { openai } from '@ai-sdk/openai';
import { generateText, convertToCoreMessages } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { getUserById } from '@/data/users';
import { getUserItems, saveRecipesToDatabase } from '@/data/generate-recipes-db'; // Import the necessary functions
import { db } from '@/lib/db'; // Ensure you import your database connection

// Base prompt to use directly in the code
const BASE_PROMPT = `
You are a helpful and creative assistant for a Recipe Management System. You will be provided with a list of ingredients that are currently available and unexpired for a user.

Your task is to generate a list of recipes that the user can make using these ingredients. The details of each recipe must be formatted strictly according to the structure provided below. Please provide clear and detailed information, ensuring that the response is comprehensive and easy for the user to follow.

Each recipe should include:
- Recipe Name: Provide a name that is descriptive but concise.
- Short Description: A brief description of the dish that highlights the key features of the recipe.
- Ingredients: A detailed list of ingredients, including the quantity and unit for each ingredient, formatted as "{ingredient_name} - {quantity} {unit}".
- Time Required (in seconds): The estimated time required to prepare the recipe, provided in seconds.
- Difficulty Level: One of the following levels: "Easy", "Medium", or "Hard".
- Steps: Provide detailed step-by-step instructions for preparing the dish. Each step should be thorough and include necessary details to ensure the user can successfully follow the recipe.

Guidelines for the Response:
1. Use as many of the provided ingredients as possible in each recipe. If there are multiple possibilities, prefer the ones that are most commonly used together.
2. If certain ingredients are essential but not provided, you may add standard pantry items such as salt, pepper, water, or oil. Clearly mark these as "assumed ingredients".
3. If there are ingredients that could be used optionally, include them under an "Optional Ingredients" section.
4. Provide up to 5 different recipe suggestions using a variety of the provided ingredients to ensure diversity.
5. Maintain a formal and informative tone throughout the response. Do not use casual or ambiguous language.
6. Ensure that each line of your response ends with " -- ".
7. Ensure that the steps are detailed and provide enough information for a user to prepare the dish successfully.
8. When listing out all the ingredients in the ingredients list, make sure to not change the name of the ingredient at all, not even lower case of upper case

The format for each recipe should look like the following:

Recipe Name:: "Vegetable Stir Fry" -- 
Short Description:: "A quick and healthy stir fry made with fresh vegetables that are packed with nutrients." -- 
Ingredients:: "Carrot - 2 pcs, broccoli - 1 cup, Olive Oil - 2 tbsp, Salt - 1 tsp (assumed)" -- 
Time Required (in seconds):: 900 -- 
Difficulty Level:: "Easy" -- 
Steps:: 
1. Wash the carrots and broccoli thoroughly under running water. Peel the carrots and slice them diagonally into thin pieces. Cut the broccoli into small florets. -- 
2. Heat 2 tablespoons of olive oil in a large skillet or wok over medium-high heat. -- 
3. Once the oil is hot, add the sliced carrots to the skillet. Stir-fry for about 3 minutes until they start to soften. -- 
4. Add the broccoli florets to the skillet with the carrots. Continue to stir-fry for another 4-5 minutes, or until the vegetables are tender but still crisp. -- 
5. Season the vegetables with 1 teaspoon of salt, stirring well to ensure even distribution. -- 
6. Remove the skillet from heat and transfer the stir-fried vegetables to a serving dish. Serve hot. -- 
Optional Ingredients:: "Soy Sauce - 2 tbsp" -- 

Recipe Name:: "Creamy Tomato Pasta" -- 
Short Description:: "A rich and creamy pasta dish with a tangy tomato base." -- 
Ingredients:: "Pasta - 200 grams, Tomato - 2 pcs, Cream - 100 ml, Olive Oil - 1 tbsp, Garlic - 2 cloves (assumed), Salt - 1 tsp (assumed)" -- 
Time Required (in seconds):: 1200 -- 
Difficulty Level:: "Medium" -- 
Steps:: 
1. Fill a large pot with water and add 1 teaspoon of salt. Bring it to a boil over high heat. Add 200 grams of pasta to the boiling water and cook according to the package instructions until al dente. Stir occasionally to prevent sticking. -- 
2. While the pasta is cooking, prepare the sauce. Chop the tomatoes into small pieces and mince the 2 cloves of garlic. -- 
3. In a separate pan, heat 1 tablespoon of olive oil over medium heat. Add the minced garlic and sauté for 1-2 minutes until fragrant, being careful not to burn it. -- 
4. Add the chopped tomatoes to the pan with the garlic. Cook for about 5 minutes, stirring occasionally, until the tomatoes soften and begin to break down into a sauce. -- 
5. Pour 100 ml of cream into the tomato mixture. Stir well to combine, and let it simmer for another 5 minutes. Season the sauce with salt to taste. -- 
6. Once the pasta is cooked, drain it well and add it directly to the pan with the sauce. Toss the pasta and sauce together over low heat for 2-3 minutes to allow the flavors to meld. -- 
7. Remove from heat and transfer the creamy tomato pasta to serving plates. Serve immediately. -- 
Optional Ingredients:: "Basil - 5 leaves, Parmesan Cheese - 20 grams" -- 
`;

// Function to parse the AI response
function parseRecipesFromResponse(response: string) {
  const recipes = [];
  const recipeStrings = response.split('Recipe Name::').slice(1); // Skip the first empty element

  for (const recipeString of recipeStrings) {
    const recipeData: any = {};

    // Split the recipeString into lines
    const lines = recipeString.split('--').map(line => line.trim()).filter(line => line);

    // Helper function to extract data
    const extractData = (lines: string[], label: string): string | null => {
      const line = lines.find(l => l.startsWith(label));
      if (line) {
        const data = line.substring(label.length).trim();
        return data.replace(/^"|"$/g, ''); // Remove surrounding quotes
      }
      return null;
    };

    recipeData.name = extractData(lines, '');
    recipeData.description = extractData(lines, 'Short Description::');
    const ingredientsStr = extractData(lines, 'Ingredients::');
    recipeData.ingredients = ingredientsStr ? parseIngredients(ingredientsStr) : [];

    const timeStr = extractData(lines, 'Time Required (in seconds)::');
    recipeData.timeToMakeInSeconds = timeStr ? parseInt(timeStr, 10) : 0;

    recipeData.difficulty = extractData(lines, 'Difficulty Level::');

    // Extract steps
    const stepsIndex = lines.findIndex(l => l.startsWith('Steps::'));
    if (stepsIndex !== -1) {
      const steps = [];
      for (let i = stepsIndex + 1; i < lines.length; i++) {
        const stepLine = lines[i];
        const stepMatch = stepLine.match(/^(\d+)\.\s*(.*)/);
        if (stepMatch) {
          steps.push({
            stepNumber: parseInt(stepMatch[1], 10),
            text: stepMatch[2].trim(),
          });
        } else {
          break; // Stop if the line doesn't match a step
        }
      }
      recipeData.steps = steps;
    } else {
      recipeData.steps = [];
    }

    // Extract optional ingredients
    const optionalIngredientsStr = extractData(lines, 'Optional Ingredients::');
    recipeData.optionalIngredients = optionalIngredientsStr ? parseIngredients(optionalIngredientsStr) : [];

    recipes.push(recipeData);
  }

  return recipes;
}

// Function to parse ingredients string into an array of ingredients
function parseIngredients(ingredientsStr: string) {
  const ingredients = ingredientsStr.split(',').map(ingredientStr => {
    let [namePart, quantityUnitPart] = ingredientStr.trim().split(' - ');
    let assumed = false;

    // Check for "(assumed)" in the name or unit
    if (namePart.includes('(assumed)')) {
      namePart = namePart.replace('(assumed)', '').trim();
      assumed = true;
    }

    // Extract quantity and unit
    let quantity: number | null = null;
    let unit: string | null = null;

    if (quantityUnitPart) {
      // Check if "(assumed)" is in the unit
      if (quantityUnitPart.includes('(assumed)')) {
        quantityUnitPart = quantityUnitPart.replace('(assumed)', '').trim();
        assumed = true;
      }

      const parts = quantityUnitPart.trim().split(' ');
      if (parts.length >= 1) {
        quantity = parseFloat(parts[0]);
        unit = parts.slice(1).join(' ') || null;
      }
    }

    return {
      name: namePart.trim(),
      quantity,
      unit,
      assumed,
    };
  });
  return ingredients;
}

// Function to generate and save recipes
export async function generateAndSaveRecipes(): Promise<void> {
  const currentUser = auth();

  if (!currentUser.userId) {
    console.log('Unauthorized');
    throw new Error('Unauthorized');
  }

  const existingUser = await getUserById(currentUser.userId);

  if (!existingUser) {
    console.log('User not found');
    throw new Error('User not found');
  }

  const userId = existingUser.id;

  console.log('Starting recipe generation...');

  try {
    // Fetch usable ingredients for the user
    console.log('Fetching usable ingredients for user...');
    const userItems = await getUserItems(userId);

    if (!userItems.length) {
      console.log('No usable ingredients found for the user.');
      return;
    }

    console.log('Usable ingredients found:', userItems);

    // Fetch the last 10 recipe names for the user
    const lastRecipes = await db.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { name: true },
    });

    const lastRecipeNames = lastRecipes.map(recipe => recipe.name).join(', ');

    // Create the full prompt with ingredients and exclude the last 10 recipes
    let extendedPrompt = `${BASE_PROMPT}\n\nIngredients provided for generating the recipes:\n${userItems.map(item => item.name).join(', ')}\n`;
    if (lastRecipeNames) {
      extendedPrompt += `\nDo not give these recipes: ${lastRecipeNames}\n`;
    }

    console.log('Generated prompt:', extendedPrompt);

    // Generate recipes using the OpenAI API with GPT-4
    let response;
    try {
      response = await generateText({
        model: openai('gpt-4'), // Using GPT-4 model
        messages: convertToCoreMessages([{ role: 'user', content: extendedPrompt }]),
        maxTokens: 2000,
      });
    } catch (apiError) {
      console.error('Error with OpenAI API call:', apiError);
      throw new Error('Failed to call OpenAI API');
    }

    // Fetch the complete response as text
    let recipesData;
    try {
      recipesData = await response.text;
    } catch (responseError) {
      console.error('Error reading response text:', responseError);
      throw new Error('Failed to parse response text');
    }

    console.log('AI Response:', recipesData);

    // Parse the recipes from the AI response
    let recipes;
    try {
      recipes = parseRecipesFromResponse(recipesData);
      console.log('Parsed recipes:', recipes);
    } catch (parseError) {
      console.error('Error parsing recipes:', parseError);
      throw new Error('Failed to parse recipes from AI response');
    }

    // Save the recipes to the database
    await saveRecipesToDatabase(recipes, userId);

    console.log('Recipes generated and saved successfully.');
  } catch (error) {
    console.error('Error generating recipes:', error);
    throw new Error('Failed to generate recipes');
  }
}
