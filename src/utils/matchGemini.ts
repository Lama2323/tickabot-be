import { googleAI } from './geminiClient';
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const llm = googleAI;


const matchSchema = z.object({
  foundMatch: z.boolean(),
  solution: z.string().nullable(),
  confidence: z.number().describe('Confidence score between 0 and 1'),
});

interface ExistingSolution {
  problem: string;
  solution: string;
}

export async function sendToMatchGemini(userQuery: string, solutions: ExistingSolution[]) {
  if (solutions.length === 0) {
    return JSON.stringify({ foundMatch: false, solution: null, confidence: 0 });
  }

  // Format solutions for the prompt
  const solutionsText = solutions.map((s, index) =>
    `Suggestion ${index + 1}:\nProblem: ${s.problem}\nSolution: ${s.solution}`
  ).join('\n---\n');

  let prompt = `You are a helpful support assistant.
  
  **User Query:** "${userQuery}"

  **Knowledge Base (Known Problems & Solutions):**
  ${solutionsText}

  **Task:**
  Compare the User Query with the Known Problems in the Knowledge Base.
  - If the User Query is semantically very similar to one of the Known Problems (meaning it asks about the same issue), return "foundMatch": true and the corresponding "solution".
  - If the User Query is different from all Known Problems, return "foundMatch": false and "solution": null.
  - Provide a "confidence" score (0.0 to 1.0). Only return true if confidence > 0.8.

  **Output JSON Format:**
  {
    "foundMatch": boolean,
    "solution": "The solution text if found, otherwise null",
    "confidence": number
  }`;

  try {
    const response = await llm.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        thinkingConfig: {
          thinkingBudget: -1,
        },
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(matchSchema),
      },
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('Gemini response is empty');
    }

    return response.text;
  } catch (error) {
    console.error('Error matching ticket with Gemini:', error);
    throw error;
  }
}
