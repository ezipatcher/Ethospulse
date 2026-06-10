
'use server';
/**
 * @fileOverview AI Sustainability Coach flow using Gemini.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AISustainabilityCoachInputSchema = z.object({
  carbonFootprintSummary: z.string(),
  recentActivities: z.array(z.string()),
});

const AISustainabilityCoachOutputSchema = z.object({
  analysis: z.string().describe("A professional analysis of the user's current environmental impact."),
  recommendations: z.array(z.object({
    action: z.string().describe("Specific actionable task."),
    impactLevel: z.enum(['low', 'medium', 'high']).describe("Relative impact on carbon footprint."),
    category: z.string().describe("e.g., Transport, Energy, Food, Lifestyle."),
    estimatedSavings: z.string().optional().describe("Estimated carbon (kg) or money ($) saved per month/year."),
  })).describe("Top 3-5 specific recommendations."),
});

export type AISustainabilityCoachInput = z.infer<typeof AISustainabilityCoachInputSchema>;
export type AISustainabilityCoachOutput = z.infer<typeof AISustainabilityCoachOutputSchema>;

export async function aiSustainabilityCoach(input: AISustainabilityCoachInput): Promise<AISustainabilityCoachOutput> {
  const { output } = await ai.generate({
    prompt: `You are the EthosPulse AI Sustainability Coach. 
    Analyze the following carbon footprint data and user context to provide a professional, motivational, and data-driven strategy.
    
    User Context & Footprint: 
    ${input.carbonFootprintSummary}
    
    Recent Progress/Struggles reported by user: 
    ${input.recentActivities.join('\n')}
    
    Instructions:
    1. Be specific. Don't just say 'drive less', say 'Switch 2 car commutes to cycling to save X kg CO2'.
    2. Provide realistic financial savings if applicable (e.g. energy bills, fuel costs).
    3. Keep the tone premium, scientific, yet encouraging.
    4. Focus on the 'High Impact' areas identified in the footprint breakdown first.`,
    output: { schema: AISustainabilityCoachOutputSchema },
  });

  if (!output) throw new Error('Failed to generate coach response');
  return output;
}
