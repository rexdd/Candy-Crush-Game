
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
    encouragement: '欢迎来挑战！'
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [hintIndices, setHintIndices] = useState<number[]>([]);

  const initLevel = useCallback(async (mode: GameMode, level: number, difficulty: Difficulty) => {
    setGameState(prev => ({ ...prev, isBusy: true, encouragement: '正在布置关卡...' }));
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

      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      
      setGameState(prev => ({
        ...prev,
        cards: shuffled,
        isBusy: false,
        totalPairs: data.pairs.length,
        matchedCount: 0,
        encouragement: `准备好了吗？开始！`,
        selectedIndices: [],
        isGameOver: false
      }));
    } catch (err) {
      setGameState(prev => ({ ...prev, isBusy: false, encouragement: '魔法有点累了，点刷新试试' }));
    }
  }, []);

  const handleCardClick = (index: number) => {
    if (gameState.isBusy) return;
    setHintIndices([]); 

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
      // 快速反馈
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
          score: prev.score + 10,
          matchedCount: newMatchedCount,
          isGameOver: allMatched,
          isBusy: false
        };
      });
      
      // 异步更新鼓励语，不阻塞操作
      getEncouragement(true).then(msg => {
        setGameState(prev => ({ ...prev, encouragement: msg }));
      });
    } else {
      setGameState(prev => ({ ...prev, isBusy: true }));
      // 缩短错误显示时间至300ms
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          selectedIndices: [],
          isBusy: false
        }));
      }, 300);
    }
  };

  const startNewGame = (mode: GameMode) => {
    setIsPlaying(true);
    initLevel(mode, 1, gameState.difficulty);
  };

  if (!isPlaying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f0f9ff]">
        <Mascot message="你好呀！今天想学什么？" />
        <h1 className="text-7xl font-black text-blue-500 mb-2 art-text animate-float">单词消消乐</h1>
        <p className="text-blue-300 font-bold text-2xl mb-10">趣味学习，轻松过关</p>
        
        {/* 难度选择器 */}
        <div className="flex bg-white/50 p-2 rounded-[2rem] mb-12 shadow-inner border border-white">
          {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setGameState(prev => ({ ...prev, difficulty: Difficulty[diff] }))}
              className={`px-8 py-3 rounded-[1.5rem] font-black text-lg transition-all ${
                gameState.difficulty === Difficulty[diff] 
                ? 'bg-blue-500 text-white shadow-lg scale-105' 
                : 'text-blue-400 hover:bg-white/80'
              }`}
            >
              {diff === 'EASY' ? '萌新' : diff === 'MEDIUM' ? '高手' : '学霸'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {Object.entries(THEMES).map(([mode, theme]) => (
            <button
              key={mode}
              onClick={() => startNewGame(mode as GameMode)}
              className="bg-white rounded-[3.5rem] p-8 bubble-btn border-4 border-white group relative"
            >
              <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">{theme.icon}</div>
              <h2 className={`text-3xl font-black mb-2 ${theme.accent}`}>{theme.name}</h2>
              <p className="text-gray-400 font-bold">{theme.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center pb-32`}>
      <header className="w-full max-w-5xl px-4 py-8 flex justify-between items-center">
        <div className="flex gap-4">
            <div className="bg-white px-6 py-2 rounded-3xl shadow-md border-2 border-sky-100 flex flex-col items-center">
                <span className="text-gray-400 font-black text-[10px]">等级</span>
                <span className="text-blue-500 font-black text-xl">{gameState.level}</span>
            </div>
            <div className="bg-white px-6 py-2 rounded-3xl shadow-md border-2 border-orange-100 flex flex-col items-center">
                <span className="text-gray-400 font-black text-[10px]">得分</span>
                <span className="text-orange-500 font-black text-xl">{gameState.score}</span>
            </div>
        </div>
        
        <div className="bg-white/80 px-6 py-3 rounded-full shadow-inner border border-white flex items-center gap-4 flex-1 max-w-xs">
            <div className="h-3 bg-gray-100 rounded-full flex-1 overflow-hidden">
                <div 
                    className="h-full bg-emerald-400 transition-all duration-300" 
                    style={{ width: `${(gameState.matchedCount / gameState.totalPairs) * 100}%` }}
                ></div>
            </div>
            <span className="text-emerald-500 font-black">{gameState.matchedCount}/{gameState.totalPairs}</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl px-4">
        {gameState.isBusy && gameState.cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-8xl animate-spin">🌟</div>
          </div>
        ) : (
          <div>
            <div className="mb-4"><Mascot message={gameState.encouragement} /></div>
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

      <footer className="fixed bottom-6 left-0 right-0 flex justify-center gap-4 px-4 z-40">
        <button onClick={() => setIsPlaying(false)} className="bg-[#FF7A8A] text-white px-8 py-4 rounded-[2rem] font-black bubble-btn">🏠 首页</button>
        <button 
            onClick={() => {
                const unMatched = gameState.cards.filter(c => !c.isMatched);
                if (unMatched.length > 0 && gameState.score >= 5) {
                    const mid = unMatched[0].matchId;
                    setHintIndices(gameState.cards.map((c, i) => c.matchId === mid ? i : -1).filter(i => i !== -1));
                    setGameState(prev => ({ ...prev, score: prev.score - 5 }));
                    setTimeout(() => setHintIndices([]), 2000);
                }
            }} 
            className="bg-[#FFB84D] text-white px-8 py-4 rounded-[2rem] font-black bubble-btn"
        >💡 提示</button>
        <button onClick={() => initLevel(gameState.mode, gameState.level, gameState.difficulty)} className="bg-[#5C7CFF] text-white px-8 py-4 rounded-[2rem] font-black bubble-btn">🔄 刷新</button>
      </footer>

      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[4rem] p-10 text-center shadow-2xl max-w-sm w-full border-[12px] border-yellow-100">
            <div className="text-8xl mb-6">👑</div>
            <h2 className="text-4xl font-black text-gray-800 mb-8">太棒了！</h2>
            <button 
              onClick={() => {
                const nextLvl = gameState.level + 1;
                setGameState(prev => ({ ...prev, level: nextLvl }));
                initLevel(gameState.mode, nextLvl, gameState.difficulty);
              }}
              className="w-full bg-blue-500 text-white font-black text-2xl py-5 rounded-[2.5rem] bubble-btn"
            >下一关</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
