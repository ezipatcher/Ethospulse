
'use server';
/**
 * @fileOverview AI Carbon Twin Prediction Flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PredictionInputSchema = z.object({
  currentFootprint: z.number(),
  transportHabits: z.string(),
  energyHabits: z.string(),
  dietHabits: z.string(),
  simulationScenario: z.string().optional().describe("e.g., 'Switching to an EV', 'Becoming Vegan'"),
});

const PredictionOutputSchema = z.object({
  forecasts: z.object({
    oneMonth: z.number().describe("Predicted footprint in 1 month (tons)"),
    sixMonths: z.number().describe("Predicted footprint in 6 months (tons)"),
    oneYear: z.number().describe("Predicted footprint in 1 year (tons)"),
  }),
  riskScore: z.number().min(0).max(100).describe("Environmental risk score (100 is high risk)"),
  simulationAnalysis: z.string().describe("Impact analysis of the chosen simulation scenario."),
});

export type PredictionInput = z.infer<typeof PredictionInputSchema>;
export type PredictionOutput = z.infer<typeof PredictionOutputSchema>;

export async function generateCarbonTwinForecast(input: PredictionInput): Promise<PredictionOutput> {
  const { output } = await ai.generate({
    prompt: `You are the EthosPulse Carbon Twin Engine. 
    Analyze the user's current footprint (${input.currentFootprint} tons) and their habits.
    
    Transport: ${input.transportHabits}
    Energy: ${input.energyHabits}
    Diet: ${input.dietHabits}
    Scenario: ${input.simulationScenario || "None"}

    Predict their future emissions based on scientific climate modeling. 
    If a scenario is provided, factor in the immediate and long-term reduction/increase.
    Return a risk score where 0 is perfect and 100 is critical impact.`,
    output: { schema: PredictionOutputSchema },
  });

  if (!output) throw new Error('Failed to generate forecast');
  return output;
}
