
import React, { useState, useCallback } from 'react';
import { GameMode, Card, GameState } from './types';
import { THEMES } from './constants';
import { generateLevelContent, getEncouragement } from './services/geminiService';
import Mascot from './components/Mascot';
import GameBoard from './components/GameBoard';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    mode: GameMode.ENGLISH_CHINESE,
    level: 1,
    totalLevels: 3,
    score: 0,
    matchedCount: 0,
    totalPairs: 0,
    cards: [],
    selectedIndices: [],
    isGameOver: false,
    isBusy: false,
    encouragement: '欢迎来挑战！'
  });

  const [isPlaying, setIsPlaying] = useState(false);

  const initLevel = useCallback(async (mode: GameMode, level: number) => {
    setGameState(prev => ({ ...prev, isBusy: true, encouragement: '正在为你准备新的题目...' }));
    try {
      const data = await generateLevelContent(mode, level);
      const cards: Card[] = [];
      
      data.pairs.forEach((pair) => {
        cards.push({
          id: `${pair.id}-left`,
          content: pair.left,
          matchId: pair.id,
          isFlipped: true,
          isMatched: false,
          type: 'left'
        });
        cards.push({
          id: `${pair.id}-right`,
          content: pair.right,
          matchId: pair.id,
          isFlipped: true,
          isMatched: false,
          type: 'right'
        });
      });

      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      
      setGameState(prev => ({
        ...prev,
        cards: shuffled,
        isBusy: false,
        totalPairs: data.pairs.length,
        matchedCount: 0,
        encouragement: `第 ${level} 关：开始消除吧！`,
        selectedIndices: [],
        isGameOver: false
      }));
    } catch (err) {
      setGameState(prev => ({ ...prev, isBusy: false, encouragement: '网络开小差了，再试一次吧' }));
    }
  }, []);

  const handleCardClick = (index: number) => {
    if (gameState.isBusy) return;

    const { selectedIndices } = gameState;

    if (selectedIndices.includes(index)) {
      setGameState(prev => ({
        ...prev,
        selectedIndices: prev.selectedIndices.filter(i => i !== index)
      }));
      return;
    }

    const newIndices = [...selectedIndices, index];
    if (newIndices.length > 2) return;

    setGameState(prev => ({ ...prev, selectedIndices: newIndices }));

    if (newIndices.length === 2) {
      checkMatch(newIndices);
    }
  };

  const checkMatch = async (indices: number[]) => {
    const [idx1, idx2] = indices;
    const card1 = gameState.cards[idx1];
    const card2 = gameState.cards[idx2];

    const isMatch = card1.matchId === card2.matchId;
    
    if (isMatch) {
      const msg = await getEncouragement(true);
      setGameState(prev => ({ ...prev, isBusy: true, encouragement: msg }));
      
      setTimeout(() => {
        setGameState(prev => {
          const updatedCards = [...prev.cards];
          updatedCards[idx1].isMatched = true;
          updatedCards[idx2].isMatched = true;
          
          const newMatchedCount = prev.matchedCount + 1;
          const allMatched = newMatchedCount === prev.totalPairs;
          
          return {
            ...prev,
            cards: updatedCards,
            selectedIndices: [],
            isBusy: false,
            score: prev.score + 10,
            matchedCount: newMatchedCount,
            isGameOver: allMatched
          };
        });
      }, 600);
    } else {
      setGameState(prev => ({ ...prev, isBusy: true }));
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          selectedIndices: [],
          isBusy: false
        }));
      }, 500);
    }
  };

  const nextLevel = () => {
    if (gameState.level >= gameState.totalLevels) {
      setIsPlaying(false);
      return;
    }
    const nextLvl = gameState.level + 1;
    setGameState(prev => ({ ...prev, level: nextLvl }));
    initLevel(gameState.mode, nextLvl);
  };

  const startNewGame = (mode: GameMode) => {
    setGameState(prev => ({ 
      ...prev, 
      mode, 
      level: 1, 
      score: 0, 
      matchedCount: 0, 
      cards: [], 
      isGameOver: false 
    }));
    setIsPlaying(true);
    initLevel(mode, 1);
  };

  if (!isPlaying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f9fafb]">
        <Mascot message="你好呀！想玩哪种模式？" />
        <h1 className="text-6xl font-black text-blue-500 mb-4 tracking-tighter drop-shadow-sm">
          单词消消乐
        </h1>
        <p className="text-gray-400 font-bold text-xl mb-12">大字体，更好看，更聪明</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {Object.entries(THEMES).map(([mode, theme]) => (
            <button
              key={mode}
              onClick={() => startNewGame(mode as GameMode)}
              className="bg-white rounded-[3rem] p-10 shadow-[0_20px_0_#F3F4F6] hover:shadow-[0_10px_0_#F3F4F6] hover:translate-y-2 transition-all border-4 border-white group"
            >
              <div className="text-8xl mb-8 group-hover:scale-110 transition-transform">{theme.icon}</div>
              <h2 className={`text-3xl font-black mb-3 ${theme.accent}`}>{theme.name}</h2>
              <p className="text-gray-400 font-bold text-lg">{theme.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentTheme = THEMES[gameState.mode];

  return (
    <div className={`min-h-screen bg-[#F7F8FA] flex flex-col items-center pb-24`}>
      {/* Header with pill indicators */}
      <header className="w-full max-w-4xl px-4 py-8 flex justify-center items-center gap-4 flex-wrap">
        <div className="bg-white px-8 py-3 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
          <span className="text-gray-400 font-bold text-sm">轮次:</span>
          <span className="text-gray-700 font-black text-xl">{gameState.level}/{gameState.totalLevels}</span>
        </div>
        <div className="bg-white px-8 py-3 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
          <span className="text-gray-400 font-bold text-sm">分数:</span>
          <span className="text-gray-700 font-black text-xl">{gameState.score}</span>
        </div>
        <div className="bg-white px-8 py-3 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
          <span className="text-gray-400 font-bold text-sm">已消除:</span>
          <span className="text-blue-500 font-black text-xl">{gameState.matchedCount}/{gameState.totalPairs}</span>
        </div>
      </header>

      {/* Instruction Banner */}
      <div className="w-full max-w-5xl px-4 mb-6">
        <div className="bg-white/90 backdrop-blur rounded-[2rem] p-4 flex items-center gap-4 shadow-sm border border-white">
          <div className="bg-yellow-100 p-3 rounded-full text-2xl">✨</div>
          <p className="text-gray-500 font-bold tracking-tight">
            点击配对的选项进行消除。大字体更清晰，加油通关！
          </p>
        </div>
      </div>

      <main className="flex-1 w-full max-w-7xl px-4">
        {gameState.isBusy && gameState.cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 border-8 border-gray-100 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-400 font-black text-2xl">正在生成关卡...</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
               <Mascot message={gameState.encouragement} />
            </div>
            <GameBoard 
              cards={gameState.cards} 
              onCardClick={handleCardClick}
              accentColor={currentTheme.accent}
              selectedIndices={gameState.selectedIndices}
            />
          </>
        )}
      </main>

      {/* Footer Controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/40 backdrop-blur-md p-6 flex justify-center gap-4 border-t border-white/50">
        <button 
          onClick={() => setIsPlaying(false)}
          className="bg-[#FF7A8A] text-white px-10 py-4 rounded-full font-black shadow-[0_6px_0_#e66e7c] hover:translate-y-1 hover:shadow-[0_2px_0_#e66e7c] active:translate-y-1.5 active:shadow-none transition-all text-lg"
        >
          重新开始
        </button>
        <button 
          className="bg-[#FFB84D] text-white px-10 py-4 rounded-full font-black shadow-[0_6px_0_#e6a645] hover:translate-y-1 hover:shadow-[0_2px_0_#e6a645] active:translate-y-1.5 active:shadow-none transition-all text-lg"
        >
          提示 (5分)
        </button>
        <button 
          className="bg-[#5C7CFF] text-white px-10 py-4 rounded-full font-black shadow-[0_6px_0_#526fe6] hover:translate-y-1 hover:shadow-[0_2px_0_#526fe6] active:translate-y-1.5 active:shadow-none transition-all text-lg"
        >
          音效: 开
        </button>
      </footer>

      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-pop">
          <div className="bg-white rounded-[4rem] p-12 text-center shadow-2xl max-w-md w-full border-[16px] border-yellow-100">
            <div className="text-9xl mb-8 animate-bounce">🏆</div>
            <h2 className="text-5xl font-black text-gray-800 mb-4">挑战成功!</h2>
            <p className="text-2xl text-gray-400 font-bold mb-10">你的词汇量又增加了！</p>
            <button 
              onClick={gameState.level < gameState.totalLevels ? nextLevel : () => setIsPlaying(false)}
              className="w-full bg-blue-500 text-white font-black text-2xl py-6 rounded-[2.5rem] shadow-xl hover:bg-blue-600 active:scale-95 transition-all"
            >
              {gameState.level < gameState.totalLevels ? '下一关' : '太棒了，完成！'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
