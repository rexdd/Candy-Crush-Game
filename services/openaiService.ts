
import { GameMode, LevelData, Difficulty, AIConfig } from "../types";

const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: { count: 6, desc: "最基础、常见的，单词长度在5个字母以内" },
  [Difficulty.MEDIUM]: { count: 12, desc: "中等难度的，包含常见短语或多音节单词" },
  [Difficulty.HARD]: { count: 18, desc: "高难度的，包含较长单词、复杂汉字或三位数数学运算" }
};

export const generateWithOpenAI = async (
  config: AIConfig,
  mode: GameMode, 
  level: number, 
  difficulty: Difficulty = Difficulty.MEDIUM
): Promise<LevelData> => {
  const diffConfig = DIFFICULTY_CONFIG[difficulty];
  const apiKey = config.openaiKey || "";
  const apiUrl = config.openaiUrl || "https://api.openai.com/v1/chat/completions";
  const model = config.openaiModel || "gpt-4o-mini";

  let prompt = "";
  if (mode === GameMode.ENGLISH_CHINESE) {
    prompt = `生成 ${diffConfig.count} 组适合小孩学习的${diffConfig.desc}中英单词。
    要求：JSON格式返回。结构为 {"pairs": [{"left": "英文", "right": "中文"}]}。等级：${level}。
    不使用 Emoji。`;
  } else if (mode === GameMode.PINYIN) {
    prompt = `生成 ${diffConfig.count} 组${diffConfig.desc}汉字和拼音。要求：JSON格式。结构为 {"pairs": [{"left": "汉字", "right": "拼音"}]}。等级：${level}。`;
  } else {
    prompt = `生成 ${diffConfig.count} 组${diffConfig.desc}数学加减法。要求：JSON格式。结构为 {"pairs": [{"left": "算式", "right": "结果"}]}。等级：${level}。`;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: "你是一个专业的儿童教育AI助手。请仅返回合法的JSON数据。" },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "OpenAI API Error");
  }

  const result = await response.json();
  const rawData = JSON.parse(result.choices[0].message.content);
  
  return {
    pairs: (rawData.pairs || []).map((p: any, idx: number) => ({
      ...p,
      id: `pair-oa-${Date.now()}-${idx}`
    }))
  };
};

export const getEncouragementWithOpenAI = async (config: AIConfig, isMatch: boolean): Promise<string> => {
  const apiKey = config.openaiKey || "";
  const apiUrl = config.openaiUrl || "https://api.openai.com/v1/chat/completions";
  const model = config.openaiModel || "gpt-4o-mini";

  const prompt = isMatch 
    ? "给一个4-6字的超级可爱的童言童语鼓励话语。"
    : "给一个4-6字的安慰小孩再试一次的可爱话语。";

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50
      })
    });
    const result = await response.json();
    return result.choices[0].message.content.trim().substring(0, 10);
  } catch {
    return isMatch ? "你真棒！" : "再试试看！";
  }
};
