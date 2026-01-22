
import React from 'react';
import { Card } from '../types';

interface GameBoardProps {
  cards: Card[];
  onCardClick: (index: number) => void;
  accentColor: string;
  selectedIndices: number[];
}

const GameBoard: React.FC<GameBoardProps> = ({ cards, onCardClick, accentColor, selectedIndices }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 p-2 w-full max-w-5xl mx-auto">
      {cards.map((card, index) => {
        const isSelected = selectedIndices.includes(index);
        
        return (
          <div
            key={card.id}
            onClick={() => !card.isMatched && onCardClick(index)}
            className={`
              relative h-24 sm:h-28 md:h-32 cursor-pointer transition-all duration-200
              ${card.isMatched ? 'opacity-0 scale-90 pointer-events-none' : 'hover:translate-y-[-2px]'}
            `}
          >
            <div className={`
              w-full h-full rounded-[1.5rem] bg-white border-2 flex items-center justify-center p-3 text-center
              transition-all duration-200
              ${isSelected 
                ? 'border-blue-400 ring-4 ring-blue-100 shadow-md scale-105' 
                : 'border-transparent shadow-[0_4px_12px_rgba(0,0,0,0.05)]'}
            `}>
              <span className={`text-sm sm:text-base md:text-lg font-black break-words ${card.type === 'right' ? 'text-2xl' : 'text-gray-700'} leading-tight`}>
                {card.content}
              </span>
            </div>
            
            {/* Soft shadow base */}
            {!card.isMatched && !isSelected && (
              <div className="absolute inset-0 rounded-[1.5rem] border-b-4 border-gray-100 pointer-events-none -z-10 translate-y-1 opacity-50"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;
