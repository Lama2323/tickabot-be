import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in .env file');
}

const llm = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function sendToResponseGemini(ticket_content: string) {
  try {
    const result = await llm.models.generateContentStream({
      model: 'gemini-2.5-flash-lite', // tên model
      config: {
        thinkingConfig: {
          includeThoughts: false,  // không suy nghĩ
        },
      },
      contents: [{ 
        role: 'user', 
        parts: [{ 
          text: ticket_content    // nội dung ticket
        }] 
      }],
    });

    console.log('Streaming response from Gemini:');
    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        process.stdout.write(chunkText);
      }
    }
    console.log('\n\nGemini stream complete.');
  } catch (error) {
    console.error('Error sending ticket content to Gemini:', error);
    throw error;
  }
}