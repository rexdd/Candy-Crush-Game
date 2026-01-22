
import React, { useState, useCallback, useEffect } from 'react';
import { GameMode, Card, GameState } from './types';
import { THEMES } from './constants';
import { generateLevelContent, getEncouragement } from './services/geminiService';
import Mascot from './components/Mascot';
import GameBoard from './components/GameBoard';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    mode: GameMode.ENGLISH_CHINESE,
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

  const initLevel = useCallback(async (mode: GameMode, level: number) => {
    setGameState(prev => ({ ...prev, isBusy: true, encouragement: '正在召唤单词伙伴...' }));
    setHintIndices([]);
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
        encouragement: `关卡 ${level}：找到所有配对吧！`,
        selectedIndices: [],
        isGameOver: false
      }));
    } catch (err) {
      setGameState(prev => ({ ...prev, isBusy: false, encouragement: '哎呀，魔法断开了，再试一次？' }));
    }
  }, []);

  const handleCardClick = (index: number) => {
    if (gameState.isBusy) return;
    setHintIndices([]); // 点击时取消提示

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

  const handleHint = () => {
    if (gameState.isBusy || gameState.score < 5) {
        if (gameState.score < 5) {
            setGameState(prev => ({ ...prev, encouragement: "分数不够哦，多消几个再试！" }));
        }
        return;
    }

    // 寻找一组未消除的匹配项
    const unMatchedCards = gameState.cards.filter(c => !c.isMatched);
    if (unMatchedCards.length === 0) return;

    const firstMatchId = unMatchedCards[0].matchId;
    const indicesToHint: number[] = [];
    gameState.cards.forEach((c, idx) => {
      if (c.matchId === firstMatchId) indicesToHint.push(idx);
    });

    setHintIndices(indicesToHint);
    setGameState(prev => ({ ...prev, score: Math.max(0, prev.score - 5) }));
    
    // 3秒后自动取消提示
    setTimeout(() => setHintIndices([]), 3000);
  };

  const nextLevel = () => {
    const nextLvl = gameState.level + 1;
    if (nextLvl > gameState.totalLevels) {
      setIsPlaying(false);
      return;
    }
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-100 to-white">
        <Mascot message="Hi! 来大显身手吧！" />
        <h1 className="text-7xl font-black text-blue-500 mb-2 tracking-tighter drop-shadow-xl art-text animate-float">
          单词消消乐
        </h1>
        <p className="text-blue-300 font-bold text-2xl mb-12">Fun & Easy Learning</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {Object.entries(THEMES).map(([mode, theme]) => (
            <button
              key={mode}
              onClick={() => startNewGame(mode as GameMode)}
              className="bg-white rounded-[3.5rem] p-10 bubble-btn border-4 border-white group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-100/50 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">{theme.icon}</div>
              <h2 className={`text-4xl font-black mb-3 ${theme.accent}`}>{theme.name}</h2>
              <p className="text-gray-400 font-bold text-lg">{theme.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentTheme = THEMES[gameState.mode];

  return (
    <div className={`min-h-screen flex flex-col items-center pb-32`}>
      {/* 顶部仪表盘 */}
      <header className="w-full max-w-5xl px-4 py-8 flex justify-between items-center gap-4">
        <div className="flex gap-3">
            <div className="bg-white px-6 py-3 rounded-3xl shadow-lg border-2 border-sky-100 flex flex-col items-center min-w-[100px]">
                <span className="text-gray-400 font-bold text-xs">第几关</span>
                <span className="text-blue-500 font-black text-2xl">{gameState.level}/{gameState.totalLevels}</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-3xl shadow-lg border-2 border-orange-100 flex flex-col items-center min-w-[100px]">
                <span className="text-gray-400 font-bold text-xs">魔法分</span>
                <span className="text-orange-500 font-black text-2xl">{gameState.score}</span>
            </div>
        </div>
        
        <div className="bg-white/80 px-8 py-3 rounded-full shadow-inner border border-white flex items-center gap-4 flex-1 max-w-sm">
            <div className="h-4 bg-gray-100 rounded-full flex-1 overflow-hidden">
                <div 
                    className="h-full bg-emerald-400 transition-all duration-500" 
                    style={{ width: `${(gameState.matchedCount / gameState.totalPairs) * 100}%` }}
                ></div>
            </div>
            <span className="text-emerald-500 font-black text-lg">{gameState.matchedCount}/{gameState.totalPairs}</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl px-4">
        {gameState.isBusy && gameState.cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-9xl animate-bounce">🎨</div>
            <p className="mt-6 text-blue-400 font-black text-3xl art-text">正在变魔法...</p>
          </div>
        ) : (
          <div className="animate-pop">
            <div className="mb-4">
               <Mascot message={gameState.encouragement} />
            </div>
            <GameBoard 
              cards={gameState.cards} 
              onCardClick={handleCardClick}
              accentColor={currentTheme.accent}
              selectedIndices={gameState.selectedIndices}
              hintIndices={hintIndices}
            />
          </div>
        )}
      </main>

      {/* 底部功能栏 */}
      <footer className="fixed bottom-6 left-0 right-0 flex justify-center gap-6 px-4 z-40">
        <button 
          onClick={() => setIsPlaying(false)}
          className="bg-[#FF7A8A] text-white px-10 py-5 rounded-[2.5rem] font-black bubble-btn text-xl"
        >
          🏠 首页
        </button>
        <button 
          onClick={handleHint}
          disabled={gameState.score < 5}
          className={`${gameState.score < 5 ? 'bg-gray-300' : 'bg-[#FFB84D]'} text-white px-12 py-5 rounded-[2.5rem] font-black bubble-btn text-xl flex items-center gap-2`}
        >
          💡 提示 (5分)
        </button>
        <button 
          onClick={() => initLevel(gameState.mode, gameState.level)}
          className="bg-[#5C7CFF] text-white px-10 py-5 rounded-[2.5rem] font-black bubble-btn text-xl"
        >
          🔄 刷新
        </button>
      </footer>

      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-pop">
          <div className="bg-white rounded-[4rem] p-12 text-center shadow-2xl max-w-md w-full border-[16px] border-emerald-100 relative">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 text-9xl">🌟</div>
            <h2 className="text-5xl font-black text-emerald-500 mb-4 art-text">超级棒!</h2>
            <p className="text-2xl text-gray-500 font-bold mb-10">获得了大量经验值！</p>
            <button 
              onClick={nextLevel}
              className="w-full bg-blue-500 text-white font-black text-3xl py-6 rounded-[3rem] bubble-btn"
            >
              {gameState.level < gameState.totalLevels ? '挑战下一关' : '通关撒花!'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
