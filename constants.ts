
import { GameMode } from './types';

export const THEMES = {
  [GameMode.ENGLISH_CHINESE]: {
    name: '中英模式',
    bg: 'bg-blue-100',
    card: 'bg-white text-blue-600',
    icon: '🔤',
    description: '学习英语单词与中文对应',
    accent: 'text-blue-500'
  },
  [GameMode.PINYIN]: {
    name: '汉字拼音',
    bg: 'bg-orange-100',
    card: 'bg-white text-orange-600',
    icon: '🏮',
    description: '认汉字、记拼音',
    accent: 'text-orange-500'
  },
  [GameMode.MATH]: {
    name: '数学乐园',
    bg: 'bg-purple-100',
    card: 'bg-white text-purple-600',
    icon: '🔢',
    description: '有趣的加减法挑战',
    accent: 'text-purple-500'
  }
};

export const MASCOTS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸'
];
