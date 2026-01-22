
import { GoogleGenAI, Type } from "@google/genai";
import { GameMode, LevelData, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: { count: 6, desc: "简单常用的" },
  [Difficulty.MEDIUM]: { count: 12, desc: "标准水平的" },
  [Difficulty.HARD]: { count: 18, desc: "具有挑战性的、更长或更复杂的" }
};

export const generateLevelContent = async (mode: GameMode, level: number, difficulty: Difficulty = Difficulty.MEDIUM): Promise<LevelData> => {
  const config = DIFFICULTY_CONFIG[difficulty];
  let prompt = "";
  
  if (mode === GameMode.ENGLISH_CHINESE) {
    prompt = `生成 ${config.count} 组适合小孩学习的${config.desc}中英单词。
    要求：'left' 为英文，'right' 为中文。等级：${level}。
    不使用 Emoji。例如：{left: "Elephant", right: "大象"}。
    以 JSON 格式返回。`;
  } else if (mode === GameMode.PINYIN) {
    prompt = `生成 ${config.count} 组${config.desc}汉字和拼音。等级：${level}。
    'left' 为汉字，'right' 为拼音。以 JSON 格式返回。`;
  } else {
    prompt = `生成 ${config.count} 组${config.desc}数学加减法。等级：${level}。
    核心要求：每个算式的答案必须是唯一的，不要出现重复答案！
    'left' 为算式（如 "12 + 5"），'right' 为结果。以 JSON 格式返回。`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pairs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                left: { type: Type.STRING },
                right: { type: Type.STRING }
              },
              required: ["left", "right"]
            }
          }
        }
      }
    }
  });

  const rawData = JSON.parse(response.text);
  const pairs = (rawData.pairs || []).map((p: any, idx: number) => ({
    ...p,
    id: `pair-${level}-${idx}`
  }));

  return { pairs };
};

export const getEncouragement = async (isMatch: boolean): Promise<string> => {
  const prompt = isMatch 
    ? "给一个非常短、可爱且鼓励小孩的话，4-6个字。"
    : "给一个非常短、安慰小孩的话，4-6个字。";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text.trim().substring(0, 10);
  } catch {
    return isMatch ? "你太厉害啦！" : "再接再厉哦！";
  }
};
