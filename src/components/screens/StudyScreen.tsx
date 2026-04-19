import React, { useState } from 'react';
import { XCircle, MapPin, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { Card, StudyMode } from '../../types';

interface StudyScreenProps {
  currentCard: Card;
  studyQueue: Card[];
  currentIndex: number;
  isFlipped: boolean;
  setIsFlipped: (f: boolean) => void;
  handleExitStudy: () => void;
  handleFeedback: (m: boolean) => void;
  studyMode: StudyMode;
}

export const StudyScreen: React.FC<StudyScreenProps> = ({
  currentCard,
  studyQueue,
  currentIndex,
  isFlipped,
  setIsFlipped,
  handleExitStudy,
  handleFeedback,
  studyMode,
}) => {
  const isSpecialMode = studyMode === 'WEAKNESS' || studyMode === 'SINGLE' || studyMode === 'CHAPTER';
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacityUnsure = useTransform(x, [50, 150], [0, 1]);
  const opacityMastered = useTransform(x, [-150, -50], [1, 0]);
  
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDragEnd = (_: any, info: any) => {
    if (isAnimating) return;
    
    if (info.offset.x > 100) {
      setIsAnimating(true);
      handleFeedback(false); // Unsure
      setTimeout(() => setIsAnimating(false), 400);
    } else if (info.offset.x < -100) {
      setIsAnimating(true);
      handleFeedback(true); // Mastered
      setTimeout(() => setIsAnimating(false), 400);
    }
  };

  return (
    <div className="flex flex-col h-full px-6 animate-in fade-in duration-500 overflow-hidden bg-slate-50/30">
      <div className="pt-14 pb-6 flex items-center justify-between">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleExitStudy} 
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white transition-all shadow-sm border border-slate-100"
        >
          <XCircle size={22} strokeWidth={2.5}/>
        </motion.button>
        <div className="flex flex-1 mx-6 gap-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          {studyQueue.map((_, idx) => (
            <motion.div 
              key={idx} 
              initial={false}
              animate={{
                backgroundColor: idx <= currentIndex 
                  ? (isSpecialMode ? '#f97316' : '#3b82f6') 
                  : '#e2e8f0',
                flex: idx === currentIndex ? 3 : 1
              }}
              className="rounded-full transition-all duration-500"
            />
          ))}
        </div>
        <div className="text-slate-400 font-black text-[13px] w-10 text-right tabular-nums tracking-tighter">
          {currentIndex + 1} / {studyQueue.length}
        </div>
      </div>

      <div className="flex-1 relative w-full mt-4 mb-10 perspective-[2000px]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentCard.id}
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full h-full relative"
          >
            <motion.div 
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              style={{ x, rotate, transformStyle: 'preserve-3d' }}
              onDragEnd={handleDragEnd}
              className="w-full h-full relative cursor-grab active:cursor-grabbing preserve-3d"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            >
              {/* Overlays for Visual Feedback during Swipe */}
              <motion.div 
                style={{ opacity: opacityUnsure }}
                className="absolute inset-x-0 top-12 flex justify-center z-50 pointer-events-none"
              >
                 <div className="bg-orange-500 text-white font-black px-6 py-2 rounded-2xl shadow-xl shadow-orange-500/30 rotate-12 text-xl border-4 border-white/20">UNSURE</div>
              </motion.div>
              <motion.div 
                style={{ opacity: opacityMastered }}
                className="absolute inset-x-0 top-12 flex justify-center z-50 pointer-events-none"
              >
                 <div className="bg-emerald-500 text-white font-black px-6 py-2 rounded-2xl shadow-xl shadow-emerald-500/30 -rotate-12 text-xl border-4 border-white/20">MASTERED</div>
              </motion.div>

              {/* Front Side */}
              <div 
                onClick={() => setIsFlipped(true)}
                className="absolute inset-0 backface-hidden rounded-[40px] bg-white border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] flex flex-col p-10 h-full" 
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex justify-between items-start mb-auto">
                    <div className="text-[10px] font-black text-blue-500 tracking-[0.2em] uppercase bg-blue-50 px-3 py-1 rounded-lg">
                        {currentCard.chapter.split(' > ')[1] || 'GENERAL'}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <RefreshCw size={14}/>
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                  <h2 className="text-[32px] md:text-[36px] font-black text-slate-900 tracking-tight leading-[1.1] mb-6 overflow-hidden text-ellipsis line-clamp-4 select-none">
                    {currentCard.conceptEn}
                  </h2>
                </div>

                <div className="mt-auto flex flex-col items-center gap-4">
                  <div className="w-full h-[1px] bg-slate-50"></div>
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-3">
                    Tap card to reveal
                  </span>
                </div>
              </div>

              {/* Back Side */}
              <div 
                onClick={() => setIsFlipped(false)}
                className="absolute inset-0 backface-hidden rotate-y-180 rounded-[40px] bg-white border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] flex flex-col p-8 overflow-hidden h-full" 
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  <div className="w-2 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                  <h3 className="text-[18px] font-black text-slate-900 truncate">
                    {currentCard.conceptZh}
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar pr-1">
                  <p className="text-[15px] text-slate-600 leading-[1.6] font-medium bg-white rounded-2xl whitespace-pre-wrap">
                    {currentCard.description}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                    <MapPin size={12} className="text-slate-300" /> 
                    {currentCard.source.split(',')[1] || currentCard.source}
                  </div>
                  <button className="text-blue-600 text-[12px] font-black flex items-center gap-1.5 hover:underline group">
                    FULL DOC <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Buttons at the bottom - only visible when flipped or as helper */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex gap-4 h-[72px] pb-8"
          >
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); handleFeedback(false); }} 
              className="flex-1 rounded-[24px] bg-white border border-slate-200 text-slate-600 font-extrabold text-[15px] transition-all shadow-sm flex items-center justify-center gap-2 hover:border-orange-200 hover:text-orange-500 hover:shadow-orange-100"
            >
              Unsure
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); handleFeedback(true); }} 
              className="flex-1 rounded-[24px] bg-slate-900 text-white font-extrabold text-[15px] transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 hover:bg-black active:bg-blue-600"
            >
              Mastered
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Swipe hints */}
      <AnimatePresence>
        {!isFlipped && (
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between px-4 pb-8 text-[10px] font-black text-slate-300 uppercase tracking-widest"
           >
              <span>← Swipe Left to Master</span>
              <span>Swipe Right to Mark Unsure →</span>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
