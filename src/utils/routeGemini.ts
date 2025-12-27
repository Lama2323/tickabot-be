import { googleAI } from './geminiClient';
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { teamService } from "../services/teamService";

const llm = googleAI;



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
     - "easy": (Gemini có thể tự trả lời NGAY mà không cần hỏi lại)
        + Các hội thoại xã giao (Chào, Cảm ơn).
        + Các câu hỏi thông tin đơn giản, RÕ RÀNG, đầy đủ ngữ cảnh.
        + CHỈ chọn "easy" nếu bạn CHẮC CHẮN 100% rằng câu hỏi này không cần supporter xác minh thêm thông tin và câu trả lời là hướng dẫn cơ bản.

     - "medium": (Cần supporter can thiệp hoặc cần làm rõ vấn đề)
        + Câu hỏi MƠ HỒ, THIẾU THÔNG TIN (Ví dụ: "Tại sao không được?", "Lỗi rồi", "giúp tôi với", "máy tôi bị thế này"). -> Cần người hỏi lại để làm rõ.
        + Báo cáo lỗi kỹ thuật cụ thể cần kiểm tra hệ thống hoặc can thiệp vào tài khoản.
        + Bất cứ khi nào bạn cảm thấy cần phải hỏi lại người dùng "Ý bạn là gì?" hoặc "Vui lòng cung cấp thêm thông tin", hãy chọn "medium".

     - "hard": 
        + Công việc cực kỳ phức tạp, lỗi hệ thống nghiêm trọng, phàn nàn gay gắt.
        + Yêu cầu can thiệp sâu từ nhiều bộ phận.


  **LƯU Ý QUAN TRỌNG (CÂN NHẮC KỸ LƯỠNG):** 
  - Mục tiêu: Tự động trả lời những gì ĐƠN GIẢN và RÕ RÀNG. Chuyển cho người những gì MƠ HỒ hoặc PHỨC TẠP.
  - VỚI CÁC CÂU HỎI MƠ HỒ (như "máy bình lỗi", "sao không vào được"): Tuyệt đối ĐỪNG đoán mò nguyên nhân để trả lời. Hãy chọn "medium" để supporter hỏi lại cho chắc chắn.
  - Nếu câu hỏi đã RÕ RÀNG về mặt hướng dẫn sử dụng (như "Cách tạo tài khoản?"): Hãy chọn "easy" để tự trả lời, đừng làm phiền supporter.


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