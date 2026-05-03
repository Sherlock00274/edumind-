import React from 'react';
import { TrendingDown, Flame, CheckCircle2, ChevronDown, BrainCircuit, Sparkles, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../types';

interface AnalyticsScreenProps {
  weakCards: Card[];
  resolvedToday: number;
  weakPool: string[];
  maxErrorCount: number;
  handleStartStudy: (mode: any, payload?: any) => void;
  expandedQuizId: string | null;
  toggleExpandQuiz: (id: string) => void;
  inlineAnswers: Record<string, string | null>;
  handleInlineQuizSelect: (id: string, optId: string, correct: string) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  weakCards,
  resolvedToday,
  weakPool,
  maxErrorCount,
  handleStartStudy,
  expandedQuizId,
  toggleExpandQuiz,
  inlineAnswers,
  handleInlineQuizSelect,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="px-6 pt-16"
    >
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Analytics</h1>
          <p className="text-slate-400 text-[13px] font-medium mt-1">Optimization through data</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="text-[11px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm border border-emerald-100/50"
        >
          <CheckCircle2 size={12}/> {resolvedToday} CLEARED
        </motion.div>
      </header>

      <div className="w-full p-6 bg-white border border-slate-100 rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.03)] mb-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingDown size={120} />
        </div>
        <div className="flex items-center gap-2 mb-6 text-[15px] font-black text-slate-800 relative z-10">
          <TrendingDown size={18} className="text-orange-500"/> Critical Vulnerabilities
        </div>

        {weakCards.length === 0 ? (
          <div className="py-10 text-center bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200">
            <Sparkles className="mx-auto text-blue-400 mb-3" size={24}/>
            <p className="text-sm font-bold text-slate-400">Knowledge loop successfully closed.</p>
          </div>
        ) : (
          <div className="space-y-5 relative z-10">
            {weakCards.slice(0, 3).map((card, idx) => {
              const barWidth = `${Math.max((card.errorCount / maxErrorCount) * 100, 10)}%`; 
              const isTop = idx === 0;
              return (
                <motion.div 
                  layout
                  key={card.id} 
                  className="flex flex-col gap-2 cursor-pointer group" 
                  onClick={() => handleStartStudy('SINGLE', card.id)}
                >
                  <div className="flex justify-between items-end">
                    <span className={`font-black truncate pr-4 text-[14px] transition-colors ${isTop ? 'text-orange-600' : 'text-slate-600 group-hover:text-blue-600'}`}>
                      {isTop && <Flame size={14} className="inline mr-1.5 mb-0.5 fill-orange-200"/>}{card.conceptEn}
                    </span>
                    <span className="shrink-0 font-black text-slate-300 text-[11px]">{card.errorCount} MISSES</span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: barWidth }}
                      transition={{ duration: 1.2, ease: "circOut" }}
                      className={`h-full rounded-full ${isTop ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.3)]' : 'bg-blue-400 group-hover:bg-blue-600'}`} 
                    />
                  </div>
                  {isTop && (
                    <motion.button 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => { e.stopPropagation(); }}
                      className="mt-3 py-2.5 px-4 bg-white border border-orange-100 text-orange-600 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Sparkles size={12} strokeWidth={3} /> AI Deep Diagnostic
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-5 px-1 truncate">
        <h3 className="text-[15px] font-black text-slate-800 tracking-tight">Priority Review Pool</h3>
        <span className="text-[11px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{weakPool.length} REQUIRES ATTENTION</span>
      </div>
      
      <div className="w-full pb-20">
        <div className="space-y-4">
          {weakCards.map((item) => (
            <div key={item.id} className="bg-white border border-slate-100 hover:border-blue-100 shadow-sm rounded-[28px] overflow-hidden transition-all group">
              <div className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${expandedQuizId === item.id ? 'bg-slate-50' : ''}`} onClick={() => toggleExpandQuiz(item.id)}>
                <div className="flex items-center gap-4 truncate pr-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${expandedQuizId === item.id ? 'bg-blue-600 text-white rotate-12' : 'bg-slate-50 text-slate-400'}`}>
                    <BrainCircuit size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[14px] font-black text-slate-800 block truncate leading-tight">{item.conceptEn}</span>
                    <span className="text-[10px] text-slate-400 font-bold block truncate mt-1 uppercase tracking-wider">{item.chapter.split(' > ')[1]}</span>
                  </div>
                </div>
                <ChevronDown size={18} className={`text-slate-300 transition-transform duration-500 ${expandedQuizId === item.id ? 'rotate-180' : 'group-hover:text-slate-500'}`}/>
              </div>

              <AnimatePresence>
                {expandedQuizId === item.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2">
                       <div className="p-4 bg-slate-50 rounded-[24px] mb-5 border border-slate-100">
                          <p className="text-[13px] font-bold text-slate-700 leading-relaxed">{item.inlineQuiz.question}</p>
                       </div>
                       <div className="grid grid-cols-1 gap-3">
                        {item.inlineQuiz.options.map((opt) => {
                          const selectedOpt = inlineAnswers[item.id];
                          const isCorrect = opt.id === item.inlineQuiz.correctAnswer;
                          const showResult = selectedOpt !== undefined && selectedOpt !== null;
                          const isThisSelected = selectedOpt === opt.id;
                          
                          let btnStyle = "w-full text-left px-5 py-4 rounded-[20px] text-[13px] font-bold border transition-all flex items-center justify-between ";
                          let icon = null;

                          if (!showResult) btnStyle += "bg-white border-slate-100 text-slate-600 hover:border-blue-500 active:scale-[0.98]";
                          else if (isCorrect) { btnStyle += "bg-emerald-50 border-emerald-500 text-emerald-800"; icon = <CheckCircle2 size={18} className="text-emerald-500 shrink-0"/>; }
                          else if (isThisSelected && !isCorrect) { btnStyle += "bg-rose-50 border-rose-500 text-rose-800"; icon = <XCircle size={18} className="text-rose-500 shrink-0"/>; }
                          else btnStyle += "bg-white border-slate-50 text-slate-300 opacity-40";

                          return (
                            <button key={opt.id} disabled={showResult} onClick={() => handleInlineQuizSelect(item.id, opt.id, item.inlineQuiz.correctAnswer)} className={btnStyle}>
                              <span className="pr-2">{opt.text}</span>{icon}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {weakPool.length > 0 && (
            <motion.button 
              layout
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStartStudy('WEAKNESS')} 
              className="w-full mt-6 py-4 bg-slate-900 text-white font-black text-[15px] rounded-[24px] shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
            >
              <Sparkles size={18}/> Rapid Weakness Recovery
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
