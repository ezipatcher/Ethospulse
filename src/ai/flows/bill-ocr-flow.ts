
'use server';
/**
 * @fileOverview Bill OCR flow for extracting electricity consumption.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BillOCRInputSchema = z.object({
  imageData: z.string().describe('Base64 encoded image of the bill'),
});

const BillOCROutputSchema = z.object({
  consumptionKwh: z.number().describe('Total electricity consumption in kWh'),
  period: z.string().describe('Billing period'),
  provider: z.string().describe('Utility provider name'),
  estimatedCarbonKg: z.number().describe('Estimated carbon emissions in kg (based on 0.4kg/kWh avg)'),
});

export type BillOCRInput = z.infer<typeof BillOCRInputSchema>;
export type BillOCROutput = z.infer<typeof BillOCROutputSchema>;

export async function extractBillData(input: BillOCRInput): Promise<BillOCROutput> {
  const { output } = await ai.generate({
    model: 'googleai/gemini-2.0-flash-exp',
    prompt: [
      { media: { url: input.imageData, contentType: 'image/jpeg' } },
      { text: "Extract the total electricity consumption in kWh from this bill. If multiple numbers are present, use the total for the billing period. Also identify the provider and period." }
    ],
    output: { schema: BillOCROutputSchema },
  });

  if (!output) throw new Error('Failed to extract bill data');
  return output;
}
