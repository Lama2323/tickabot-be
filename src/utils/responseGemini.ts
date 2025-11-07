import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in .env file');
}

const llm = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function sendToResponseGemini(ticket_content: string) {

  let prompt = ticket_content;

  try {
    const response = await llm.models.generateContent({
      model: 'gemini-2.5-flash-lite', // tên model
      config: {
        thinkingConfig: {
          thinkingBudget: 0  // không suy nghĩ
        },
      },
      contents: prompt    // nội dung ticket
    });

    console.log(response.text);
    console.log('\n\nGemini stream complete.');
  } catch (error) {
    console.error('Error sending ticket content to Gemini:', error);
    throw error;
  }
}