
'use server';
/**
 * @fileOverview AI Appliance Scanner flow using Gemini Vision.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ScannerInputSchema = z.object({
  imageData: z.string().describe('Base64 encoded image of a room or home'),
});

const ScannerOutputSchema = z.object({
  identifiedAppliances: z.array(z.object({
    name: z.string(),
    estimatedMonthlyKwh: z.number(),
    efficiencyRating: z.enum(['low', 'medium', 'high']),
    optimizationTip: z.string(),
  })),
  totalEstimatedImpact: z.number().describe("Estimated monthly kWh for identified items"),
});

export type ScannerInput = z.infer<typeof ScannerInputSchema>;
export type ScannerOutput = z.infer<typeof ScannerOutputSchema>;

export async function scanRoomForAppliances(input: ScannerInput): Promise<ScannerOutput> {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: [
      { media: { url: input.imageData, contentType: 'image/jpeg' } },
      { text: "Identify all appliances in this image (e.g., AC, TV, Fridge, Fans). Estimate their monthly electricity usage (kWh) and provide an optimization tip for each." }
    ],
    output: { schema: ScannerOutputSchema },
  });

  if (!output) throw new Error('Failed to scan appliances');
  return output;
}
