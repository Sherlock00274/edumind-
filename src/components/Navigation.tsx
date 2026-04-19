import React from 'react';
import { Home, BarChart2, User } from 'lucide-react';
import { AppState } from '../types';
import { motion } from 'motion/react';

interface NavigationProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ appState, setAppState }) => {
  const tabs = [
    { id: 'HOME' as AppState, icon: Home },
    { id: 'ANALYTICS' as AppState, icon: BarChart2 },
    { id: 'PROFILE' as AppState, icon: User },
  ];

  return (
    <div className="absolute bottom-6 left-6 right-6 h-[64px] bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full flex items-center justify-around px-2 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = appState === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setAppState(tab.id)}
            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
              isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="nav-bg"
                className="absolute inset-0 bg-blue-50 rounded-full"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon size={20} className={`relative z-10 ${isActive ? 'fill-blue-100/50' : ''}`} />
          </button>
        );
      })}
    </div>
  );
};
