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
     - "easy": CHỈ dành cho các câu hỏi cực kỳ đơn giản, không cần người supporter hỏi làm rõ thêm bất cứ câu hỏi nào vẫn tự trả lời được. KHÔNG chọn easy nếu ticket yêu cầu cần sự can thiệp, làm rõ của supporter.
     - "medium": Cần route đến bộ phận khác để xử lý trong các trường hợp:
        + Ticket còn mơ hồ, "mông lung", thiếu thông tin cụ thể để có thể giải quyết ngay (Ví dụ: "máy tôi bị lỗi", "giúp tôi với", "tại sao lại thế này"). Trong trường hợp này, BẮT BUỘC chọn medium để supporter hỏi làm rõ vấn đề.
        + Ticket hỏi về quy trình, cách cài đặt, hoặc hướng dẫn sử dụng phần mềm/dịch vụ (Ví dụ: "cài phần mềm của công ty bạn"). Những việc này cần được đưa đến đúng team phụ trách.
     - "hard": Công việc phức tạp, lỗi hệ thống nghiêm trọng, hoặc yêu cầu can thiệp sâu từ bộ phận kỹ thuật.

  **Lưu ý quan trọng:** 
  - Nếu nội dung ticket khiến bạn cảm thấy "mông lung" hoặc chưa hiểu rõ khách hàng muốn gì, hãy đánh dấu là "medium" và chọn team phù hợp để supporter tiếp nhận.
  - Tuyệt đối KHÔNG đánh dấu là "easy" cho các câu hỏi yêu cầu hướng dẫn (how-to) hoặc giải quyết lỗi kỹ thuật đòi hỏi cần có supporter làm rõ thêm.

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
     hãy chọn team_id phù hợp nhất để xử lý ticket này.
     - Nếu ticket_difficulty là "easy", hãy chọn team_id là null.
     - Nếu ticket_difficulty là "medium" hoặc "hard", BẮT BUỘC phải chọn một team_id từ danh sách bên dưới, KHÔNG được để null.

     Danh sách team:
     ${teamsJson}

  **Ticket cần phân tích:**
  ${ticket_content}

  **Kết quả trả về theo cấu trúc JSON sau:**
  {
    "ticket_difficulty": "easy | medium | hard",
    "ticket_priority": "low | medium | high",
    "ticket_tone": "happy | neutral | frustrated | angry | confused",
    "team_id": "string (UUID của team được chọn) hoặc null"
  }`;

  try {
    const response = await llm.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        thinkingConfig: {
          thinkingBudget: -1,
        },
        temperature: 0,
        topP: 0,
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