import React from 'react';
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { CourseStructureDraft } from '../../types';

interface CourseReviewScreenProps {
  draft: CourseStructureDraft;
  setDraft: (draft: CourseStructureDraft) => void;
  onConfirm: (draft: CourseStructureDraft) => void;
  onCancel: () => void;
}

export const CourseReviewScreen: React.FC<CourseReviewScreenProps> = ({
  draft,
  setDraft,
  onConfirm,
  onCancel,
}) => {
  const updateChapter = (index: number, title: string) => {
    setDraft({
      ...draft,
      chapters: draft.chapters.map((chapter, chapterIndex) =>
        chapterIndex === index ? { ...chapter, title } : chapter,
      ),
    });
  };

  const removeChapter = (index: number) => {
    setDraft({ ...draft, chapters: draft.chapters.filter((_, chapterIndex) => chapterIndex !== index) });
  };

  const addChapter = () => {
    setDraft({
      ...draft,
      chapters: [...draft.chapters, { title: 'New Chapter', description: null, keywords: [] }],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 pt-14 pb-32"
    >
      <header className="mb-7 flex items-center gap-3">
        <button onClick={onCancel} className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Course Setup</h1>
          <p className="text-[12px] font-bold text-slate-400">Review syllabus extraction before creating workspace</p>
        </div>
      </header>

      <div className="space-y-5">
        <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Course Identity</div>
          <div className="space-y-3">
            <input
              value={draft.code ?? ''}
              onChange={(event) => setDraft({ ...draft, code: event.target.value })}
              placeholder="Course code, e.g. CSIT5900"
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[14px] font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10"
            />
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="Course title"
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[14px] font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Course Details</div>
          <div className="grid gap-3">
            <textarea
              value={draft.details.assessmentScheme ?? ''}
              onChange={(event) => setDraft({ ...draft, details: { ...draft.details, assessmentScheme: event.target.value } })}
              placeholder="Assessment scheme / marking scheme"
              className="h-20 w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10"
            />
            <textarea
              value={draft.details.examFormat ?? ''}
              onChange={(event) => setDraft({ ...draft, details: { ...draft.details, examFormat: event.target.value } })}
              placeholder="Exam format"
              className="h-20 w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Chapters</div>
            <button onClick={addChapter} className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Plus size={17} />
            </button>
          </div>
          <div className="space-y-3">
            {draft.chapters.map((chapter, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-7 text-center text-[11px] font-black text-slate-300">{index + 1}</div>
                <input
                  value={chapter.title}
                  onChange={(event) => updateChapter(index, event.target.value)}
                  className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[13px] font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10"
                />
                <button onClick={() => removeChapter(index)} className="h-10 w-10 rounded-xl bg-slate-50 text-slate-300 hover:text-rose-500 flex items-center justify-center">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onConfirm(draft)}
          disabled={!draft.title.trim() || draft.chapters.length === 0}
          className="w-full rounded-[24px] bg-slate-900 py-5 text-[15px] font-black text-white shadow-xl shadow-slate-900/15 disabled:bg-slate-100 disabled:text-slate-300 flex items-center justify-center gap-2"
        >
          <Check size={18} /> Create Course Workspace
        </button>
      </div>
    </motion.div>
  );
};
