import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../../types';

interface PriorityReviewScreenProps {
  currentCard: Card;
  currentIndex: number;
  total: number;
  selectedOption: string | null;
  onSelectOption: (optionId: string) => void;
  onContinue: () => void;
  onExit: () => void;
}

export const PriorityReviewScreen: React.FC<PriorityReviewScreenProps> = ({
  currentCard,
  currentIndex,
  total,
  selectedOption,
  onSelectOption,
  onContinue,
  onExit,
}) => {
  const chapterLabel = currentCard.chapter.split(' > ')[1] || currentCard.chapter;
  const isAnswered = selectedOption !== null;
  const isCorrectSelection = selectedOption === currentCard.inlineQuiz.correctAnswer;
  const primaryExplanation = currentCard.descriptionZh || currentCard.description;

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.10),_transparent_38%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-6 pt-14 pb-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400 shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-right">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Priority Review</div>
          <div className="mt-1 text-[14px] font-black text-slate-900">{currentIndex + 1} of {total}</div>
          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">Answer, confirm, move on</div>
        </div>
      </div>

      <div className="mb-6 flex gap-1.5 rounded-full bg-slate-100 p-1">
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full transition-colors ${index < currentIndex ? 'bg-emerald-500' : index === currentIndex ? 'bg-blue-600' : 'bg-white'}`}
          />
        ))}
      </div>

      <div className="mb-5 rounded-[32px] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
            <BrainCircuit size={12} /> Weak concept check
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">{chapterLabel}</span>
        </div>
        <h1 className="text-[24px] font-black leading-[1.08] tracking-tight text-slate-900">{currentCard.conceptEn}</h1>
        <p className="mt-3 text-[13px] font-medium leading-relaxed text-slate-500">
          Answer one fast check. If it is stable, this concept leaves the urgent queue. If not, it stays for another pass.
        </p>
      </div>

      <div className="mb-4 rounded-[32px] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          <Sparkles size={12} /> Check question
        </div>
        <p className="text-[18px] font-black leading-[1.4] text-slate-900">{currentCard.inlineQuiz.question}</p>
      </div>

      <div className="space-y-3">
        {currentCard.inlineQuiz.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.id === currentCard.inlineQuiz.correctAnswer;

          let className = 'w-full rounded-[24px] border px-5 py-4 text-left text-[14px] font-bold transition-all ';
          let icon: React.ReactNode = null;

          if (!isAnswered) {
            className += 'border-slate-100 bg-white text-slate-700 shadow-sm hover:border-blue-500';
          } else if (isCorrect) {
            className += 'border-emerald-500 bg-emerald-50 text-emerald-900';
            icon = <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />;
          } else if (isSelected) {
            className += 'border-rose-500 bg-rose-50 text-rose-900';
            icon = <XCircle size={18} className="shrink-0 text-rose-500" />;
          } else {
            className += 'border-slate-100 bg-white text-slate-300 opacity-50';
          }

          return (
            <button
              key={option.id}
              disabled={isAnswered}
              onClick={() => onSelectOption(option.id)}
              className={className}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{option.text}</span>
                {icon}
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-5 rounded-[28px] border p-5 ${isCorrectSelection ? 'border-emerald-100 bg-emerald-50/80' : 'border-orange-100 bg-orange-50/80'}`}
        >
          <div className={`mb-2 text-[11px] font-black uppercase tracking-[0.18em] ${isCorrectSelection ? 'text-emerald-600' : 'text-orange-500'}`}>
            {isCorrectSelection ? 'Cleared for now' : 'Still needs review'}
          </div>
          <p className="text-[13px] font-medium leading-relaxed text-slate-700">{primaryExplanation}</p>
          <div className="mt-4 flex items-center gap-2 text-[12px] font-medium text-slate-500">
            <Clock3 size={14} className="text-slate-300" />
            {isCorrectSelection
              ? 'This concept is stable enough to leave the urgent queue for now.'
              : 'This concept stays in the weak queue. Revisit it after another explanation pass.'}
          </div>
        </motion.div>
      )}

      <div className="mt-auto pt-6">
        <button
          disabled={!isAnswered}
          onClick={onContinue}
          className="flex w-full items-center justify-center gap-3 rounded-[26px] bg-slate-900 py-4 text-[15px] font-black text-white shadow-xl shadow-slate-900/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {currentIndex === total - 1 ? 'Finish And See Summary' : 'Continue To Next Weak Concept'}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
