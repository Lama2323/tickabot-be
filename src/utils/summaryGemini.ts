import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in .env file');
}

const llm = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const summarySchema = z.object({
  problem: z.string(),
  solution: z.string(),
  shouldRemember: z.boolean(),
});

interface Message {
  sender_type: string;
  content: string;
}

export async function sendToSummaryGemini(messages: Message[]) {
  const conversation = messages.map(m => `${m.sender_type.toUpperCase()}: ${m.content}`).join('\n');

  let prompt = `Analyze the following support ticket conversation and summarize it into a "Problem" and "Solution".
  
  Also, determine if this Solution should be remembered for future auto-replies (shouldRemember).

  **Rules for shouldRemember:**
  - **TRUE**: IF AND ONLY IF the supporter provided a solution IMMEDIATELY after the user's question without asking ANY clarification questions. This implies the problem was clear and the solution is standard (One-shot resolution).
  - **FALSE**: If the supporter asked ANY clarification questions (e.g., "What version?", "Can you send a screenshot?", "Did you try X?"). If there is any back-and-forth to understand the problem, set this to false.

  **Conversation:**
  ${conversation}

  **Output JSON Format:**
  {
    "problem": "Concise summary of the user's issue",
    "solution": "Concise summary of the solution provided by the supporter",
    "shouldRemember": boolean
  }`;

  try {
    const response = await llm.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(summarySchema),
      },
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('Gemini response is empty');
    }

    return response.text;
  } catch (error) {
    console.error('Error summarizing ticket with Gemini:', error);
    throw error;
  }
}
