import React from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
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

  const clearedRate = sessionStats.total === 0 ? 0 : Math.round((sessionStats.mastered / sessionStats.total) * 100);

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.10),_transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-8 pt-20 pb-10">
      <div className="pb-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 220 }}
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[28px] bg-emerald-50 text-emerald-500 shadow-xl shadow-emerald-500/10"
        >
          <CheckCircle2 size={38} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 text-3xl font-black tracking-tight text-slate-900"
        >
          Priority Review Summary
        </motion.h2>
        <p className="text-[14px] font-medium text-slate-400">
          You finished the weak-point pass. Choose whether to clear the rest now or return to broader study.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 rounded-[40px] border border-slate-100 bg-white p-8 shadow-sm"
      >
        <div className="mb-8 flex justify-around text-center">
          <SummaryMetric label="Reviewed" value={String(sessionStats.total)} tone="text-slate-900" />
          <div className="mt-2 h-10 w-px bg-slate-100" />
          <SummaryMetric label="Cleared" value={String(sessionStats.mastered)} tone="text-emerald-500" />
          <div className="mt-2 h-10 w-px bg-slate-100" />
          <SummaryMetric label="Still unsure" value={String(sessionStats.unsure)} tone="text-orange-400" />
        </div>

        <div className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
          <div className="mb-2.5 flex items-center gap-2.5">
            <Sparkles size={16} className="text-blue-500" />
            <span className="text-[13px] font-black tracking-tight text-slate-800">What this means</span>
          </div>
          <p className="text-[13px] font-medium leading-relaxed text-slate-500">
            {sessionStats.total === 0
              ? 'No weak concepts were available in this pass.'
              : clearedRate === 100
                ? 'You cleared every urgent concept in this review pass. Return to normal study while the queue is clean.'
                : clearedRate >= 50
                  ? 'You stabilized a meaningful part of the queue. Run another short pass only if you want to finish the remaining weak concepts now.'
                  : 'Most of the queue is still unstable. Another weak-point pass is likely more valuable than switching back to broad study.'}
          </p>
        </div>
      </motion.div>

      <div className="mt-auto space-y-4">
        {sessionStats.unsure > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleStartStudy('WEAKNESS')}
            className="flex w-full items-center justify-center gap-3 rounded-[24px] bg-orange-500 py-5 text-[15px] font-black text-white shadow-xl shadow-orange-500/20"
          >
            <RotateCcw size={18} /> Continue Priority Review
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setAppState('HOME')}
          className="flex w-full items-center justify-center gap-3 rounded-[24px] bg-slate-900 py-5 text-[15px] font-black text-white shadow-xl shadow-slate-900/10"
        >
          Return To Normal Study <ArrowRight size={18} />
        </motion.button>
        <button
          onClick={() => setAppState('ANALYTICS')}
          className="w-full text-center text-[12px] font-black uppercase tracking-[0.18em] text-slate-400"
        >
          Review analytics again
        </button>
      </div>
    </div>
  );
};

const SummaryMetric = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) => (
  <div>
    <div className={`text-4xl font-black tracking-tighter ${tone}`}>{value}</div>
    <div className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</div>
  </div>
);
