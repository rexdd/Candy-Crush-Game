
import { GoogleGenAI, Type } from "@google/genai";
import { GameMode, LevelData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLevelContent = async (mode: GameMode, level: number): Promise<LevelData> => {
  let prompt = "";
  
  if (mode === GameMode.ENGLISH_CHINESE) {
    prompt = `Generate 12 interesting pairs for kids learning English level ${level}. 
    Each pair should have 'left' (the English word) and 'right' (the Chinese translation word). 
    Do NOT use emojis. Example: {left: "Elephant", right: "大象"}.
    Focus on common vocabulary appropriate for elementary level.
    Format the response as a JSON array of objects with 'left' and 'right'.`;
  } else if (mode === GameMode.PINYIN) {
    prompt = `Generate 12 common Chinese words and their Pinyin for level ${level}.
    Format as JSON: 'left' (Chinese characters) and 'right' (Pinyin).`;
  } else {
    prompt = `Generate 12 math addition or subtraction problems for kids level ${level}.
    CRITICAL REQUIREMENT: Every problem MUST result in a UNIQUE answer. 
    Ensure the 'right' side values (answers) are all different from each other within this set of 12.
    Format as JSON: 'left' (Equation like "5 + 3") and 'right' (Result like "8").`;
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
    ? "Give a very short, cute, and encouraging phrase in Chinese for a kid who just matched a word."
    : "Give a very short, supportive phrase in Chinese for a kid who made a mistake.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text.trim().substring(0, 15);
  } catch {
    return isMatch ? "你真棒！" : "加油哦！";
  }
};
