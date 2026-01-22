
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
    setGameState(prev => ({ ...prev, isBusy: true, encouragement: '正在拼命加载中...' }));
    try {
      const data = await generateLevelContent(mode, level);
      const cards: Card[] = [];
      
      data.pairs.forEach((pair) => {
        cards.push({
          id: `${pair.id}-left`,
          content: pair.left,
          matchId: pair.id,
          isFlipped: true, // In Elimination mode, cards are visible
          isMatched: false,
          type: 'left'
        });
        cards.push({
          id: `${pair.id}-right`,
          content: pair.right,
          matchId: pair.id,
          isFlipped: true, // In Elimination mode, cards are visible
          isMatched: false,
          type: 'right'
        });
      });

      // Shuffle for random layout
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      
      setGameState(prev => ({
        ...prev,
        cards: shuffled,
        isBusy: false,
        totalPairs: data.pairs.length,
        matchedCount: 0,
        encouragement: `关卡 ${level}：请找到对应的单词和图标！`,
        selectedIndices: [],
        isGameOver: false
      }));
    } catch (err) {
      setGameState(prev => ({ ...prev, isBusy: false, encouragement: '加载失败，请重试' }));
    }
  }, []);

  const handleCardClick = (index: number) => {
    if (gameState.isBusy) return;

    const { selectedIndices, cards } = gameState;

    // If already selected, deselect
    if (selectedIndices.includes(index)) {
      setGameState(prev => ({
        ...prev,
        selectedIndices: prev.selectedIndices.filter(i => i !== index)
      }));
      return;
    }

    const newIndices = [...selectedIndices, index];
    
    // Only allow 2 selections
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
    
    // Play sound logic would go here
    
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
      }, 500); // Faster feedback for elimination style
    } else {
      // Just deselect if not a match
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
        <Mascot message="Hi! 准备好开始消消乐挑战了吗？" />
        <h1 className="text-5xl font-black text-blue-500 mb-2 tracking-tighter drop-shadow-sm">
          单词消消乐
        </h1>
        <p className="text-gray-400 font-bold mb-10">配对并消除，快乐记单词</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {Object.entries(THEMES).map(([mode, theme]) => (
            <button
              key={mode}
              onClick={() => startNewGame(mode as GameMode)}
              className="bg-white rounded-[2.5rem] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all border border-gray-100 group"
            >
              <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">{theme.icon}</div>
              <h2 className={`text-2xl font-black mb-2 ${theme.accent}`}>{theme.name}</h2>
              <p className="text-gray-400 font-bold">{theme.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentTheme = THEMES[gameState.mode];

  return (
    <div className={`min-h-screen bg-[#F7F8FA] flex flex-col items-center`}>
      {/* Top Status Pills */}
      <header className="w-full max-w-2xl px-4 py-6 flex justify-between items-center gap-3">
        <div className="bg-white px-6 py-2 rounded-full shadow-sm flex items-center gap-2 border border-gray-50">
          <span className="text-gray-400 text-sm font-bold">轮次:</span>
          <span className="text-gray-700 font-black">{gameState.level}/{gameState.totalLevels}</span>
        </div>
        <div className="bg-white px-6 py-2 rounded-full shadow-sm flex items-center gap-2 border border-gray-50">
          <span className="text-gray-400 text-sm font-bold">分数:</span>
          <span className="text-gray-700 font-black">{gameState.score}</span>
        </div>
        <div className="bg-white px-6 py-2 rounded-full shadow-sm flex items-center gap-2 border border-gray-50">
          <span className="text-gray-400 text-sm font-bold">已消除:</span>
          <span className="text-emerald-500 font-black">{gameState.matchedCount}/{gameState.totalPairs}</span>
        </div>
      </header>

      {/* Instruction Banner */}
      <div className="w-full max-w-4xl px-4 mb-4 animate-pop">
        <div className="bg-white/80 backdrop-blur rounded-2xl p-3 flex items-center gap-3 shadow-sm border border-white">
          <div className="bg-yellow-100 p-2 rounded-full text-lg">💡</div>
          <p className="text-gray-500 text-sm font-bold tracking-wide">
            点击相同的配对项目来消除它们。清空屏幕即可过关！
          </p>
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl px-4 flex flex-col items-center">
        {gameState.isBusy && gameState.cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 font-bold text-gray-400">正在生成题目...</p>
          </div>
        ) : (
          <div className="w-full py-4">
            <div className="text-center mb-6">
               <Mascot message={gameState.encouragement} />
            </div>
            <GameBoard 
              cards={gameState.cards} 
              onCardClick={handleCardClick}
              accentColor={currentTheme.accent}
              selectedIndices={gameState.selectedIndices}
            />
          </div>
        )}
      </main>

      {/* Bottom Controls */}
      <footer className="w-full max-w-2xl px-4 py-8 flex justify-center gap-4">
        <button 
          onClick={() => setIsPlaying(false)}
          className="bg-[#FF7A8A] text-white px-8 py-3 rounded-full font-black shadow-md hover:brightness-105 active:scale-95 transition-all text-sm"
        >
          返回主页
        </button>
        <button 
          onClick={() => initLevel(gameState.mode, gameState.level)}
          className="bg-[#FFB84D] text-white px-8 py-3 rounded-full font-black shadow-md hover:brightness-105 active:scale-95 transition-all text-sm"
        >
          重新开始
        </button>
        <button 
          className="bg-[#5C7CFF] text-white px-8 py-3 rounded-full font-black shadow-md hover:brightness-105 active:scale-95 transition-all text-sm"
        >
          音效: 开
        </button>
      </footer>

      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-pop">
          <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl max-w-sm w-full border-[12px] border-yellow-100">
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-4xl font-black text-gray-800 mb-2">好厉害!</h2>
            <p className="text-lg text-gray-400 font-bold mb-8">你成功消除了所有单词！</p>
            <button 
              onClick={nextLevel}
              className="w-full bg-blue-500 text-white font-black text-xl py-4 rounded-[2rem] shadow-lg hover:bg-blue-600 active:scale-95 transition-all"
            >
              {gameState.level < gameState.totalLevels ? '挑战下一关' : '太棒了，完成！'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
