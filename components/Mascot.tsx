
import React from 'react';
import { MASCOTS } from '../constants';

interface MascotProps {
  message: string;
  emotion?: 'happy' | 'neutral' | 'sad';
}

const Mascot: React.FC<MascotProps> = ({ message, emotion = 'neutral' }) => {
  const [mascot] = React.useState(() => MASCOTS[Math.floor(Math.random() * MASCOTS.length)]);

  return (
    <div className="flex flex-col items-center mb-6 animate-pop">
      <div className="relative">
        <div className="text-7xl mb-2 animate-bounce cursor-pointer hover:scale-110 transition-transform">
          {mascot}
        </div>
        {message && (
          <div className="absolute -top-12 -right-20 bg-white border-4 border-yellow-400 rounded-2xl p-3 shadow-lg min-w-[120px]">
            <p className="text-sm font-bold text-gray-800 text-center">{message}</p>
            <div className="absolute -bottom-3 left-4 w-6 h-6 bg-white border-b-4 border-l-4 border-yellow-400 rotate-45 transform"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mascot;
