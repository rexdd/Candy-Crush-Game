
export enum GameMode {
  ENGLISH_CHINESE = 'ENGLISH_CHINESE',
  PINYIN = 'PINYIN',
  MATH = 'MATH'
}

export interface Card {
  id: string;
  content: string;
  matchId: string;
  isFlipped: boolean;
  isMatched: boolean;
  type: 'left' | 'right';
}

export interface LevelData {
  pairs: Array<{
    left: string;
    right: string;
    id: string;
  }>;
}

export interface GameState {
  mode: GameMode;
  level: number;
  totalLevels: number;
  score: number;
  matchedCount: number;
  totalPairs: number;
  cards: Card[];
  selectedIndices: number[];
  isGameOver: boolean;
  isBusy: boolean;
  encouragement: string;
}
