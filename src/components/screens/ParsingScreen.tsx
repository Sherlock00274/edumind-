import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network } from 'lucide-react';

interface ParsingScreenProps {
  parseProgress: number;
}

export const ParsingScreen: React.FC<ParsingScreenProps> = ({ parseProgress }) => {
  return (
    <div className="flex-1 flex flex-col h-full items-center justify-center px-8 text-center bg-white/50 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-48 h-48 mb-12 flex items-center justify-center"
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#f1f5f9" strokeWidth="6" />
          <motion.circle 
            cx="50" cy="50" r="44" 
            fill="none" stroke="#3b82f6" 
            strokeWidth="6" 
            strokeDasharray="276" 
            strokeDashoffset={276 - (parseProgress / 100) * 276}
            strokeLinecap="round" 
            className="transition-all duration-500 ease-out" 
          />
        </svg>
        
        <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="mb-2 text-blue-500"
            >
              <Network size={32} />
            </motion.div>
            <span className="text-3xl font-black text-gray-900">{parseProgress}%</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Processing Map</h2>
        <p className="text-[14px] text-gray-500 leading-relaxed max-w-[260px]">
          Our AI is synthesizing concepts and mapping their latent relationships...
        </p>
      </motion.div>

      <div className="mt-12 w-full max-w-[200px] h-1 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${parseProgress}%` }}
        />
      </div>
    </div>
  );
};
