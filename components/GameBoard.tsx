
import React from 'react';
import { Card } from '../types';

interface GameBoardProps {
  cards: Card[];
  onCardClick: (index: number) => void;
  accentColor: string;
  selectedIndices: number[];
}

const COLORS = [
  'text-blue-500', 'text-pink-500', 'text-orange-500', 
  'text-emerald-500', 'text-purple-500', 'text-indigo-500',
  'text-rose-500', 'text-amber-500', 'text-teal-500'
];

const GameBoard: React.FC<GameBoardProps> = ({ cards, onCardClick, accentColor, selectedIndices }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 p-4 w-full max-w-6xl mx-auto">
      {cards.map((card, index) => {
        const isSelected = selectedIndices.includes(index);
        const colorClass = COLORS[index % COLORS.length];
        
        return (
          <div
            key={card.id}
            onClick={() => !card.isMatched && onCardClick(index)}
            className={`
              relative h-32 sm:h-36 md:h-40 cursor-pointer transition-all duration-300
              ${card.isMatched ? 'matched-hidden' : 'hover:translate-y-[-4px] active:scale-95'}
            `}
          >
            <div className={`
              w-full h-full rounded-[2rem] bg-white border-4 flex items-center justify-center p-4 text-center
              transition-all duration-300 shadow-[0_8px_0_#E5E7EB] hover:shadow-[0_4px_0_#E5E7EB] hover:translate-y-[4px]
              ${isSelected 
                ? 'border-blue-400 bg-blue-50 ring-8 ring-blue-100/50 scale-105 shadow-none translate-y-[4px]' 
                : 'border-white'}
            `}>
              <span className={`
                ${card.type === 'left' ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-3xl sm:text-4xl md:text-5xl'} 
                font-black break-words leading-tight art-text tracking-tight
                ${isSelected ? 'text-blue-600' : colorClass}
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
