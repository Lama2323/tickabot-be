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

const routeSchema = z.object({
  ticket_difficulty: z.enum(['easy', 'medium', 'hard']),
  ticket_priority: z.enum(['low', 'medium', 'high']),
  ticket_type: z.enum(['bug', 'feature', 'task', 'question']),
});

export async function sendToRouteGemini(ticket_content: string) {

  let prompt = `Hãy dựa vào nội dung ticket sau đây, 
  hãy phân định độ phức tạp của ticket (easy, medium, hard), 
  độ ưu tiên của ticket (low, medium, high), 
  và loại ticket ` + ticket_content + 
  ` theo cấu trúc 
  {
    "ticket_difficulty": "easy | medium | hard",
    "ticket_priority": "low | medium | high",
    "ticket_type": "bug | feature | task | question"
  }`;

  try {
    const response = await llm.models.generateContent({
      model: 'gemini-2.5-flash-lite', // tên model
      config: {
        thinkingConfig: {
          thinkingBudget: 0  // không suy nghĩ
        },
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(routeSchema),
      },
      contents: prompt,  // nội dung ticket   
    });

    console.log(response.text);
    console.log('\n\nGemini stream complete.');
  } catch (error) {
    console.error('Error sending ticket content to Gemini:', error);
    throw error;
  }
}