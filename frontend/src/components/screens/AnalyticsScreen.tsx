import React, { useMemo } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Flame,
  Layers3,
  Sparkles,
  Target,
  TrendingDown,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../../types';

interface AnalyticsScreenProps {
  weakCards: Card[];
  resolvedToday: number;
  weakPool: string[];
  reviewedConceptCount: number;
  unseenConceptCount: number;
  behaviorHint: string;
  handleStartStudy: (mode: any, payload?: any) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  weakCards,
  resolvedToday,
  weakPool,
  reviewedConceptCount,
  unseenConceptCount,
  behaviorHint,
  handleStartStudy,
}) => {
  const headline = useMemo(() => {
    if (weakCards.length === 0) {
      return {
        title: 'No urgent review blockers',
        subtitle: reviewedConceptCount > 0
          ? 'None of your reviewed concepts currently need urgent follow-up. Keep momentum with normal study.'
          : 'You have not reviewed any concepts yet. Start normal study first before expecting a priority queue.',
      };
    }

    if (weakCards.length <= 3) {
      return {
        title: 'A short recovery pass will stabilize this',
        subtitle: 'You only have a few weak concepts left. Clear them now before they compound.',
      };
    }

    return {
      title: 'Your next best action is a priority review',
      subtitle: 'Do a focused weak-point pass first, then return to broader study when the fragile concepts are stable again.',
    };
  }, [weakCards.length]);

  const topCard = weakCards[0] ?? null;
  const averageMastery = weakCards.length
    ? Math.round((weakCards.reduce((sum, card) => sum + card.mastery, 0) / weakCards.length) * 100)
    : 100;
  const chapterSpread = new Set(weakCards.map(card => card.chapter)).size;

  const nextActionLabel = weakCards.length === 0
    ? 'Return to normal study'
    : `Start Priority Review (${weakCards.length})`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="px-6 pt-16 pb-24"
    >
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Analytics</h1>
          <p className="mt-1 text-[13px] font-medium text-slate-400">Decide what to do next, not just what went wrong.</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-600">
          {resolvedToday} cleared today
        </div>
      </header>

      <div className="relative mb-8 overflow-hidden rounded-[36px] border border-slate-100 bg-slate-900 p-6 text-white shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-8 -translate-y-8 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-8 translate-y-8 rounded-full bg-orange-400/20 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">
            <TrendingDown size={12} /> Next best move
          </div>
          <h2 className="max-w-[240px] text-[28px] font-black leading-[1.05] tracking-tight">{headline.title}</h2>
          <p className="mt-3 max-w-[290px] text-[13px] font-medium leading-relaxed text-slate-300">{headline.subtitle}</p>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            <Metric label="Need review" value={String(weakPool.length)} icon={<Flame size={14} />} />
            <Metric label="Avg mastery" value={`${averageMastery}%`} icon={<Target size={14} />} />
            <Metric label="Reviewed" value={String(reviewedConceptCount)} icon={<Layers3 size={14} />} />
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3">
        <div className="rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Reviewed concepts</div>
          <div className="mt-2 text-[30px] font-black tracking-tight text-slate-900">{reviewedConceptCount}</div>
          <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">These are concepts you have already touched in study or quiz flows.</p>
        </div>
        <div className="rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Unseen concepts</div>
          <div className="mt-2 text-[30px] font-black tracking-tight text-slate-900">{unseenConceptCount}</div>
          <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">Unseen concepts are excluded from Priority Review until you actually study them.</p>
        </div>
      </div>

      <div className="mb-8 rounded-[32px] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.16em] text-slate-400">
          <Sparkles size={14} className="text-blue-500" /> Recommended flow
        </div>
        <div className="space-y-3">
          <FlowStep index="1" title="Review studied weak points" description="Start a focused pass only on concepts you have already touched and not yet stabilized." />
          <FlowStep index="2" title="Answer one check question per concept" description="Each item gets a single decision: stable enough to clear, or still unsure and needs another pass." />
          <FlowStep index="3" title="Read the summary and choose the next move" description="After the pass, either return to normal study or immediately retry the remaining weak concepts." />
        </div>
      </div>

      {topCard && (
        <div className="mb-8 rounded-[32px] border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">
            <BrainCircuit size={14} /> First concept in queue
          </div>
          <h3 className="text-[20px] font-black leading-tight text-slate-900">{topCard.conceptEn}</h3>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {topCard.chapter.split(' > ')[1] || topCard.chapter}
          </p>
          <p className="mt-3 text-[13px] font-medium leading-relaxed text-slate-600">
            {topCard.errorCount >= 3
              ? 'This one is already recurring. Clear it first so the rest of the study session does not keep collapsing around the same rule.'
              : 'This is the cleanest place to restart. A fast review here reduces the chance that the weak pool grows later today.'}
          </p>
        </div>
      )}

      <div className="mb-5 flex items-center justify-between px-1">
        <h3 className="text-[15px] font-black tracking-tight text-slate-900">Studied concepts that need attention</h3>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          {weakCards.length} in priority review
        </span>
      </div>

      <div className="space-y-3">
        {weakCards.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 text-emerald-500" size={26} />
            <p className="text-sm font-bold text-slate-500">Nothing urgent is waiting in the review queue.</p>
          </div>
        ) : (
          weakCards.slice(0, 6).map((card, index) => (
            <div key={card.id} className="rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${index === 0 ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                  <BrainCircuit size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="truncate pr-3 text-[15px] font-black text-slate-900">{card.conceptEn}</h4>
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
                      {card.errorCount} misses
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {card.chapter.split(' > ')[1] || card.chapter}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[12px] font-medium text-slate-500">
                    <Clock3 size={13} className="text-slate-300" />
                    {card.mastery < 0.45
                      ? 'Low stability. Needs an immediate check.'
                      : 'Partially known. Confirm the rule with one question.'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 rounded-[28px] border border-blue-100 bg-blue-50/70 p-5">
        <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-500">Study guidance</div>
        <p className="text-[13px] font-medium leading-relaxed text-slate-600">
          {behaviorHint || 'Clear the weak pool first, then go back to broader study only after the fragile concepts stop failing quick checks.'}
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => weakCards.length === 0 ? handleStartStudy('NORMAL') : handleStartStudy('WEAKNESS')}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-[26px] bg-slate-900 py-4 text-[15px] font-black text-white shadow-xl shadow-slate-900/20"
      >
        {nextActionLabel} <ArrowRight size={18} />
      </motion.button>
    </motion.div>
  );
};

const Metric = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="rounded-[22px] bg-white/8 px-3 py-3 backdrop-blur-sm">
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">
      {icon}
      {label}
    </div>
    <div className="mt-2 text-[24px] font-black leading-none text-white">{value}</div>
  </div>
);

const FlowStep = ({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3 rounded-[22px] bg-slate-50 px-4 py-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-black text-blue-600 shadow-sm">
      {index}
    </div>
    <div>
      <div className="text-[13px] font-black text-slate-900">{title}</div>
      <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">{description}</p>
    </div>
  </div>
);
