'use server';

/**
 * @fileOverview A flow to generate hints for form fields using AI.
 *
 * - generateFormHint - A function that generates a hint for a given form field.
 * - FormHintInput - The input type for the generateFormHint function.
 * - FormHintOutput - The return type for the generateFormHint function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormHintInputSchema = z.object({
  fieldDescription: z
    .string()
    .describe('The description of the form field to generate a hint for.'),
});
export type FormHintInput = z.infer<typeof FormHintInputSchema>;

const FormHintOutputSchema = z.object({
  hint: z.string().describe('The AI-generated hint for the form field.'),
});
export type FormHintOutput = z.infer<typeof FormHintOutputSchema>;

export async function generateFormHint(input: FormHintInput): Promise<FormHintOutput> {
  return generateFormHintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formHintPrompt',
  input: {schema: FormHintInputSchema},
  output: {schema: FormHintOutputSchema},
  prompt: `You are an AI assistant that provides helpful hints for filling out form fields.

  Given the following field description, generate a concise and informative hint that explains the expected format and content for the field.

  Field Description: {{{fieldDescription}}}

  Hint:`,
});

const generateFormHintFlow = ai.defineFlow(
  {
    name: 'generateFormHintFlow',
    inputSchema: FormHintInputSchema,
    outputSchema: FormHintOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
