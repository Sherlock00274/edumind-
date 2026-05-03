import React from 'react';
import { Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Quiz } from '../../types';

interface QuizScreenProps {
  currentQuiz: Quiz;
  selectedOption: string | null;
  setSelectedOption: (id: string) => void;
  handleQuizComplete: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  currentQuiz,
  selectedOption,
  setSelectedOption,
  handleQuizComplete,
}) => {
  return (
    <div className="flex flex-col h-full px-7 animate-in slide-in-from-bottom-8 duration-500 overflow-hidden">
      <div className="pt-20 pb-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"
        >
          <Sparkles size={16} strokeWidth={2.5}/> Knowledge Bridge
        </motion.div>
        <h2 className="text-[20px] font-black text-slate-800 leading-[1.3] tracking-tight">
          {currentQuiz.question}
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {currentQuiz.options.map((opt, idx) => {
          const isSelected = selectedOption === opt.id;
          const isCorrect = opt.id === currentQuiz.correctAnswer;
          const showResult = selectedOption !== null;
          
          let btnStyle = "bg-white border-slate-200 text-slate-700";
          let icon = null;

          if (showResult) {
            if (isCorrect) {
              btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm border-2 ring-4 ring-emerald-50";
              icon = <CheckCircle2 className="text-emerald-500 shrink-0" size={20} weight="fill" />;
            } else if (isSelected && !isCorrect) {
              btnStyle = "bg-rose-50 border-rose-500 text-rose-900 border-2";
              icon = <XCircle className="text-rose-500 shrink-0" size={20} />;
            } else {
              btnStyle = "bg-white border-slate-100 text-slate-300 opacity-40 shadow-none";
            }
          }

          return (
            <motion.button 
              key={opt.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              onClick={() => !showResult && setSelectedOption(opt.id)} 
              className={`w-full p-6 rounded-[28px] border-2 flex items-center justify-between text-left text-[14px] font-bold leading-relaxed transition-all duration-300 ${btnStyle} ${!showResult && 'hover:border-blue-500 hover:shadow-md active:scale-95 shadow-sm'}`}
            >
              <span className="pr-4">{opt.text}</span>
              {icon}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-auto pb-10">
        <AnimatePresence>
          {selectedOption && (
            <motion.button 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={handleQuizComplete} 
              className="w-full py-5 rounded-[24px] bg-slate-900 text-white font-black text-[16px] shadow-2xl active:scale-95 transition-all"
            >
              Continue Masterclass
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
