
import { GoogleGenAI, Type } from "@google/genai";
import { GameMode, LevelData, Difficulty } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: { count: 9, desc: "基础简单的单词" },
  [Difficulty.MEDIUM]: { count: 12, desc: "中等难度的常见短语" },
  [Difficulty.HARD]: { count: 15, desc: "更具挑战性的长词或复杂算式" }
};

export const generateLevelContent = async (mode: GameMode, level: number, difficulty: Difficulty = Difficulty.MEDIUM): Promise<LevelData> => {
  const config = DIFFICULTY_CONFIG[difficulty];
  const ai = getAI();
  let prompt = "";
  
  if (mode === GameMode.ENGLISH_CHINESE) {
    prompt = `生成 ${config.count} 组适合小孩学习的${config.desc}中英单词。'left'英文, 'right'中文。不要Emoji。`;
  } else if (mode === GameMode.PINYIN) {
    prompt = `生成 ${config.count} 组${config.desc}汉字和拼音。'left'汉字, 'right'拼音。`;
  } else {
    prompt = `生成 ${config.count} 组${config.desc}数学加减法。'left'算式, 'right'结果。`;
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
  // 使用更稳定的 ID 生成方式
  const pairs = (rawData.pairs || []).slice(0, config.count).map((p: any, idx: number) => ({
    ...p,
    id: `pair-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`
  }));

  return { pairs };
};

export const getEncouragement = async (isMatch: boolean): Promise<string> => {
  const ai = getAI();
  const prompt = isMatch ? "给一个4字超可爱鼓励语" : "给一个4字安慰语";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text.trim().substring(0, 8);
  } catch {
    return isMatch ? "超棒鸭！" : "加油哦！";
  }
};
