import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { teamService } from "../services/teamService";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in .env file');
}

const llm = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const routeSchema = z.object({
  ticket_difficulty: z.enum(['easy', 'medium', 'hard']),
  ticket_priority: z.enum(['low', 'medium', 'high']),
  ticket_tone: z.enum(['happy', 'neutral', 'frustrated', 'angry', 'confused']),
  team_id: z.string().uuid().nullable(),
});

export async function sendToRouteGemini(ticket_content: string) {
  const teams = await teamService.getAllTeamNameAndDescription();
  const teamsJson = JSON.stringify(teams, null, 2);

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
  
  3. Cảm xúc của người dùng (ticket_tone):
     - "happy": Vui vẻ, hài lòng
     - "neutral": Bình thường, trung lập
     - "frustrated": Bực bội, khó chịu
     - "angry": Tức giận, không hài lòng
     - "confused": Bối rối, cần giải thích thêm

  4. Đội ngũ xử lý (team_id):
     Dựa vào nội dung ticket và danh sách các team dưới đây, 
     hãy chọn team_id phù hợp nhất để xử lý ticket này, 
     nếu ticket_difficulty là "easy", hãy chọn team_id là null, 
     vì easy có thể để LLM tự trả lời, 
     không cần route đến bộ phận khác.
     Danh sách team:
     ${teamsJson}

  **Ticket cần phân tích:**
  ${ticket_content}

  **Kết quả trả về theo cấu trúc JSON sau:**
  {
    "ticket_difficulty": "easy | medium | hard",
    "ticket_priority": "low | medium | high",
    "ticket_tone": "happy | neutral | frustrated | angry | confused",
    "team_id": "string (UUID của team được chọn)"
  }`;

  try {
    const response = await llm.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(routeSchema),
      },
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('Gemini response is empty');
    }

    return response.text;
  } catch (error) {
    console.error('Error sending ticket content to Gemini:', error);
    throw error;
  }
}