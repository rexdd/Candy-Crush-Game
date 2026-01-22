
import { GoogleGenAI, Type } from "@google/genai";
import { GameMode, LevelData, Difficulty } from "../types";

// 延迟初始化函数，确保在使用时 process.env 已就绪
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: { count: 6, desc: "最基础、常见的，单词长度在5个字母以内" },
  [Difficulty.MEDIUM]: { count: 12, desc: "中等难度的，包含常见短语或多音节单词" },
  [Difficulty.HARD]: { count: 18, desc: "高难度的，包含较长单词、复杂汉字或三位数数学运算" }
};

export const generateLevelContent = async (mode: GameMode, level: number, difficulty: Difficulty = Difficulty.MEDIUM): Promise<LevelData> => {
  const config = DIFFICULTY_CONFIG[difficulty];
  const ai = getAI();
  let prompt = "";
  
  if (mode === GameMode.ENGLISH_CHINESE) {
    prompt = `生成 ${config.count} 组适合小孩学习的${config.desc}中英单词。
    要求：'left' 为英文，'right' 为中文。等级：${level}。
    不使用 Emoji。例如：{left: "Butterfly", right: "蝴蝶"}。
    以 JSON 格式返回。`;
  } else if (mode === GameMode.PINYIN) {
    prompt = `生成 ${config.count} 组${config.desc}汉字和拼音。等级：${level}。
    'left' 为汉字，'right' 为拼音。以 JSON 格式返回。`;
  } else {
    prompt = `生成 ${config.count} 组${config.desc}数学加减法。等级：${level}。
    'left' 为算式，'right' 为结果。答案必须唯一。以 JSON 格式返回。`;
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
    id: `pair-${Date.now()}-${idx}`
  }));

  return { pairs };
};

export const getEncouragement = async (isMatch: boolean): Promise<string> => {
  const ai = getAI();
  const prompt = isMatch 
    ? "给一个4-6字的超级可爱的童言童语鼓励话语。"
    : "给一个4-6字的安慰小孩再试一次的可爱话语。";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text.trim().substring(0, 8);
  } catch {
    return isMatch ? "你真棒鸭！" : "差一点点呢！";
  }
};
