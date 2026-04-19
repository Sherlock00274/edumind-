import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { SessionStats } from '../../types';

interface WeaknessReportScreenProps {
  sessionStats: SessionStats | null;
  handleStartStudy: (mode: any) => void;
  setAppState: (state: any) => void;
}

export const WeaknessReportScreen: React.FC<WeaknessReportScreenProps> = ({
  sessionStats,
  handleStartStudy,
  setAppState,
}) => {
  if (!sessionStats) return null;

  return (
    <div className="flex flex-col h-full px-8 animate-in zoom-in-95 duration-500">
      <div className="pt-24 pb-12 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/10"
        >
          <CheckCircle2 size={40} weight="fill" />
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-slate-800 mb-3 tracking-tight"
        >
          Session Complete
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[14px] text-slate-400 font-medium"
        >
          Efficiency report generated for current cycle
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm mb-10"
      >
        <div className="flex justify-around text-center mb-8">
          <div>
            <div className="text-4xl font-black text-slate-800 tracking-tighter">{sessionStats.total}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Concepts</div>
          </div>
          <div className="w-[1.5px] bg-slate-100 h-10 mt-2"></div>
          <div>
            <div className="text-4xl font-black text-emerald-500 tracking-tighter">{sessionStats.mastered}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Mastered</div>
          </div>
          <div className="w-[1.5px] bg-slate-100 h-10 mt-2"></div>
          <div>
            <div className="text-4xl font-black text-orange-400 tracking-tighter">{sessionStats.unsure}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Retain</div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100/50">
          <div className="flex items-center gap-2.5 mb-2.5">
            <Sparkles size={16} className="text-blue-500"/>
            <span className="text-[13px] font-black text-slate-800 tracking-tight">AI Diagnostic</span>
          </div>
          <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
            {sessionStats.total === 0 ? "Insufficient data." : 
             sessionStats.mastered / sessionStats.total === 1 ? "Exceptional focus. Your semantic understanding of this branch is now complete." : 
             sessionStats.mastered / sessionStats.total >= 0.5 ? "Solid recovery. A few edge cases remain; recommend a quick second pass in 4 hours." : 
             "Low retention detected. Suggest revisiting the core heuristics in the knowledge map."}
          </p>
        </div>
      </motion.div>

      <div className="mt-auto pb-10 space-y-4">
        {sessionStats.unsure > 0 && (
           <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleStartStudy('WEAKNESS')} 
            className="w-full py-5 rounded-[24px] bg-orange-500 text-white font-black text-[15px] shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
           >
              Rapid Retry Unsure Items
           </motion.button>
        )}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setAppState('ANALYTICS')} 
          className="w-full py-5 rounded-[24px] font-black text-[15px] active:scale-95 transition-all bg-slate-900 text-white shadow-xl shadow-slate-900/10"
        >
          Return to Dashboard
        </motion.button>
      </div>
    </div>
  );
};
