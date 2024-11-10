'use server';

import { openai } from '@ai-sdk/openai';
import { generateText, convertToCoreMessages } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { getUserById } from '@/data/users';
import { getUserItems, saveRecipesToDatabase } from '@/data/generate-recipes-db';
import { db } from '@/lib/db';
import { BASE_PROMPT } from './recipe-prompt';

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

// Function to get an image URL for a given recipe name using fetch
async function fetchImageForRecipe(recipeName: string): Promise<string | null> {
  const apiKey = 'a302997197054c868e0c4bfc9d15bda7'; // Replace with your actual API key
  const endpoint = `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(recipeName)}&count=1`;

  try {
    const response = await fetch(endpoint, {
      headers: { 'Ocp-Apim-Subscription-Key': apiKey },
    });
    if (!response.ok) {
      console.error(`Error fetching image for recipe "${recipeName}": ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const images = data.value;

    if (images.length > 0) {
      return images[0].contentUrl; // Return the first image URL
    } else {
      console.log(`No image found for recipe: ${recipeName}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching image for recipe "${recipeName}":`, error);
    return null;
  }
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

    // Log image URL for each generated recipe
    for (const recipe of recipes) {
      const imageUrl = await fetchImageForRecipe(recipe.name);
      if (imageUrl) {
        console.log(`Image URL for ${recipe.name}:`, imageUrl);
      } else {
        console.log(`No image found for ${recipe.name}`);
      }
    }

    console.log('Recipes generated and saved successfully.');
  } catch (error) {
    console.error('Error generating recipes:', error);
    throw new Error('Failed to generate recipes');
  }
}
