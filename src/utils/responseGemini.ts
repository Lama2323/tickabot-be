import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in .env file');
}

const llm = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface TicketContext {
  ticket_difficulty: string;
  ticket_priority: string;
  ticket_tone: string;
  team_id: string | null;
}

export async function sendToResponseGemini(ticket_content: string, context: TicketContext) {

  let prompt = `
  Bạn là một nhân viên hỗ trợ khách hàng chuyên nghiệp.
  Hãy trả lời ticket dưới đây dựa trên các thông tin ngữ cảnh được cung cấp.

  **Thông tin ngữ cảnh:**
  - Độ khó: ${context.ticket_difficulty}
  - Độ ưu tiên: ${context.ticket_priority}
  - Cảm xúc khách hàng: ${context.ticket_tone}
  - Team xử lý: ${context.team_id}

  **Hướng dẫn trả lời:**
  - Nếu khách hàng đang "frustrated" hoặc "angry", hãy tỏ ra đồng cảm, xin lỗi và cam kết hỗ trợ nhanh chóng.
  - Nếu khách hàng "happy" hoặc "neutral", hãy giữ thái độ chuyên nghiệp, lịch sự.
  - Nếu độ ưu tiên là "high", hãy nhấn mạnh rằng vấn đề đang được ưu tiên xử lý ngay lập tức.
  - Trả lời trực tiếp vào vấn đề của khách hàng, ngắn gọn và súc tích.

  **Nội dung ticket:**
  ${ticket_content}
  `;

  try {
    const response = await llm.models.generateContent({
      model: 'gemini-2.5-flash-lite', // tên model
      config: {
        thinkingConfig: {
          thinkingBudget: -1  // không suy nghĩ
        },
      },
      contents: prompt    // nội dung ticket
    });

    return response.text;
  } catch (error) {
    console.error('Error sending ticket content to Gemini:', error);
    throw error;
  }
}