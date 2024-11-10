// 'use server';

// import { openai } from '@ai-sdk/openai';
// import { generateText, convertToCoreMessages } from 'ai';
// import { auth } from '@clerk/nextjs/server';
// import { getUserById } from '@/data/users';
// import { NLP_PROMPT } from './nlp-prompt';

// export async function processNlpInput(userId: string, inputText: string): Promise<string> {
//   const currentUser = auth();
//   if (!currentUser.userId) {
//     console.error('Unauthorized access attempt');
//     throw new Error('Unauthorized');
//   }

//   const existingUser = await getUserById(userId);
//   if (!existingUser) {
//     console.error('User not found');
//     throw new Error('User not found');
//   }

//   const completePrompt = `${NLP_PROMPT}\n${inputText}`;

//   console.log('Complete prompt for NLP:', completePrompt);

//   let response;
//   try {
//     response = await generateText({
//       model: openai('gpt-4o'), // Using GPT-4 model
//       messages: convertToCoreMessages([{ role: 'user', content: completePrompt }]),
//       maxTokens: 1000,
//     });
//   } catch (apiError) {
//     console.error('Error with OpenAI API call:', apiError);
//     throw new Error('Failed to call OpenAI API');
//   }

//   let responseText;
//   try {
//     responseText = await response.text;
//   } catch (responseError) {
//     console.error('Error reading response text:', responseError);
//     throw new Error('Failed to parse response text');
//   }

//   console.log('AI Response:', responseText);

//   return responseText;
// }
