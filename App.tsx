
import React, { useState, useCallback } from 'react';
import { GameMode, Card, GameState, Difficulty, AIProvider, AIConfig } from './types';
import { THEMES } from './constants';
import { generateContent, getEncouragement, getStoredConfig, saveConfig } from './services/aiProvider';
import Mascot from './components/Mascot';
import GameBoard from './components/GameBoard';

const App: React.FC = () => {
  const isGeminiPreConfigured = !!process.env.API_KEY;
  const isOpenAIPreConfigured = !!(process.env as any).OPENAI_API_KEY;

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
  const [showSettings, setShowSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(getStoredConfig());

  const initLevel = useCallback(async (mode: GameMode, level: number, difficulty: Difficulty) => {
    setGameState(prev => ({ ...prev, isBusy: true, encouragement: '魔法球正在转动...' }));
    setHintIndices([]);
    try {
      const data = await generateContent(mode, level, difficulty);
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
        mode,
        level,
        difficulty,
        cards: [...cards].sort(() => Math.random() - 0.5),
        isBusy: false,
        totalPairs: data.pairs.length,
        matchedCount: 0,
        encouragement: aiConfig.isOfflineMode ? '本地魔法已加载！' : 'AI 魔法开始啦！',
        selectedIndices: [],
        isGameOver: false
      }));
    } catch (err: any) {
      setGameState(prev => ({ 
        ...prev, 
        isBusy: false, 
        encouragement: `魔法能量不足，已切换本地魔法` 
      }));
    }
  }, [aiConfig.isOfflineMode]);

  // 魔法提示：随机找一对未消除的
  const handleHint = () => {
    if (gameState.isBusy || gameState.isGameOver) return;
    const unmatched = gameState.cards.findIndex(c => !c.isMatched);
    if (unmatched === -1) return;
    
    const targetMatchId = gameState.cards[unmatched].matchId;
    const pairIndices = gameState.cards
      .map((c, i) => c.matchId === targetMatchId ? i : -1)
      .filter(i => i !== -1);
    
    setHintIndices(pairIndices);
    setGameState(prev => ({ ...prev, encouragement: "看这里，看这里！✨" }));
    setTimeout(() => setHintIndices([]), 1500);
  };

  // 重置本关
  const handleRefresh = () => {
    initLevel(gameState.mode, gameState.level, gameState.difficulty);
  };

  const handleCardClick = async (index: number) => {
    if (gameState.isBusy || gameState.cards[index].isMatched || gameState.selectedIndices.includes(index)) return;

    const newSelected = [...gameState.selectedIndices, index];
    setGameState(prev => ({ ...prev, selectedIndices: newSelected }));

    if (newSelected.length === 2) {
      setGameState(prev => ({ ...prev, isBusy: true }));
      const [idx1, idx2] = newSelected;
      const card1 = gameState.cards[idx1];
      const card2 = gameState.cards[idx2];

      const isMatch = card1.matchId === card2.matchId;

      if (isMatch) {
        const msg = await getEncouragement(true);
        setGameState(prev => {
          const newCards = [...prev.cards];
          newCards[idx1].isMatched = true;
          newCards[idx2].isMatched = true;
          const newMatchedCount = prev.matchedCount + 1;
          const isGameOver = newMatchedCount === prev.totalPairs;
          
          return {
            ...prev,
            cards: newCards,
            matchedCount: newMatchedCount,
            score: prev.score + 10,
            encouragement: msg,
            selectedIndices: [],
            isBusy: false,
            isGameOver
          };
        });
      } else {
        const msg = await getEncouragement(false);
        setGameState(prev => ({ ...prev, encouragement: msg }));
        setTimeout(() => {
          setGameState(prev => ({ ...prev, selectedIndices: [], isBusy: false }));
        }, 800);
      }
    }
  };

  const handleStartGame = (mode: GameMode) => {
    setIsPlaying(true);
    initLevel(mode, 1, gameState.difficulty);
  };

  const handleNextLevel = () => {
    if (gameState.level < gameState.totalLevels) {
      initLevel(gameState.mode, gameState.level + 1, gameState.difficulty);
    } else {
      setIsPlaying(false);
      setGameState(prev => ({ ...prev, level: 1, isGameOver: false }));
    }
  };

  const updateConfig = (newPart: Partial<AIConfig>) => {
    const newConfig = { ...aiConfig, ...newPart };
    setAiConfig(newConfig);
    saveConfig(newConfig);
  };

  const currentTheme = THEMES[gameState.mode];

  if (!isPlaying) {
    return (
      <div className={`min-h-screen ${currentTheme.bg} flex flex-col items-center justify-center p-4 font-sans transition-colors duration-500`}>
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
           <button 
            onClick={() => setShowSettings(true)}
            className="bg-white/80 hover:bg-white text-gray-700 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-lg transition-all"
          >⚙️</button>
        </div>

        <h1 className="text-4xl sm:text-7xl font-black text-gray-800 mb-4 sm:mb-8 art-text tracking-widest text-center">
          智力魔法屋 🌟
        </h1>
        <Mascot message={aiConfig.isOfflineMode ? "离线魔法模式已开启" : "挑选一个魔法岛屿吧！"} />
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 w-full max-w-5xl">
          {Object.entries(THEMES).map(([mode, theme]) => (
            <div 
              key={mode}
              onClick={() => handleStartGame(mode as GameMode)}
              className="bg-white rounded-[2rem] sm:rounded-[3.5rem] p-6 sm:p-8 cursor-pointer transform transition-all hover:scale-105 shadow-xl border-4 sm:border-8 border-white group"
            >
              <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 text-center group-hover:animate-bounce">{theme.icon}</div>
              <h2 className={`text-xl sm:text-3xl font-black text-center mb-2 sm:mb-4 ${theme.accent}`}>{theme.name}</h2>
              <p className="text-sm sm:text-base text-gray-400 text-center font-bold">{theme.description}</p>
            </div>
          ))}
        </div>

        {showSettings && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
            <div className="bg-white rounded-[2rem] sm:rounded-[3.5rem] p-6 sm:p-10 max-w-lg w-full shadow-2xl relative border-4 sm:border-8 border-yellow-400 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-2xl">❌</button>
              <h2 className="text-2xl sm:text-4xl font-black text-center mb-6 text-gray-800">设置中心</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200">
                   <div className="flex items-center justify-between">
                      <label className="text-lg font-black text-gray-700">离线模式</label>
                      <button onClick={() => updateConfig({ isOfflineMode: !aiConfig.isOfflineMode })} className={`w-14 h-7 rounded-full relative transition-all ${aiConfig.isOfflineMode ? 'bg-green-400' : 'bg-gray-300'}`}>
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${aiConfig.isOfflineMode ? 'left-8' : 'left-1'}`}></div>
                      </button>
                   </div>
                </div>
                <div>
                  <label className="block text-lg font-bold mb-2 text-gray-700">难度设置 (卡片数)</label>
                  <div className="flex gap-2">
                    {Object.values(Difficulty).map(d => (
                      <button key={d} onClick={() => setGameState(prev => ({ ...prev, difficulty: d }))} className={`flex-1 py-3 rounded-xl font-black transition-all ${gameState.difficulty === d ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {d === Difficulty.EASY ? '9对' : d === Difficulty.MEDIUM ? '12对' : '15对'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowSettings(false)} className="w-full mt-8 bg-gray-800 text-white py-4 rounded-2xl font-black text-xl">保存设置</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} flex flex-col p-2 sm:p-8 transition-colors duration-700`}>
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        {/* 控制顶栏：增加提示和刷新按钮 */}
        <div className="w-full flex justify-between items-center mb-4 sm:mb-8 bg-white/60 p-3 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 sm:border-4 border-white shadow-lg">
          <div className="flex gap-2 sm:gap-4">
            <button onClick={() => setIsPlaying(false)} className="text-xl sm:text-3xl bg-white w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl shadow flex items-center justify-center">🏠</button>
            <button onClick={handleRefresh} className="text-xl sm:text-3xl bg-white w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl shadow flex items-center justify-center">🔄</button>
          </div>
          
          <div className="flex gap-2 sm:gap-4 items-center">
            <div className="bg-white px-3 sm:px-6 h-10 sm:h-16 rounded-xl sm:rounded-3xl shadow flex items-center gap-2">
               <span className="text-xl sm:text-2xl">⭐</span>
               <span className="text-xl sm:text-2xl font-black">{gameState.score}</span>
            </div>
            <button onClick={handleHint} className="bg-yellow-400 text-white px-3 sm:px-6 h-10 sm:h-16 rounded-xl sm:rounded-3xl shadow font-black flex items-center gap-1 sm:gap-2">
               <span className="text-xl sm:text-2xl">💡</span>
               <span className="hidden sm:inline">提示</span>
            </button>
          </div>
        </div>

        <Mascot message={gameState.encouragement} />

        <div className="w-full flex-1 min-h-0">
           <GameBoard 
            cards={gameState.cards}
            onCardClick={handleCardClick}
            accentColor={currentTheme.accent}
            selectedIndices={gameState.selectedIndices}
            hintIndices={hintIndices}
          />
        </div>

        {gameState.isGameOver && (
          <div className="fixed inset-0 bg-sky-500/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] sm:rounded-[4rem] p-8 sm:p-12 max-w-xl w-full text-center shadow-2xl border-8 border-white">
              <div className="text-6xl sm:text-[100px] mb-4 animate-bounce">🏆</div>
              <h2 className="text-3xl sm:text-6xl font-black text-gray-800 mb-2">魔法通关！</h2>
              <p className="text-lg sm:text-2xl font-bold text-gray-500 mb-8">你已经掌握了这些知识！</p>
              <button onClick={handleNextLevel} className="w-full bg-sky-500 text-white py-5 rounded-2xl font-black text-2xl shadow-lg">
                {gameState.level < gameState.totalLevels ? '下一关 ✨' : '完结撒花 🏠'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
