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

  **YÊU CẦU PHÂN TÍCH:**

  1. Độ phức tạp (ticket_difficulty):
     - "easy": 
        + CHỈ dành cho các hội thoại chào hỏi xã giao (Ví dụ: "Chào", "Hello"), cảm ơn ("Cảm ơn bạn").
        + Hoặc các câu hỏi thông tin cực kỳ đơn giản mà KHÔNG cần bất kỳ sự can thiệp hay làm rõ nào từ con người. 
        + TUYỆT ĐỐI KHÔNG chọn "easy" nếu có bất kỳ dấu hiệu nào của lỗi kỹ thuật hoặc cần supporter hỗ trợ.

     - "medium": (LỰA CHỌN MẶC ĐỊNH cho hầu hết các vấn đề cần supporter can thiệp)
        + Ticket cần supporter hỏi làm rõ thêm thông tin vì còn mơ hồ, "mông lung" (Ví dụ: "tại sao máy tôi bị thế này?", "giúp tôi với", "lỗi rồi").
        + Ticket yêu cầu hướng dẫn kỹ thuật, cài đặt, hoặc giải quyết sự cố.
        + Ticket yêu cầu kiểm tra tài khoản hoặc dữ liệu người dùng.

     - "hard": 
        + Công việc cực kỳ phức tạp, lỗi hệ thống diện rộng.
        + Yêu cầu can thiệp sâu chuyên sâu từ bộ phận kỹ thuật cấp cao.


  **LƯU Ý QUAN TRỌNG (Để tránh việc AI "quá nhiệt tình" tự trả lời):** 
  - Đừng cố gắng tự giải quyết vấn đề nếu nó liên quan đến kỹ thuật hoặc sự cố. Hãy ưu tiên chọn "medium" để chuyển cho supporter.
  - Nếu nội dung ticket khiến bạn cảm thấy dù chỉ một chút "mông lung" hoặc chưa hiểu rõ khách hàng muốn gì, hãy đánh dấu là "medium".
  - Một câu hỏi mông lung như "vì sao máy tôi bị thế này" PHẢI được đánh dấu là "medium" để supporter vào hỏi lại khách hàng, không được coi là "easy".


  2. Độ ưu tiên (ticket_priority):
     - "high": Cần xử lý ngay, ảnh hưởng nghiêm trọng đến hệ thống/người dùng.
     - "medium": Cần xử lý sớm, nhưng không quá khẩn cấp.
     - "low": Có thể xử lý sau, không ảnh hưởng đến hoạt động chính.


  3. Cảm xúc của người dùng (ticket_tone):
     - "happy": Vui vẻ, hài lòng.
     - "neutral": Bình thường, trung lập.
     - "frustrated": Bực bội, khó chịu.
     - "angry": Tức giận, không hài lòng.
     - "confused": Bối rối, cần giải thích thêm.


  4. Đội ngũ xử lý (team_id):
     Dựa vào nội dung ticket và danh sách các team dưới đây, hãy chọn team_id phù hợp nhất để xử lý ticket này.
     - Nếu ticket_difficulty là "easy", hãy chọn team_id là null.
     - Nếu ticket_difficulty là "medium" hoặc "hard", BẮT BUỘC phải chọn một team_id từ danh sách bên dưới, KHÔNG được để null.

     Danh sách team:
     ${teamsJson}


  **NỘI DUNG TICKET CẦN PHÂN TÍCH:**
  ${ticket_content}


  **KẾT QUẢ TRẢ VỀ (ĐỊNH DẠNG JSON):**
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