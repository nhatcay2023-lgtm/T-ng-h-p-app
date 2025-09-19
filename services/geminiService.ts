import { GoogleGenAI, Type } from "@google/genai";
import { PoemOptions } from '../types';

if (!process.env.API_KEY) {
    throw new Error("Biến môi trường API_KEY chưa được thiết lập.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getInspirationPrompt = (inspiration: string): string => {
    const trimmedInspiration = inspiration.trim();
    if (!trimmedInspiration) return '';

    const isUrl = (str: string) => {
        try {
            new URL(str);
            return true;
        } catch (_) {
            return false;
        }
    };
    
    const isYoutubeUrl = (url: string) => /(?:youtube\.com|youtu\.be)/.test(url);

    if (isUrl(trimmedInspiration)) {
        if (isYoutubeUrl(trimmedInspiration)) {
            return `\n\nYÊU CẦU CỐT LÕI: Phân tích và lấy cảm hứng từ chủ đề của video YouTube tại URL sau, dựa vào tiêu đề và mô tả có thể có của nó: "${trimmedInspiration}". Không truy cập nội dung video. Hãy tưởng tượng nội dung và cảm xúc của video để sáng tác.`;
        } else {
            return `\n\nYÊU CẦU CỐT LÕI: Phân tích và lấy cảm hứng từ chủ đề và nội dung có thể có tại URL trang web sau: "${trimmedInspiration}". Lưu ý rằng bạn không thể truy cập trực tiếp vào URL này, hãy dựa vào kiến thức của bạn về trang web này (nếu có) và chủ đề gợi ý từ URL để sáng tác.`;
        }
    } else {
        return `\n\nYÊU CẦU CỐT LÕI: Phân tích kỹ lưỡng và lấy cảm hứng chính từ nội dung văn bản sau: """${trimmedInspiration}"""`;
    }
};

const buildPrompt = (options: PoemOptions): string => {
  const { type, lines, style, context, customContext, emotions, audience, inspiration } = options;

  let prompt = `Hãy sáng tác một bài thơ bằng tiếng Việt.`;

  prompt += getInspirationPrompt(inspiration);
  
  prompt += `\n\nCác yêu cầu chi tiết khác cần tuân thủ:\n\n`;
  prompt += `- **Thể loại thơ:** ${type}\n`;
  prompt += `- **Số dòng dự kiến:** Khoảng ${lines} dòng\n`;
  prompt += `- **Phong cách:** ${style}\n`;
  
  if (customContext.trim()) {
    prompt += `- **Ngữ cảnh chính:** ${customContext.trim()}\n`;
  } else {
    prompt += `- **Ngữ cảnh:** ${context}\n`;
  }

  if (emotions.length > 0) {
    prompt += `- **Cảm xúc chủ đạo:** ${emotions.join(', ')}\n`;
  }

  prompt += `- **Ngôn ngữ và nội dung:** Phù hợp với đối tượng độc giả là "${audience}"\n\n`;
  
  return prompt;
}

export const generatePoem = async (options: PoemOptions, signal: AbortSignal): Promise<{ title: string; content: string; }> => {
  try {
    const prompt = buildPrompt(options);
    
    const poemGenerationPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: 'Một tiêu đề ngắn gọn, phù hợp và sáng tạo cho bài thơ.'
                    },
                    content: {
                        type: Type.STRING,
                        description: 'Nội dung đầy đủ của bài thơ được tạo ra theo các yêu cầu đã cho. Giữ nguyên các ký tự xuống dòng (\\n) để phân tách các dòng thơ.'
                    }
                },
                required: ['title', 'content']
            }
        }
    });

    const response = await Promise.race([
      poemGenerationPromise,
      new Promise<never>((_, reject) => {
        if (signal.aborted) {
          const err = new Error('Việc sáng tác thơ đã bị hủy.');
          err.name = 'AbortError';
          return reject(err);
        }
        signal.addEventListener("abort", () => {
          const err = new Error('Việc sáng tác thơ đã bị hủy.');
          err.name = 'AbortError';
          reject(err);
        }, { once: true });
      }),
    ]);
    
    const result = JSON.parse(response.text);

    if (result && typeof result.title === 'string' && typeof result.content === 'string') {
        return {
            title: result.title.trim(),
            content: result.content.trim()
        };
    } else {
        console.error("Phản hồi JSON không hợp lệ từ API:", response.text);
        throw new Error("Phản hồi từ AI không có định dạng hợp lệ (thiếu tiêu đề hoặc nội dung).");
    }
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error("Lỗi khi tạo thơ từ Gemini API:", error);
    }
    throw error;
  }
};