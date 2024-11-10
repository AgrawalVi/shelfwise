'use server';

import { openai } from '@ai-sdk/openai';
import { generateText, convertToCoreMessages } from 'ai';
import { NLP_PROMPT } from './nlp-prompt';

export async function processNlpInput(userId: string, inputText: string): Promise<string> {
  if (!userId) {
    console.error('User ID is required');
    throw new Error('User ID is required');
  }

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

  return responseText;
}
