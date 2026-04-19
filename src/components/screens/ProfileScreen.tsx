import React, { useState } from 'react';
import { Settings, BookOpen, Clock, Calendar, History, TrendingUp, ChevronRight, Play, BookMarked, BrainCircuit, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProgress } from '../../types';

interface ProfileScreenProps {
  setAppState: (state: string) => void;
  resolvedToday: number;
  userProgress: UserProgress;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ setAppState, resolvedToday, userProgress }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HISTORY' | 'PLAN'>('OVERVIEW');

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview', icon: TrendingUp },
    { id: 'HISTORY', label: 'History', icon: History },
    { id: 'PLAN', label: 'Future', icon: Calendar },
  ] as const;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 pt-16 pb-20"
    >
      <header className="mb-10 flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence</h1>
        <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all active:rotate-90">
          <Settings size={20}/>
        </button>
      </header>

      {/* Profile Bar */}
      <div className="flex items-center gap-5 mb-10">
        <div className="w-20 h-20 rounded-[28px] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Felix Wang</h2>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">Level 4</span>
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><BookOpen size={10}/> Computer Science</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] mb-8 relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[18px] text-[13px] font-bold transition-all relative z-10 ${
                isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="profile-tab"
                  className="absolute inset-0 bg-white shadow-sm rounded-[18px]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon size={16} className="relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'OVERVIEW' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-blue-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Study Time</span>
                </div>
                <div className="text-3xl font-black text-slate-900">{formatDuration(userProgress.totalStudyTime)}</div>
              </div>
              <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BrainCircuit size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery</span>
                </div>
                <div className="text-3xl font-black text-slate-900">82%</div>
              </div>
            </div>

            {/* Retention Chart Placeholder */}
            <div className="bg-slate-900 text-white p-7 rounded-[40px] shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-lg font-black tracking-tight mb-1">Synaptic Retention</h3>
                  <p className="text-slate-400 text-[12px] font-medium mb-6">Learning curve optimizations</p>
                  
                  <div className="flex items-end gap-1.5 mb-2">
                     <span className="text-4xl font-black tracking-tighter">82%</span>
                     <span className="text-emerald-400 text-sm font-bold flex items-center gap-1 mb-1.5"><TrendingUp size={14}/> +4.2%</span>
                  </div>
               </div>
               {/* Abstract background wave */}
               <svg className="absolute bottom-0 left-0 w-full h-[80px] opacity-20" viewBox="0 0 100 40">
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2 }}
                    d="M 0 35 Q 20 10 40 30 T 80 15 T 100 25" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2" 
                  />
               </svg>
            </div>

            <div className="flex items-center justify-between px-1">
               <h3 className="text-[15px] font-black text-slate-900">Activity Distribution</h3>
               <span className="text-slate-400 text-[11px] font-bold">Past 4 weeks</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 28 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-[6px] ${
                    i % 5 === 0 ? 'bg-blue-600' : 
                    i % 3 === 0 ? 'bg-blue-400' : 
                    i % 7 === 0 ? 'bg-blue-200' : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'HISTORY' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {userProgress.sessions.sort((a,b) => b.timestamp - a.timestamp).map((session) => (
              <div key={session.id} className="bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm flex items-center justify-between group hover:border-blue-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                    <History size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[14px] leading-none mb-1.5">Study Masterclass</h4>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      {new Date(session.timestamp).toLocaleDateString()} • {formatDuration(session.duration)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[13px] font-black text-slate-900">{(session.masteryRate * 100).toFixed(0)}%</div>
                   <div className="text-[9px] font-bold text-slate-300 uppercase">Mastery</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'PLAN' && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-blue-600 text-white p-6 rounded-[32px] shadow-lg shadow-blue-600/20 mb-6">
                <div className="flex items-center gap-2 mb-4">
                   <Sparkles size={18} />
                   <span className="text-[12px] font-black uppercase tracking-[0.2em] opacity-80">AI Forecast</span>
                </div>
                <h3 className="text-lg font-black leading-tight mb-2">Optimal recall window is tomorrow between 09:00 - 11:00 AM.</h3>
                <p className="text-blue-100 text-sm font-medium opacity-80 leading-relaxed">Based on your recent mistakes in "Heuristic Search", we've prioritized 5 cards for your next session.</p>
            </div>

            <h3 className="text-[15px] font-black text-slate-900 px-1 mb-4 flex items-center gap-2">
               Scheduled Sessions <Calendar size={18} className="text-slate-300" />
            </h3>

            {userProgress.upcomingReviews.map((review, idx) => (
              <div key={idx} className="bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <BookMarked className="text-blue-500" size={20} />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-[14px] font-black text-slate-900 truncate mb-1">{review.conceptName}</p>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock size={10} /> {new Date(review.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Review
                  </p>
                </div>
                <button 
                  onClick={() => setAppState('HOME')} 
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm active:scale-90"
                >
                  <ChevronRight size={18} strokeWidth={3} />
                </button>
              </div>
            ))}

            <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-[32px] text-center mt-6">
               <p className="text-slate-400 text-sm font-medium">No other plans for today.</p>
               <button onClick={() => setAppState('MINDMAP')} className="text-blue-600 text-[12px] font-black uppercase tracking-widest mt-2 hover:underline">Explore New Concepts</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
