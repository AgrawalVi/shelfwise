'use server';

import { openai } from '@ai-sdk/openai';
import { generateText, convertToCoreMessages } from 'ai';
import { db } from '@/lib/db';
import { NLP_PROMPT } from './nlp-prompt';

export async function processNlpInput(userId: string, inputText: string): Promise<string> {
  if (!userId) {
    console.error('User ID is required');
    throw new Error('User ID is required');
  }

  // Query to get all the ingredients for the user
  const userIngredients = await db.item.findMany({
    where: { userId },
    select: { id: true, name: true },
  });

  // Create a map for easy lookup of ingredient names (case-insensitive)
  const ingredientMap = new Map(userIngredients.map(item => [item.name.toLowerCase(), item.id]));

  const completePrompt = `${NLP_PROMPT}\n${inputText}`;
  console.log('Complete prompt for NLP:', completePrompt);

  let response;
  try {
    response = await generateText({
      model: openai('gpt-4o'),
      messages: convertToCoreMessages([{ role: 'user', content: completePrompt }]),
      maxTokens: 1000,
    });
  } catch (apiError) {
    console.error('Error with OpenAI API call:', apiError);
    throw new Error('Failed to call OpenAI API');
  }

  let responseText;
  try {
    responseText = await response.text;
  } catch (responseError) {
    console.error('Error reading response text:', responseError);
    throw new Error('Failed to parse response text');
  }

  console.log('AI Response:', responseText);

  // Parse the response by newline and process each line
  const lines = responseText.split('\n').filter(line => line.trim() !== '');

  for (const line of lines) {
    const [command, itemsString] = line.split(';', 2).map(part => part.trim());

    if (command === 'ADD' || command === 'EDIT' || command === 'DELETE') {
      console.log(`Command: ${command}`);

      const items = itemsString.split(',').map(item => item.trim());

      for (const item of items) {
        if (command === 'DELETE') {
          // Handle DELETE - only check item existence
          if (ingredientMap.has(item.toLowerCase())) {
            console.log(`Item exists: ${item}`);
          } else {
            console.log(`Item not found in user's ingredients: ${item}`);
          }
        } else {
          // Handle ADD and EDIT - check item and parse date
          const [itemName, date] = item.split(':').map(part => part.trim());
          if (ingredientMap.has(itemName.toLowerCase())) {
            console.log(`Item exists: ${itemName}, Date: ${date}`);
          } else {
            console.log(`Item not found in user's ingredients: ${itemName}`);
          }
        }
      }
    } else {
      console.error('Unknown command:', command);
    }
  }

  return responseText;
}
