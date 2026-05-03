import React, { useState } from 'react';
import { UploadCloud, BookMarked, Play, Sparkles, FileText, Check, Flame, Trophy, X, Map, SlidersHorizontal, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chapter, Course, SourceDocument } from '../../types';

interface HomeScreenProps {
  handleSyllabusUpload: (files: File[]) => void;
  setAppState: (state: string) => void;
  setMindmapContext: (ctx: string) => void;
  openKnowledgeMap: () => void;
  handleStartStudy: (mode: string) => void;
  activeCardIds: string[];
  isAiEnabled: boolean;
  isLoadingCourse: boolean;
  totalConcepts: number;
  weakCount: number;
  masteryPercent: number;
  documents: SourceDocument[];
  course: Course | null;
  chapters: Chapter[];
  dailyConceptTarget: number;
  setDailyConceptTarget: (value: number) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  handleSyllabusUpload,
  setAppState,
  setMindmapContext,
  openKnowledgeMap,
  handleStartStudy,
  activeCardIds,
  isAiEnabled,
  isLoadingCourse,
  totalConcepts,
  weakCount,
  masteryPercent,
  documents,
  course,
  chapters,
  dailyConceptTarget,
  setDailyConceptTarget,
}) => {
  const [showInput, setShowInput] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const onConfirmUpload = () => {
    if (files.length > 0) {
      handleSyllabusUpload(files);
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    setFiles(selectedFiles);
  };

  const removeFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const maxDailyTarget = Math.max(activeCardIds.length, 1);
  const boundedDailyTarget = Math.min(dailyConceptTarget, maxDailyTarget);
  const updateDailyTarget = (nextValue: number) => {
    setDailyConceptTarget(Math.min(Math.max(nextValue, 1), maxDailyTarget));
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
               <div className="text-3xl font-black tabular-nums">{activeCardIds.length}</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Active Concepts</div>
            </div>
         </div>
         <div className="bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm flex flex-col justify-between aspect-square">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
               <Trophy className="text-blue-500" size={20} />
            </div>
            <div>
               <div className="text-3xl font-black tabular-nums">{masteryPercent}%</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Mastery</div>
            </div>
         </div>
      </div>

      {!course && (
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
              <h3 className="font-black text-slate-900 text-[17px]">Create Course</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Start with syllabus
              </p>
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
                <label className="relative block cursor-pointer rounded-[24px] border border-dashed border-blue-200 bg-blue-50/40 p-5 transition-all hover:border-blue-400 hover:bg-blue-50">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.ppt,.pptx,.docx,.md,.markdown,.txt"
                    onChange={onFileChange}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm">
                      <FileText size={22} />
                    </div>
                    <div>
                      <div className="text-[14px] font-black text-slate-800">
                        Choose syllabus
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">
                        Course outline first
                      </div>
                    </div>
                  </div>
                </label>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div key={`${file.name}-${file.lastModified}`} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <FileText size={16} className="text-blue-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[12px] font-black text-slate-700">{file.name}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{Math.max(file.size / 1024, 1).toFixed(0)} KB</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(file)}
                          className="w-8 h-8 rounded-xl bg-white text-slate-300 hover:text-rose-500 flex items-center justify-center"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  disabled={files.length === 0 || !isAiEnabled}
                  onClick={onConfirmUpload}
                  className={`w-full py-5 rounded-[20px] font-black text-[15px] flex items-center justify-center gap-3 transition-all ${
                    files.length > 0 && isAiEnabled
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 active:scale-[0.98]' 
                      : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Sparkles size={18} /> {isAiEnabled ? `Analyze ${files.length || ''} File${files.length === 1 ? '' : 's'}` : 'Backend Unavailable'}
                </button>
                {!isAiEnabled && (
                  <p className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                    Backend API is missing. Add `VITE_API_BASE_URL` to `.env.local` to enable AI processing.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

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
                className="bg-white border border-slate-100 rounded-[28px] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.06)] overflow-hidden"
             >
                <div className="p-5">
                   <div className="flex items-center justify-between mb-4">
                      <div className="grid grid-cols-[44px_minmax(0,1fr)_40px] items-start gap-3 min-w-0 w-full">
                         <div className="w-11 h-11 rounded-[16px] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/20">
                            <BookMarked className="text-white" size={18} />
                         </div>
                         <div className="min-w-0">
                            <h4 className="font-black text-slate-900 text-[15px] tracking-tight leading-snug break-words">
                              {isLoadingCourse ? 'Loading Course' : course ? `${course.code ? course.code + ' ' : ''}${course.title}` : 'No Course Yet'}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                               <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">{totalConcepts} Concepts</span>
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">• {weakCount} weak</span>
                            </div>
                         </div>
                         <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm shrink-0">
                           <BookMarked size={18} />
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                      <div className="flex justify-between items-end mb-2.5">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Retained Mastery</span>
                         <span className="text-[11px] font-black text-blue-600 tabular-nums">{masteryPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${masteryPercent}%` }}
                           transition={{ duration: 1.2, delay: 0.5 }}
                           className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                         />
                      </div>
                   </div>
                </div>
             </motion.div>
           </motion.div>

           {course && (
           <motion.div 
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.15 }}
             className="relative pl-10"
           >
              <div className="absolute left-[15px] top-4 w-2.5 h-2.5 rounded-full bg-blue-100 border-[2px] border-white z-10" />
              <div className="bg-white border border-slate-100 rounded-[24px] p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 text-blue-500 flex items-center justify-center">
                    <SlidersHorizontal size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-black text-slate-800 text-[14px] leading-tight">Today&apos;s Review Size</h5>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-0.5">Study {boundedDailyTarget} of {activeCardIds.length} active concepts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateDailyTarget(boundedDailyTarget - 1)}
                    className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center active:scale-95"
                  >
                    <Minus size={15} />
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={maxDailyTarget}
                    value={boundedDailyTarget}
                    onChange={(event) => updateDailyTarget(Number(event.target.value))}
                    className="min-w-0 flex-1 accent-blue-600"
                  />
                  <button
                    onClick={() => updateDailyTarget(boundedDailyTarget + 1)}
                    className="h-10 w-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center active:scale-95"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
           </motion.div>
           )}

           {course && (
           <motion.div 
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="relative pl-10"
           >
              <div className="absolute left-[15px] top-4 w-2.5 h-2.5 rounded-full bg-blue-100 border-[2px] border-white z-10" />
              <button
                onClick={() => handleStartStudy('NORMAL')}
                className="w-full bg-blue-600 text-white rounded-[24px] p-4 shadow-xl shadow-blue-600/20 flex items-center justify-between text-left active:scale-[0.98] transition-all"
              >
                <div>
                  <h5 className="font-black text-[15px] leading-tight">Review Today&apos;s Set</h5>
                  <p className="text-[10px] text-blue-100 font-black uppercase tracking-wider mt-1">{boundedDailyTarget} concepts selected</p>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center">
                  <Play size={18} fill="currentColor" />
                </div>
              </button>
           </motion.div>
           )}

           {/* Materials management is only available after the syllabus creates a course. */}
           {course && (
           <motion.div 
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.25 }}
             className="relative pl-10 group"
           >
              <div className="absolute left-[15px] top-4 w-2.5 h-2.5 rounded-full bg-slate-200 border-[2px] border-white z-10" />
              <motion.div 
                whileTap={{ scale: 0.98 }}
                onClick={openKnowledgeMap}
                className="bg-white border border-blue-100 rounded-[24px] p-4 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all shadow-sm"
              >
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                       <Map size={17} />
                    </div>
                    <div>
                       <h5 className="font-black text-slate-800 text-[14px] leading-tight">Manage Chapters & Materials</h5>
                       <p className="text-[9px] text-blue-500 font-black uppercase tracking-wider mt-0.5">Upload files and choose review scope</p>
                    </div>
                 </div>
                 <div className="text-blue-500 text-[11px] font-black uppercase">
                    Open
                 </div>
              </motion.div>
           </motion.div>
           )}
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
                  <h5 className="text-[14px] font-black text-slate-800 tracking-tight">
                    {course ? `${course.code ? course.code + ' ' : ''}${course.title}` : documents[0]?.filename ?? 'No Course Created'}
                  </h5>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    {course ? `${chapters.length} chapters • ${documents.length} files` : 'Upload syllabus to build course'}
                  </p>
               </div>
               <div className="text-right">
                  <div className="text-[13px] font-black text-slate-900">{weakCount}</div>
                  <div className="text-[9px] font-black text-emerald-500 uppercase">Weak</div>
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
};
