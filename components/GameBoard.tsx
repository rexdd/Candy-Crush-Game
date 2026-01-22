
import { Card } from '../types';
import React from 'react';

interface GameBoardProps {
  cards: Card[];
  onCardClick: (index: number) => void;
  accentColor: string;
  selectedIndices: number[];
  hintIndices?: number[];
}

const COLORS = [
  'text-[#FF6B6B]', 'text-[#4D96FF]', 'text-[#6BCB77]', 
  'text-[#FFD93D]', 'text-[#9B72AA]', 'text-[#FF9F45]',
  'text-[#F24C4C]', 'text-[#293462]', 'text-[#A0D995]'
];

const GameBoard: React.FC<GameBoardProps> = ({ 
    cards, 
    onCardClick, 
    selectedIndices, 
    hintIndices = [] 
}) => {
  return (
    // 手机端使用 3 列，平板 4 列，电脑 6 列，缩小间距
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4 md:gap-6 p-2 sm:p-4 w-full max-w-7xl mx-auto overflow-y-auto">
      {cards.map((card, index) => {
        const isSelected = selectedIndices.includes(index);
        const isHinted = hintIndices.includes(index);
        const colorClass = COLORS[index % COLORS.length];
        
        return (
          <div
            key={card.id}
            onClick={() => !card.isMatched && onCardClick(index)}
            className={`
              relative h-24 sm:h-32 md:h-40 cursor-pointer transition-all duration-300
              ${card.isMatched ? 'matched-hidden' : 'hover:scale-105 active:scale-95'}
              ${isHinted ? 'hint-pulse z-10' : ''}
            `}
          >
            <div className={`
              w-full h-full rounded-[1.2rem] sm:rounded-[2rem] bg-white border-2 sm:border-4 flex flex-col items-center justify-center p-1 sm:p-2 text-center
              transition-all duration-300 shadow-[0_4px_0_#F1F5F9] sm:shadow-[0_10px_0_#F1F5F9]
              ${isSelected 
                ? 'border-sky-400 bg-sky-50 shadow-none translate-y-1 sm:translate-y-2 ring-2 sm:ring-8 ring-sky-100' 
                : isHinted 
                  ? 'border-yellow-400 ring-2 sm:ring-8 ring-yellow-200 shadow-none translate-y-1'
                  : 'border-white'}
            `}>
              <span className={`
                ${card.content.length > 6 ? 'text-xs sm:text-lg md:text-2xl' : 'text-sm sm:text-2xl md:text-4xl'} 
                font-black break-words leading-tight art-text tracking-tighter select-none
                ${isSelected ? 'text-sky-600' : colorClass}
              `}>
                {card.content}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;
