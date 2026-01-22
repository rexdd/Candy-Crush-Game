
import React from 'react';
import { Card } from '../types';

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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 p-4 w-full max-w-7xl mx-auto">
      {cards.map((card, index) => {
        const isSelected = selectedIndices.includes(index);
        const isHinted = hintIndices.includes(index);
        const colorClass = COLORS[index % COLORS.length];
        
        return (
          <div
            key={card.id}
            onClick={() => !card.isMatched && onCardClick(index)}
            className={`
              relative h-36 sm:h-40 md:h-44 cursor-pointer transition-all duration-300
              ${card.isMatched ? 'matched-hidden' : 'hover:translate-y-[-6px] active:scale-90'}
              ${isHinted ? 'hint-pulse z-10' : ''}
            `}
          >
            <div className={`
              w-full h-full rounded-[2.5rem] bg-white border-4 flex flex-col items-center justify-center p-4 text-center
              transition-all duration-300 shadow-[0_12px_0_#F1F5F9]
              ${isSelected 
                ? 'border-sky-400 bg-sky-50 shadow-none translate-y-3 ring-8 ring-sky-100' 
                : isHinted 
                  ? 'border-yellow-400 ring-8 ring-yellow-200 shadow-none translate-y-3'
                  : 'border-white'}
            `}>
              <span className={`
                ${card.type === 'left' ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-4xl sm:text-5xl md:text-6xl'} 
                font-black break-words leading-tight art-text tracking-tight select-none
                ${isSelected ? 'text-sky-600' : colorClass}
              `}>
                {card.content}
              </span>
              
              {/* 装饰性小圆点 */}
              <div className="mt-2 flex gap-1">
                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-sky-400' : 'bg-gray-100'}`}></div>
                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-sky-400' : 'bg-gray-100'}`}></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;
