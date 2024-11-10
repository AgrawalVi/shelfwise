'use server';

import { openai } from '@ai-sdk/openai';
import { generateText, convertToCoreMessages } from 'ai';
import { db } from '@/lib/db';
import { GroceryItem, ProcessedItem, nlpActions } from '@/types';
import { NLP_PROMPT } from './nlp-prompt';

export async function processNlpInput(userId: string, inputText: string): Promise<ProcessedItem[]> {
  if (!userId) {
    console.error('User ID is required');
    throw new Error('User ID is required');
  }

  // Query to get all the ingredients for the user
  const userIngredients = await db.item.findMany({
    where: { userId },
    select: { id: true, name: true, perishable: true },
  });

  // Create a map for easy lookup of ingredient names (case-insensitive)
  const ingredientMap = new Map(userIngredients.map(item => [item.name.toLowerCase(), item]));

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

  console.log('Original AI Response:', responseText);

  // Construct a new prompt for singular/plural adjustments
  const correctionPrompt = `
Given this response text:
${responseText}

And this list of existing ingredients:
${userIngredients.map(item => item.name).join(', ')}

Please adjust the response text to use the correct singular or plural form of the ingredients based on the list provided. If an ingredient is "apples" but the list has "apple," change "apples" to "apple," and vice versa. Leave any item not in the list unchanged.

Just give the correct text. 
For example ingredients: apple, banana, rice, sugar

original response text:
"ADD; apples: 11-11-24"

then the corrected response you should return is 
"ADD; apple: 11-11-24", don't give anything else except the corrected output
`;

  // Make another query to the OpenAI API for singular/plural correction
  let correctedResponse;
  try {
    correctedResponse = await generateText({
      model: openai('gpt-4o'),
      messages: convertToCoreMessages([{ role: 'user', content: correctionPrompt }]),
      maxTokens: 1000,
    });
  } catch (apiError) {
    console.error('Error with OpenAI correction API call:', apiError);
    throw new Error('Failed to call OpenAI API for correction');
  }

  let correctedResponseText;
  try {
    correctedResponseText = await correctedResponse.text;
  } catch (responseError) {
    console.error('Error reading corrected response text:', responseError);
    throw new Error('Failed to parse corrected response text');
  }

  console.log('Corrected AI Response:', correctedResponseText);

  // Parse the corrected response by newline and process each line
  const lines = correctedResponseText.split('\n').filter(line => line.trim() !== '');

  const processedItems: ProcessedItem[] = [];

  for (const line of lines) {
    const [command, itemsString] = line.split(';', 2).map(part => part.trim());

    let action: nlpActions | undefined;
    switch (command) {
      case 'ADD':
        action = nlpActions.ADD;
        break;
      case 'EDIT':
        action = nlpActions.EDIT;
        break;
      case 'DELETE':
        action = nlpActions.DELETE;
        break;
      default:
        console.error('Unknown command:', command);
        continue;
    }

    console.log(`Command: ${command}`);

    const items = itemsString.split(',').map(item => item.trim());

    for (const item of items) {
      const [itemName, dateStr] = item.split(':').map(part => part.trim());
      const ingredientKey = itemName.toLowerCase();

      // Determine expirationDate and perishable
      const expirationDate = dateStr && dateStr !== 'null' ? new Date(dateStr) : undefined;
      const perishable = expirationDate ? true : false;

      // Set itemId based on action type and ingredient existence
      let itemId = null;
      if (action !== nlpActions.ADD && ingredientMap.has(ingredientKey)) {
        itemId = ingredientMap.get(ingredientKey)!.id;
      }

      // Create the GroceryItem object with new info
      const groceryItem: GroceryItem = {
        name: itemName,
        perishable,
        expirationDate,
      };

      console.log(`Processed item - Action: ${action}, ItemID: ${itemId}, GroceryItem:`, groceryItem);

      // Add to the processed items array
      processedItems.push({
        action,
        itemId,
        groceryItem,
      });
    }
  }

  // Return the processed items array
  return processedItems;
}
