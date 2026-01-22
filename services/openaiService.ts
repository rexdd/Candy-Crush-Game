
import { GameMode, LevelData, Difficulty, AIConfig } from "../types";

const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: { count: 9, desc: "简单的" },
  [Difficulty.MEDIUM]: { count: 12, desc: "普通难度的" },
  [Difficulty.HARD]: { count: 15, desc: "有挑战性的" }
};

const ENV_OPENAI_KEY = (process.env as any).OPENAI_API_KEY;
const ENV_OPENAI_URL = (process.env as any).OPENAI_API_URL;
const ENV_OPENAI_MODEL = (process.env as any).OPENAI_MODEL;

export const generateWithOpenAI = async (
  config: AIConfig,
  mode: GameMode, 
  level: number, 
  difficulty: Difficulty = Difficulty.MEDIUM
): Promise<LevelData> => {
  const diffConfig = DIFFICULTY_CONFIG[difficulty];
  const apiKey = config.openaiKey || ENV_OPENAI_KEY || "";
  const apiUrl = config.openaiUrl || ENV_OPENAI_URL || "https://api.openai.com/v1/chat/completions";
  const model = config.openaiModel || ENV_OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) throw new Error("Missing Key");

  let prompt = `生成 ${diffConfig.count} 组适合小孩的${mode}内容。JSON结构: {"pairs": [{"left": "...", "right": "..."}]}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })
  });

  const result = await response.json();
  const rawData = JSON.parse(result.choices[0].message.content);
  
  return {
    pairs: (rawData.pairs || []).slice(0, diffConfig.count).map((p: any, idx: number) => ({
      ...p,
      id: `oa-${Date.now()}-${idx}`
    }))
  };
};

export const getEncouragementWithOpenAI = async (config: AIConfig, isMatch: boolean): Promise<string> => {
  const apiKey = config.openaiKey || ENV_OPENAI_KEY || "";
  const apiUrl = config.openaiUrl || ENV_OPENAI_URL || "https://api.openai.com/v1/chat/completions";
  const model = config.openaiModel || ENV_OPENAI_MODEL || "gpt-4o-mini";
  if (!apiKey) return isMatch ? "棒棒哒！" : "加油鸭！";
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: isMatch ? "4字可爱鼓励语" : "4字安慰语" }]
      })
    });
    const result = await response.json();
    return result.choices[0].message.content.trim();
  } catch { return "加油！"; }
};
