import React from 'react';
import { 
  ChevronLeft, Network, ChevronDown, CheckSquare, Square, 
  CheckCircle2, AlertTriangle, ChevronRight, Check, Circle, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../types';

interface MindMapScreenProps {
  mindmapContext: 'ONBOARDING' | 'REVIEW';
  setAppState: (state: any) => void;
  collapsedChapters: string[];
  toggleChapterCollapse: (name: string) => void;
  mapSelectedIds: number[];
  toggleMindmapCard: (id: number) => void;
  toggleMindmapChapter: (cards: Card[]) => void;
  handleConfirmMindmap: () => void;
  handleStartStudy: (mode: any, payload?: any) => void;
  weakPool: number[];
  groupedCards: Record<string, Card[]>;
}

export const MindMapScreen: React.FC<MindMapScreenProps> = ({
  mindmapContext,
  setAppState,
  collapsedChapters,
  toggleChapterCollapse,
  mapSelectedIds,
  toggleMindmapCard,
  toggleMindmapChapter,
  handleConfirmMindmap,
  handleStartStudy,
  weakPool,
  groupedCards,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
      <div className="px-6 pt-16 pb-6 bg-white/80 backdrop-blur-xl sticky top-0 z-20 border-bottom border-gray-100/50">
        <div className="flex items-center gap-3 mb-2">
          {mindmapContext === 'REVIEW' && (
            <button onClick={() => setAppState('HOME')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 hover:bg-gray-200 transition-colors">
              <ChevronLeft size={20} className="text-gray-600 pr-0.5"/>
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {mindmapContext === 'ONBOARDING' ? "Define Scope" : "Knowledge Map"}
          </h1>
        </div>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          {mindmapContext === 'ONBOARDING' ? "Select the concepts you want to master today." : "A holographic overview of your learning landscape."}
        </p>
      </div>

      <div className="px-6 py-6 pb-[140px]">
        <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <Network size={22} className="text-blue-500"/>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-[15px]">Lecture 3: Search</h3>
            <div className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider flex items-center gap-2">
               Root Node • {Object.values(groupedCards).flat().length} Nodes
            </div>
          </div>
        </div>

        <div className="relative pl-7 ml-3 space-y-8">
          <div className="absolute top-0 bottom-8 left-0 w-[2px] bg-slate-200/60 rounded-full"></div>
          
          {(Object.entries(groupedCards) as [string, Card[]][]).map(([chapter, cards], index) => {
            const isCollapsed = collapsedChapters.includes(chapter);
            const chapterCardIds = cards.map(c => c.id);
            const selectedCount = chapterCardIds.filter(id => mapSelectedIds.includes(id)).length;
            const isAllSelected = selectedCount === chapterCardIds.length;
            const isPartialSelected = selectedCount > 0 && !isAllSelected;
            const chapterWeakCount = chapterCardIds.filter(id => weakPool.includes(id)).length;

            return (
              <motion.div 
                key={chapter} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="absolute w-7 h-[2px] bg-slate-200/60 -left-7 top-5 rounded-full"></div>
                
                <div className="flex items-center gap-2 mb-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm group">
                  <button onClick={() => toggleChapterCollapse(chapter)} className="p-1.5 rounded-lg text-gray-400 hover:bg-slate-50 transition-colors">
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`}/>
                  </button>
                  
                  {mindmapContext === 'ONBOARDING' ? (
                    <button 
                      onClick={() => toggleMindmapChapter(cards)} 
                      className={`p-1.5 rounded-lg transition-all ${isAllSelected ? 'text-blue-500' : isPartialSelected ? 'text-blue-300' : 'text-gray-300'} hover:bg-slate-50`}
                    >
                      {isAllSelected ? <CheckSquare size={18} fill="currentColor" className="text-white"/> : isPartialSelected ? <Square size={18} fill="#bfdbfe" className="text-blue-300 opacity-40"/> : <Square size={18}/>}
                    </button>
                  ) : (
                    <button onClick={() => handleStartStudy('CHAPTER', chapter)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100">
                      <Play size={16} fill="currentColor" />
                    </button>
                  )}

                  <div className="flex-1 flex items-center justify-between min-w-0 pr-3 cursor-pointer" onClick={() => toggleChapterCollapse(chapter)}>
                    <h4 className="font-bold text-gray-800 text-[14px] truncate select-none">{chapter}</h4>
                    <div className="flex items-center gap-2">
                       {mindmapContext === 'ONBOARDING' ? (
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{selectedCount}/{cards.length}</span>
                      ) : (
                        <span className={`text-[10px] font-black uppercase tracking-widest ${chapterWeakCount === 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
                          {chapterWeakCount === 0 ? 'Clear' : `${chapterWeakCount} Alerts`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {!isCollapsed && (
                  <div className="space-y-2 pl-9">
                    {cards.map((card) => {
                      const isSelected = mapSelectedIds.includes(card.id);
                      const isWeak = weakPool.includes(card.id);

                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={card.id} 
                          className={`relative flex items-center gap-4 p-3 rounded-2xl transition-all cursor-pointer group ${
                            mindmapContext === 'ONBOARDING' 
                              ? (isSelected ? 'bg-white shadow-md border border-blue-100 ring-2 ring-blue-50' : 'bg-white/40 opacity-40 hover:opacity-100 border border-transparent') 
                              : 'bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md hover:scale-[1.02] active:scale-95'
                          }`} 
                          onClick={() => mindmapContext === 'ONBOARDING' ? toggleMindmapCard(card.id) : handleStartStudy('SINGLE', card.id)}
                        >
                          <div className="absolute w-4 h-[2px] bg-slate-200/40 -left-4 top-1/2"></div>
                          <div className="absolute top-0 -left-[18px] bottom-1/2 w-[2px] bg-slate-200/40"></div>
                          
                          <div className="shrink-0">
                            {mindmapContext === 'ONBOARDING' ? (
                              <div className={isSelected ? 'text-blue-500' : 'text-gray-300'}>
                                {isSelected ? <CheckCircle2 size={18} fill="currentColor" className="text-white"/> : <Circle size={18}/>}
                              </div>
                            ) : (
                              <div>{isWeak ? <AlertTriangle size={16} className="text-amber-500 fill-amber-50" /> : <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50" />}</div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13px] font-bold transition-all truncate ${mindmapContext === 'ONBOARDING' && !isSelected ? 'text-gray-400 line-through decoration-2' : 'text-gray-700'}`}>
                                {card.conceptEn}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5">{card.conceptZh}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {mindmapContext === 'ONBOARDING' && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 w-full max-w-[390px] p-6 bg-gradient-to-t from-white via-white/100 to-transparent z-30"
          >
            <button 
              onClick={handleConfirmMindmap} 
              className={`w-full py-4 rounded-[24px] font-black text-[15px] flex items-center justify-center gap-3 active:scale-95 transition-all duration-300 shadow-xl ${
                mapSelectedIds.length > 0 
                  ? 'bg-blue-600 text-white shadow-blue-600/30' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <Check size={20} strokeWidth={3}/> {mapSelectedIds.length > 0 ? `Initialize Session (${mapSelectedIds.length})` : 'Select Concepts'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
