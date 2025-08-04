'use server';

/**
 * @fileOverview This file implements the AI-powered duplicate cat check flow.
 *
 * - checkDuplicateCats - An exported function that takes cat submission details and checks for duplicates.
 * - CheckDuplicateCatsInput - The input type for the checkDuplicateCats function.
 * - CheckDuplicateCatsOutput - The return type for the checkDuplicateCats function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckDuplicateCatsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the found cat, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  locationDescription: z
    .string()
    .describe('The description of the location where the cat was found.'),
  catDescription: z.string().describe('The description of the cat.'),
});
export type CheckDuplicateCatsInput = z.infer<typeof CheckDuplicateCatsInputSchema>;

const CheckDuplicateCatsOutputSchema = z.object({
  isDuplicate: z
    .boolean()
    .describe(
      'Whether or not the submitted cat is likely a duplicate of an existing listing.'
    ),
  duplicateExplanation: z
    .string()
    .describe(
      'Explanation of why the submission is considered a duplicate, or why not.'
    ),
});
export type CheckDuplicateCatsOutput = z.infer<typeof CheckDuplicateCatsOutputSchema>;

export async function checkDuplicateCats(
  input: CheckDuplicateCatsInput
): Promise<CheckDuplicateCatsOutput> {
  return checkDuplicateCatsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkDuplicateCatsPrompt',
  input: {schema: CheckDuplicateCatsInputSchema},
  output: {schema: CheckDuplicateCatsOutputSchema},
  prompt: `You are an AI assistant that helps to identify duplicate cat listings.

You are given a new cat submission with the following details:

Location Description: {{{locationDescription}}}
Cat Description: {{{catDescription}}}
Photo: {{media url=photoDataUri}}

Determine if this submission is likely a duplicate of an existing cat listing.

Consider factors such as the cat's appearance, the location where it was found, and any other relevant details.

Return a boolean value indicating whether the submission is a duplicate and provide a brief explanation.

{{~json schema=CheckDuplicateCatsOutputSchema~}}
`,
});

const checkDuplicateCatsFlow = ai.defineFlow(
  {
    name: 'checkDuplicateCatsFlow',
    inputSchema: CheckDuplicateCatsInputSchema,
    outputSchema: CheckDuplicateCatsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

