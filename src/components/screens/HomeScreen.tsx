import React, { useState } from 'react';
import { UploadCloud, BookMarked, Play, Clock, Sparkles, FileText, Check, Flame, Trophy, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeScreenProps {
  handleUpload: (content: string) => void;
  setAppState: (state: string) => void;
  setMindmapContext: (ctx: string) => void;
  handleStartStudy: (mode: string) => void;
  activeCardIds: number[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  handleUpload,
  setAppState,
  setMindmapContext,
  handleStartStudy,
  activeCardIds,
}) => {
  const [showInput, setShowInput] = useState(false);
  const [content, setContent] = useState('');

  const onConfirmUpload = () => {
    if (content.trim()) {
      handleUpload(content);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="px-6 pt-16 pb-32"
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Status: In Loop</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic">
            EduMind<span className="text-blue-600">.</span>
          </h1>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAppState('PROFILE')} 
          className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer shadow-sm active:scale-95 transition-all"
        >
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover" />
        </motion.div>
      </header>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 gap-3 mb-8">
         <div className="bg-slate-900 text-white p-5 rounded-[28px] shadow-xl shadow-slate-900/10 flex flex-col justify-between aspect-square">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
               <Flame className="text-orange-400" size={20} fill="currentColor" />
            </div>
            <div>
               <div className="text-3xl font-black tabular-nums">14</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Day Streak</div>
            </div>
         </div>
         <div className="bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm flex flex-col justify-between aspect-square">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
               <Trophy className="text-blue-500" size={20} />
            </div>
            <div>
               <div className="text-3xl font-black tabular-nums">82%</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Mastery</div>
            </div>
         </div>
      </div>

      <div className="mb-10">
        <motion.button 
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          onClick={() => setShowInput(!showInput)} 
          className="w-full relative group transition-all duration-300 text-left"
        >
          <div className={`relative w-full p-6 bg-white border ${showInput ? 'border-blue-400 ring-8 ring-blue-50' : 'border-slate-100'} rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.02)] flex items-center gap-5 transition-all`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${showInput ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-500'}`}>
              <UploadCloud size={26} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-[17px]">Feed the Brain</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Ingest new materials</p>
            </div>
          </div>
        </motion.button>

        <AnimatePresence>
          {showInput && (
            <motion.div 
              initial={{ height: 0, opacity: 0, scale: 0.95 }}
              animate={{ height: 'auto', opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.95 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-2xl space-y-5 mt-4">
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your lecture notes, article, or key points here..."
                    className="w-full h-44 bg-slate-50 border border-slate-100 rounded-[24px] p-5 text-[14px] font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                  />
                  <div className="absolute top-5 right-5 text-slate-200">
                    <FileText size={20} />
                  </div>
                </div>
                <button
                  disabled={!content.trim()}
                  onClick={onConfirmUpload}
                  className={`w-full py-5 rounded-[20px] font-black text-[15px] flex items-center justify-center gap-3 transition-all ${
                    content.trim() 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 active:scale-[0.98]' 
                      : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Sparkles size={18} /> Process with Gemini
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="text-[13px] font-black text-slate-900 tracking-[0.15em] uppercase flex items-center gap-2">
           <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
           Active Roadmap
        </h3>
        <button 
          onClick={() => setAppState('ANALYTICS')}
          className="text-[11px] font-black text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          Insights ↗
        </button>
      </div>
      
      <div className="relative mb-10">
        {/* The "Path" Line - Adjusted for mobile */}
        <div className="absolute left-[20px] top-6 bottom-0 w-[1.5px] bg-slate-100">
           <motion.div 
             initial={{ height: 0 }}
             animate={{ height: '65%' }}
             transition={{ duration: 1.5, ease: "easeOut" }}
             className="w-full bg-gradient-to-b from-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
           />
        </div>

        <div className="space-y-6 relative">
           {/* Current Node */}
           <motion.div 
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             className="relative pl-10 group"
           >
             <div className="absolute left-[13px] top-4 w-3.5 h-3.5 rounded-full bg-blue-600 border-[3px] border-white shadow-[0_0_12px_rgba(59,130,246,0.4)] z-10 transition-transform group-hover:scale-125" />
             
             <motion.div 
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStartStudy('NORMAL')}
                className="bg-white border border-slate-100 rounded-[28px] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.06)] overflow-hidden cursor-pointer active:border-blue-200"
             >
                <div className="p-5">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                         <div className="w-11 h-11 rounded-[16px] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/20">
                            <BookMarked className="text-white" size={18} />
                         </div>
                         <div className="min-w-0">
                            <h4 className="font-black text-slate-900 text-[15px] tracking-tight truncate leading-tight">Search Theory</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                               <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Chapter 2</span>
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">• 14m approx</span>
                            </div>
                         </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
                        <Play size={18} className="ml-0.5" fill="currentColor" />
                      </div>
                   </div>

                   <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                      <div className="flex justify-between items-end mb-2.5">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Retained Mastery</span>
                         <span className="text-[11px] font-black text-blue-600 tabular-nums">82%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: '82%' }}
                           transition={{ duration: 1.2, delay: 0.5 }}
                           className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                         />
                      </div>
                   </div>
                </div>
             </motion.div>
           </motion.div>

           {/* Next Node */}
           <motion.div 
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="relative pl-10 group"
           >
              <div className="absolute left-[15px] top-4 w-2.5 h-2.5 rounded-full bg-slate-200 border-[2px] border-white z-10" />
              <motion.div 
                whileTap={{ scale: 0.98 }}
                onClick={() => { setMindmapContext('REVIEW'); setAppState('MINDMAP'); }}
                className="bg-white/50 border border-slate-100 border-dashed rounded-[22px] p-4 flex items-center justify-between cursor-pointer hover:bg-white transition-all shadow-sm"
              >
                 <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-50 flex items-center justify-center text-slate-300">
                       <Sparkles size={16} />
                    </div>
                    <div>
                       <h5 className="font-bold text-slate-500 text-[14px] leading-tight">Advanced Heuristics</h5>
                       <p className="text-[8px] text-slate-300 font-black uppercase tracking-widest mt-0.5">Unlock at 90% Mastery</p>
                    </div>
                 </div>
                 <div className="text-slate-200">
                    <Clock size={14} />
                 </div>
              </motion.div>
           </motion.div>

           {/* Chapter Connector */}
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 0.3 }}
             transition={{ delay: 0.4 }}
             className="relative pl-10 pt-2"
           >
              <div className="absolute left-[15px] top-4 w-2.5 h-2.5 rounded-full bg-slate-100 border-[2px] border-white z-10" />
              <div className="flex items-center gap-2 px-1">
                 <div className="w-2 h-2 rounded-full bg-slate-200" />
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Next Chapter: Logic Engines</span>
              </div>
           </motion.div>
        </div>
      </div>

      <div className="mt-10 space-y-4">
         <h3 className="text-[15px] font-black text-slate-900 px-1 tracking-tight uppercase tracking-widest">Recent Activity</h3>
         <div className="bg-white border border-slate-100 rounded-[32px] p-2 space-y-1">
            <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-[24px] transition-all cursor-pointer">
               <div className="w-11 h-11 rounded-[14px] bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                  <Check size={20} strokeWidth={3} />
               </div>
               <div className="flex-1">
                  <h5 className="text-[14px] font-black text-slate-800 tracking-tight">Diagnostic: Search Theory</h5>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Yesterday • 42m duration</p>
               </div>
               <div className="text-right">
                  <div className="text-[13px] font-black text-slate-900">+12%</div>
                  <div className="text-[9px] font-black text-emerald-500 uppercase">Growth</div>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
};
