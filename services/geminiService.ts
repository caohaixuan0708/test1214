import { GoogleGenAI } from "@google/genai";
import { PolishTone } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const polishTextWithGemini = async (text: string, tone: PolishTone): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key 缺失，请检查环境变量配置。");
  }

  if (!text.trim()) {
    return "";
  }

  const modelId = "gemini-2.5-flash";
  
  let promptInstruction = "";
  
  switch (tone) {
    case 'professional':
      promptInstruction = "将以下文本改写得更正式、专业，并纠正语法错误。保持原意不变。";
      break;
    case 'concise':
      promptInstruction = "总结并重写以下文本，使其简洁明了。删除不必要的废话。";
      break;
    case 'friendly':
      promptInstruction = "将以下文本改写得更温暖、友好、平易近人。";
      break;
    case 'creative':
      promptInstruction = "将以下文本改写得更具创意和吸引力。";
      break;
    default:
      promptInstruction = "修复语法并改善以下文本的流畅度。";
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${promptInstruction}\n\n输入文本:\n${text}`,
      config: {
        systemInstruction: "你是一位专业的编辑和写作助手。请仅返回润色后的文本，不要包含任何前言、后语或 Markdown 代码块标记。",
        temperature: 0.7,
      }
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("文本润色失败。请重试。");
  }
};

const polishTextWithZhipuProxy = async (text: string, tone: PolishTone): Promise<string> => {
  if (!text.trim()) {
    return "";
  }

  let promptInstruction = "";
  switch (tone) {
    case 'professional':
      promptInstruction = "将以下文本改写得更正式、专业，并纠正语法错误。保持原意不变。";
      break;
    case 'concise':
      promptInstruction = "总结并重写以下文本，使其简洁明了。删除不必要的废话。";
      break;
    case 'friendly':
      promptInstruction = "将以下文本改写得更温暖、友好、平易近人。";
      break;
    case 'creative':
      promptInstruction = "将以下文本改写得更具创意和吸引力。";
      break;
    default:
      promptInstruction = "修复语法并改善以下文本的流畅度。";
  }

  const payload = {
    model: 'glm-4-flash',
    messages: [
      { role: 'system', content: '你是一位专业的编辑和写作助手。请仅返回润色后的文本，不要包含任何前言、后语或代码块。' },
      { role: 'user', content: `${promptInstruction}\n\n输入文本:\n${text}` }
    ]
  };

  try {
    const res = await fetch('/api/zhipu/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(`Zhipu API Error: ${res.status}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return (typeof content === 'string' ? content : '')?.trim() || text;
  } catch (error) {
    console.error('Zhipu API Error:', error);
    throw new Error('文本润色失败。请重试。');
  }
};

export const polishText = async (text: string, tone: PolishTone): Promise<string> => {
  if (apiKey) {
    return polishTextWithGemini(text, tone);
  }
  return polishTextWithZhipuProxy(text, tone);
};
