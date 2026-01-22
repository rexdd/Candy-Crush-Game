
import { GameMode, LevelData, Difficulty, AIProvider, AIConfig } from "../types";
import { generateLevelContent as generateWithGemini, getEncouragement as getEncouragementWithGemini } from "./geminiService";
import { generateWithOpenAI, getEncouragementWithOpenAI } from "./openaiService";
import { getOfflineLevel, OFFLINE_ENCOURAGEMENTS } from "../data/offlineData";

const DEFAULT_CONFIG: AIConfig = {
  provider: AIProvider.GEMINI,
  isOfflineMode: false
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

  // 如果开启了离线模式，直接返回本地数据
  if (config.isOfflineMode) {
    return { pairs: getOfflineLevel(mode, difficulty) };
  }

  try {
    if (config.provider === AIProvider.OPENAI && config.openaiKey) {
      return await generateWithOpenAI(config, mode, level, difficulty);
    }
    return await generateWithGemini(mode, level, difficulty);
  } catch (error) {
    console.warn("AI 魔法失效，正在启用本地离线咒语...", error);
    // 自动回退到离线模式，确保游戏不中断
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
    if (config.provider === AIProvider.OPENAI && config.openaiKey) {
      return await getEncouragementWithOpenAI(config, isMatch);
    }
    return await getEncouragementWithGemini(isMatch);
  } catch {
    const list = isMatch ? OFFLINE_ENCOURAGEMENTS.match : OFFLINE_ENCOURAGEMENTS.fail;
    return list[Math.floor(Math.random() * list.length)];
  }
};
