
import React, { useState, useCallback } from 'react';
import { GameMode, Card, GameState, Difficulty, AIProvider, AIConfig } from './types';
import { THEMES } from './constants';
import { generateContent, getEncouragement, getStoredConfig, saveConfig } from './services/aiProvider';
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
        encouragement: aiConfig.isOfflineMode ? '本地魔法已加载！' : 'AI 魔法开始啦，加油！',
        selectedIndices: [],
        isGameOver: false
      }));
    } catch (err: any) {
      setGameState(prev => ({ 
        ...prev, 
        isBusy: false, 
        encouragement: `魔法能量不足: ${err.message || '请检查设置'}` 
      }));
    }
  }, [aiConfig.isOfflineMode]);

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
        }, 1000);
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
      <div className={`min-h-screen ${currentTheme.bg} flex flex-col items-center justify-center p-6 font-sans transition-colors duration-500`}>
        <div className="absolute top-6 right-6">
           <button 
            onClick={() => setShowSettings(true)}
            className="bg-white/80 hover:bg-white text-gray-700 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all hover:rotate-90"
          >⚙️</button>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-gray-800 mb-8 art-text tracking-widest text-center">
          智力魔法屋 🌟
        </h1>
        <Mascot message={aiConfig.isOfflineMode ? "当前是离线魔法模式哦！" : "快来挑选一个魔法岛屿吧！"} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {Object.entries(THEMES).map(([mode, theme]) => (
            <div 
              key={mode}
              onClick={() => handleStartGame(mode as GameMode)}
              className="bg-white rounded-[3.5rem] p-8 cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl shadow-xl border-8 border-white group"
            >
              <div className="text-8xl mb-6 text-center group-hover:animate-bounce">{theme.icon}</div>
              <h2 className={`text-3xl font-black text-center mb-4 ${theme.accent}`}>{theme.name}</h2>
              <p className="text-gray-500 text-center font-bold">{theme.description}</p>
            </div>
          ))}
        </div>

        {showSettings && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[3.5rem] p-10 max-w-lg w-full shadow-2xl relative border-8 border-yellow-400 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-6 right-6 text-4xl hover:scale-110 transition-transform"
              >❌</button>
              <h2 className="text-4xl font-black text-center mb-8 text-gray-800">魔法设置中心</h2>
              
              <div className="space-y-8">
                {/* 离线模式切换 */}
                <div className="bg-gray-50 p-6 rounded-3xl border-4 border-dashed border-gray-200">
                   <div className="flex items-center justify-between">
                      <label className="text-2xl font-black text-gray-700">离线模式</label>
                      <button 
                        onClick={() => updateConfig({ isOfflineMode: !aiConfig.isOfflineMode })}
                        className={`w-20 h-10 rounded-full transition-all relative ${aiConfig.isOfflineMode ? 'bg-green-400' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all ${aiConfig.isOfflineMode ? 'left-11' : 'left-1'}`}></div>
                      </button>
                   </div>
                   <p className="text-sm text-gray-400 mt-2 font-bold">开启后将不再使用 AI，直接加载本地题库</p>
                </div>

                {!aiConfig.isOfflineMode && (
                  <>
                    <div>
                      <label className="block text-xl font-bold mb-4 text-gray-700">魔法核心 (AI)</label>
                      <div className="flex gap-2">
                        {[AIProvider.GEMINI, AIProvider.OPENAI].map(p => (
                          <button
                            key={p}
                            onClick={() => updateConfig({ provider: p })}
                            className={`flex-1 py-4 rounded-3xl font-black transition-all ${aiConfig.provider === p ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {aiConfig.provider === AIProvider.OPENAI && (
                      <div className="space-y-4 animate-in slide-in-from-top-4">
                        <input 
                          placeholder="输入 OpenAI API Key"
                          className="w-full p-5 rounded-3xl bg-gray-50 border-4 border-gray-200 font-bold focus:border-blue-400 outline-none transition-all"
                          value={aiConfig.openaiKey || ''}
                          onChange={(e) => updateConfig({ openaiKey: e.target.value })}
                        />
                        <input 
                          placeholder="API URL (默认: https://api.openai.com/v1/...)"
                          className="w-full p-5 rounded-3xl bg-gray-50 border-4 border-gray-200 font-bold focus:border-blue-400 outline-none transition-all"
                          value={aiConfig.openaiUrl || ''}
                          onChange={(e) => updateConfig({ openaiUrl: e.target.value })}
                        />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-xl font-bold mb-4 text-gray-700">游戏难度</label>
                  <div className="flex gap-2">
                    {Object.values(Difficulty).map(d => (
                      <button
                        key={d}
                        onClick={() => setGameState(prev => ({ ...prev, difficulty: d }))}
                        className={`flex-1 py-4 rounded-3xl font-black text-lg transition-all ${gameState.difficulty === d ? 'bg-orange-400 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
                      >
                        {d === Difficulty.EASY ? '简单' : d === Difficulty.MEDIUM ? '普通' : '困难'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full mt-10 bg-gray-800 text-white py-6 rounded-[2rem] font-black text-2xl hover:bg-black transition-all shadow-xl"
              >
                准备好啦！🚀
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} flex flex-col p-4 sm:p-8 transition-colors duration-700`}>
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-8 bg-white/60 p-6 rounded-[2.5rem] backdrop-blur-sm border-4 border-white shadow-xl">
          <div className="flex gap-4">
            <button 
              onClick={() => setIsPlaying(false)}
              className="text-4xl hover:scale-110 transition-transform bg-white w-16 h-16 rounded-3xl shadow-md flex items-center justify-center"
            >🏠</button>
            <div className="bg-white px-8 h-16 rounded-3xl shadow-md flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <span className="text-3xl font-black text-gray-800">{gameState.score}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`text-3xl font-black ${currentTheme.accent} bg-white px-8 h-16 rounded-3xl shadow-md flex items-center`}>
              关卡 {gameState.level} / {gameState.totalLevels}
            </div>
          </div>
        </div>

        <Mascot message={gameState.encouragement} />

        <GameBoard 
          cards={gameState.cards}
          onCardClick={handleCardClick}
          accentColor={currentTheme.accent}
          selectedIndices={gameState.selectedIndices}
          hintIndices={hintIndices}
        />

        {gameState.isGameOver && (
          <div className="fixed inset-0 bg-sky-500/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white rounded-[4rem] p-12 max-w-xl w-full text-center shadow-2xl border-[12px] border-white ring-8 ring-sky-400/50">
              <div className="text-[120px] mb-4 animate-bounce">🏆</div>
              <h2 className="text-6xl font-black text-gray-800 mb-4 art-text">太棒了！</h2>
              <p className="text-2xl font-bold text-gray-500 mb-10">你成功通过了魔法挑战！</p>
              
              <div className="bg-sky-50 rounded-[3rem] p-8 mb-10 border-4 border-sky-100">
                <div className="text-sm font-black text-sky-400 uppercase tracking-widest mb-2">本次得分</div>
                <div className="text-7xl font-black text-sky-600">+{gameState.score}</div>
              </div>

              <button 
                onClick={handleNextLevel}
                className="w-full bg-sky-500 text-white py-8 rounded-[2.5rem] font-black text-3xl hover:bg-sky-600 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-sky-200"
              >
                {gameState.level < gameState.totalLevels ? '前往下一关 ✨' : '回到首页 🏠'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
