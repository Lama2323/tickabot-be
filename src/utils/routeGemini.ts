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

  let prompt = `Phân tích ticket dưới đây và xác định các thông số sau:

  **Yêu cầu:**
  1. Độ phức tạp (ticket_difficulty):
     - "easy": Công việc đơn giản, có thể để LLM tự đưa ra câu trả lời
     - "medium": Công việc trung bình, cần route đến bộ phận khác để xử lý
     - "hard": Công việc phức tạp, cần route đến bộ phận khác để xử lý
  
  2. Độ ưu tiên (ticket_priority):
     - "high": Cần xử lý ngay, ảnh hưởng nghiêm trọng đến hệ thống/người dùng
     - "medium": Cần xử lý sớm, nhưng không quá khẩn cấp
     - "low": Có thể xử lý sau, không ảnh hưởng đến hoạt động chính
  
  3. Loại ticket (ticket_type):
     - "bug": Lỗi phần mềm cần xử lý
     - "feature": Yêu cầu tính năng mới
     - "task": Công việc phát triển khác
     - "question": Câu hỏi cần giải đáp

  **Ticket cần phân tích:**
  ${ticket_content}

  **Kết quả trả về theo cấu trúc JSON sau:**
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