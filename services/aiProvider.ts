
import { GameMode, LevelData, Difficulty, AIProvider, AIConfig } from "../types";
import { generateLevelContent as generateWithGemini, getEncouragement as getEncouragementWithGemini } from "./geminiService";
import { generateWithOpenAI, getEncouragementWithOpenAI } from "./openaiService";
import { getOfflineLevel, OFFLINE_ENCOURAGEMENTS } from "../data/offlineData";

// 检测环境变量
const HAS_GEMINI_KEY = !!process.env.API_KEY;
const HAS_OPENAI_KEY = !!(process.env as any).OPENAI_API_KEY;

const DEFAULT_CONFIG: AIConfig = {
  // 如果环境变量有 Gemini 则默认 Gemini，否则如果有 OpenAI 则默认 OpenAI，全无则离线
  provider: HAS_GEMINI_KEY ? AIProvider.GEMINI : (HAS_OPENAI_KEY ? AIProvider.OPENAI : AIProvider.GEMINI),
  isOfflineMode: !(HAS_GEMINI_KEY || HAS_OPENAI_KEY)
};

export const getStoredConfig = (): AIConfig => {
  const stored = localStorage.getItem('ai_game_config');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
};

export const saveConfig = (config: AIConfig) => {
  localStorage.setItem('ai_game_config', JSON.stringify(config));
};

export const generateContent = async (mode: GameMode, level: number, difficulty: Difficulty): Promise<LevelData> => {
  const config = getStoredConfig();

  if (config.isOfflineMode) {
    return { pairs: getOfflineLevel(mode, difficulty) };
  }

  try {
    if (config.provider === AIProvider.OPENAI) {
      return await generateWithOpenAI(config, mode, level, difficulty);
    }
    // Gemini 情况
    if (!process.env.API_KEY && !config.isOfflineMode) {
       throw new Error("No Gemini Key configured");
    }
    return await generateWithGemini(mode, level, difficulty);
  } catch (error) {
    console.warn("AI 魔法暂时休眠中，已自动开启本地魔法库", error);
    return { pairs: getOfflineLevel(mode, difficulty) };
  }
};

export const getEncouragement = async (isMatch: boolean): Promise<string> => {
  const config = getStoredConfig();
  
  if (config.isOfflineMode) {
    const list = isMatch ? OFFLINE_ENCOURAGEMENTS.match : OFFLINE_ENCOURAGEMENTS.fail;
    return list[Math.floor(Math.random() * list.length)];
  }

  try {
    if (config.provider === AIProvider.OPENAI) {
      return await getEncouragementWithOpenAI(config, isMatch);
    }
    return await getEncouragementWithGemini(isMatch);
  } catch {
    const list = isMatch ? OFFLINE_ENCOURAGEMENTS.match : OFFLINE_ENCOURAGEMENTS.fail;
    return list[Math.floor(Math.random() * list.length)];
  }
};
