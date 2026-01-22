
import React, { useState, useCallback } from 'react';
import { GameMode, Card, GameState, Difficulty } from './types';
import { THEMES } from './constants';
import { generateLevelContent, getEncouragement } from './services/geminiService';
import Mascot from './components/Mascot';
import GameBoard from './components/GameBoard';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    mode: GameMode.ENGLISH_CHINESE,
    difficulty: Difficulty.MEDIUM,
    level: 1,
    totalLevels: 5,
    score: 0,
    matchedCount: 0,
    totalPairs: 0,
    cards: [],
    selectedIndices: [],
    isGameOver: false,
    isBusy: false,
    encouragement: '欢迎来到单词魔法屋！'
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [hintIndices, setHintIndices] = useState<number[]>([]);

  const initLevel = useCallback(async (mode: GameMode, level: number, difficulty: Difficulty) => {
    setGameState(prev => ({ ...prev, isBusy: true, encouragement: '魔法球正在转动...' }));
    setHintIndices([]);
    try {
      const data = await generateLevelContent(mode, level, difficulty);
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

      setGameState(prev => ({
        ...prev,
        cards: [...cards].sort(() => Math.random() - 0.5),
        isBusy: false,
        totalPairs: data.pairs.length,
        matchedCount: 0,
        encouragement: '游戏开始啦，加油！',
        selectedIndices: [],
        isGameOver: false
      }));
    } catch (err) {
      setGameState(prev => ({ ...prev, isBusy: false, encouragement: '哎呀，魔法断电了，刷新试试吧' }));
    }
  }, []);

  const handleCardClick = (index: number) => {
    if (gameState.isBusy || gameState.cards[index].isMatched) return;
    setHintIndices([]); 

    const { selectedIndices } = gameState;
    if (selectedIndices.includes(index)) return;

    const newIndices = [...selectedIndices, index];
    setGameState(prev => ({ ...prev, selectedIndices: newIndices }));

    if (newIndices.length === 2) {
      checkMatch(newIndices);
    }
  };

  const checkMatch = (indices: number[]) => {
    const [idx1, idx2] = indices;
    const card1 = gameState.cards[idx1];
    const card2 = gameState.cards[idx2];
    const isMatch = card1.matchId === card2.matchId;
    
    if (isMatch) {
      // 零延迟响应：立即标记为匹配成功
      setGameState(prev => {
        const updatedCards = [...prev.cards];
        updatedCards[idx1].isMatched = true;
        updatedCards[idx2].isMatched = true;
        const newMatchedCount = prev.matchedCount + 1;
        return {
          ...prev,
          cards: updatedCards,
          selectedIndices: [],
          score: prev.score + 10,
          matchedCount: newMatchedCount,
          isGameOver: newMatchedCount === prev.totalPairs
        };
      });
      getEncouragement(true).then(m => setGameState(p => ({ ...p, encouragement: m })));
    } else {
      setGameState(prev => ({ ...prev, isBusy: true }));
      // 错误等待时间缩减至 200ms
      setTimeout(() => {
        setGameState(prev => ({ ...prev, selectedIndices: [], isBusy: false }));
      }, 200);
    }
  };

  const startNewGame = (mode: GameMode) => {
    setIsPlaying(true);
    initLevel(mode, 1, gameState.difficulty);
  };

  if (!isPlaying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-sky-50">
        <Mascot message="Hi! 选一个模式开始魔法吧！" />
        <h1 className="text-7xl font-black text-blue-600 mb-2 art-text animate-float">单词消消乐</h1>
        <p className="text-blue-300 font-bold text-2xl mb-10 italic">Magic Word Matcher</p>
        
        {/* 难度选择器优化 */}
        <div className="flex bg-white p-2 rounded-[2.5rem] mb-12 shadow-xl border-4 border-white">
          {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setGameState(prev => ({ ...prev, difficulty: Difficulty[diff] }))}
              className={`px-10 py-4 rounded-[2rem] font-black text-xl transition-all duration-300 ${
                gameState.difficulty === Difficulty[diff] 
                ? 'bg-blue-500 text-white shadow-[0_6px_0_#1e40af] scale-105' 
                : 'text-gray-400 hover:text-blue-400'
              }`}
            >
              {diff === 'EASY' ? '🐥 萌新' : diff === 'MEDIUM' ? '🦊 高手' : '🦁 学霸'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {Object.entries(THEMES).map(([mode, theme]) => (
            <button
              key={mode}
              onClick={() => startNewGame(mode as GameMode)}
              className="bg-white rounded-[4rem] p-10 bubble-btn border-4 border-white group relative hover:rotate-2"
            >
              <div className="text-8xl mb-6 group-hover:scale-125 transition-transform duration-300">{theme.icon}</div>
              <h2 className={`text-4xl font-black mb-3 ${theme.accent}`}>{theme.name}</h2>
              <p className="text-gray-400 font-bold text-lg">{theme.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center pb-32 overflow-hidden">
      <header className="w-full max-w-5xl px-4 py-8 flex justify-between items-center z-10">
        <div className="flex gap-4">
            <div className="bg-white px-8 py-3 rounded-3xl shadow-lg border-2 border-sky-100">
                <p className="text-gray-400 font-black text-xs uppercase">Level</p>
                <p className="text-blue-500 font-black text-3xl">{gameState.level}</p>
            </div>
            <div className="bg-white px-8 py-3 rounded-3xl shadow-lg border-2 border-orange-100">
                <p className="text-gray-400 font-black text-xs uppercase">Magic</p>
                <p className="text-orange-500 font-black text-3xl">{gameState.score}</p>
            </div>
        </div>
        <div className="flex-1 max-w-sm bg-white/50 backdrop-blur rounded-full p-2 border-2 border-white shadow-inner">
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-300 to-emerald-500 transition-all duration-300" 
                  style={{ width: `${(gameState.matchedCount / (gameState.totalPairs || 1)) * 100}%` }}
                />
            </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl px-4">
        {gameState.isBusy && gameState.cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="text-9xl animate-bounce">📦</div>
            <p className="text-blue-500 font-black text-3xl art-text mt-8">正在变出新单词...</p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <Mascot message={gameState.encouragement} />
            <GameBoard 
              cards={gameState.cards} 
              onCardClick={handleCardClick}
              accentColor={THEMES[gameState.mode].accent}
              selectedIndices={gameState.selectedIndices}
              hintIndices={hintIndices}
            />
          </div>
        )}
      </main>

      <footer className="fixed bottom-8 left-0 right-0 flex justify-center gap-6 px-4 z-50">
        <button onClick={() => setIsPlaying(false)} className="bg-rose-400 text-white px-10 py-5 rounded-[2.5rem] font-black bubble-btn text-xl">🏠 首页</button>
        <button 
            onClick={() => {
                if (gameState.score < 5) return;
                const unMatched = gameState.cards.filter(c => !c.isMatched);
                if (unMatched.length > 0) {
                    const targetId = unMatched[0].matchId;
                    setHintIndices(gameState.cards.map((c, i) => c.matchId === targetId ? i : -1).filter(i => i !== -1));
                    setGameState(prev => ({ ...prev, score: prev.score - 5 }));
                    setTimeout(() => setHintIndices([]), 1500);
                }
            }}
            disabled={gameState.score < 5}
            className={`${gameState.score < 5 ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-amber-400 bubble-btn'} text-white px-10 py-5 rounded-[2.5rem] font-black text-xl`}
        >💡 提示</button>
        <button onClick={() => initLevel(gameState.mode, gameState.level, gameState.difficulty)} className="bg-indigo-500 text-white px-10 py-5 rounded-[2.5rem] font-black bubble-btn text-xl">🔄 刷新</button>
      </footer>

      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-pop">
          <div className="bg-white rounded-[5rem] p-12 text-center shadow-2xl max-w-md w-full border-[20px] border-yellow-100 relative">
            <div className="text-9xl absolute -top-24 left-1/2 -translate-x-1/2">🍭</div>
            <h2 className="text-5xl font-black text-blue-600 mb-4 art-text">太棒啦！</h2>
            <p className="text-2xl text-gray-500 font-bold mb-10">你已经掌握了这些知识！</p>
            <button 
              onClick={() => {
                const nl = gameState.level + 1;
                setGameState(p => ({ ...p, level: nl }));
                initLevel(gameState.mode, nl, gameState.difficulty);
              }}
              className="w-full bg-emerald-500 text-white font-black text-3xl py-6 rounded-[3rem] bubble-btn shadow-[0_10px_0_#059669]"
            >进入下一关</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
