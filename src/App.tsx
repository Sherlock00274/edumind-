import React, { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppState, StudyMode, Card, SessionStats, UserProgress, StudySession } from './types';
import { CARDS_DATA as INITIAL_CARDS, QUIZZES_DATA } from './data/mockData';
import { generateStudyMaterial } from './services/geminiService';
import { Navigation } from './components/Navigation';
import { HomeScreen } from './components/screens/HomeScreen';
import { ParsingScreen } from './components/screens/ParsingScreen';
import { MindMapScreen } from './components/screens/MindMapScreen';
import { StudyScreen } from './components/screens/StudyScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { QuizScreen } from './components/screens/QuizScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { WeaknessReportScreen } from './components/screens/WeaknessReportScreen';

export default function App() {
  const [appState, setAppState] = useState<AppState>('HOME');
  const [studyMode, setStudyMode] = useState<StudyMode>('NORMAL');
  const [studyQueue, setStudyQueue] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [activeCardIds, setActiveCardIds] = useState<number[]>(INITIAL_CARDS.map(c => c.id));
  const [weakPool, setWeakPool] = useState<number[]>([2, 5, 3]);
  const [resolvedToday, setResolvedToday] = useState(0);
  const [inlineAnswers, setInlineAnswers] = useState<Record<number, string | null>>({});
  const [expandedQuizId, setExpandedQuizId] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [mindmapContext, setMindmapContext] = useState<'ONBOARDING' | 'REVIEW'>('REVIEW');
  const [mapSelectedIds, setMapSelectedIds] = useState<number[]>([]);
  const [collapsedChapters, setCollapsedChapters] = useState<string[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalStudyTime: 12450, // 3.4 hours
    sessions: [
      { id: '1', timestamp: Date.now() - 86400000 * 2, duration: 1800, conceptsCount: 12, masteryRate: 0.85 },
      { id: '2', timestamp: Date.now() - 86400000, duration: 2400, conceptsCount: 15, masteryRate: 0.92 },
    ],
    upcomingReviews: [
      { conceptId: 2, conceptName: 'A* Search', scheduledTime: Date.now() + 3600000 },
      { conceptId: 5, conceptName: 'Dominance', scheduledTime: Date.now() + 7200000 },
    ]
  });

  const [parseProgress, setParseProgress] = useState(0);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  }, []);

  const handleUpload = useCallback(async (content: string) => {
    setAppState('PARSING');
    setParseProgress(0);
    
    // Start progress simulation for the beginning
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 2;
      if (progress < 90) setParseProgress(progress);
    }, 500);

    try {
      const generatedCards = await generateStudyMaterial(content);
      clearInterval(progressInterval);
      setParseProgress(100);
      
      setTimeout(() => {
        setCards(generatedCards);
        const newIds = generatedCards.map(c => c.id);
        setActiveCardIds(newIds);
        setMapSelectedIds(newIds);
        setMindmapContext('ONBOARDING');
        setAppState('MINDMAP');
        showToast('✨ AI successfully extracted ' + generatedCards.length + ' key concepts');
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setAppState('HOME');
      showToast('❌ Failed to process material. Please try again.');
    }
  }, [showToast]);

  const toggleMindmapCard = useCallback((cardId: number) => {
    if (mindmapContext === 'REVIEW') return;
    setMapSelectedIds(prev => prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]);
  }, [mindmapContext]);

  const toggleMindmapChapter = useCallback((chapterCards: Card[]) => {
    if (mindmapContext === 'REVIEW') return;
    const chapterCardIds = chapterCards.map(c => c.id);
    const allSelected = chapterCardIds.every(id => mapSelectedIds.includes(id));
    if (allSelected) setMapSelectedIds(prev => prev.filter(id => !chapterCardIds.includes(id)));
    else setMapSelectedIds(prev => Array.from(new Set([...prev, ...chapterCardIds])));
  }, [mindmapContext, mapSelectedIds]);

  const toggleChapterCollapse = useCallback((chapterName: string) => {
    setCollapsedChapters(prev => prev.includes(chapterName) ? prev.filter(c => c !== chapterName) : [...prev, chapterName]);
  }, []);

  const handleConfirmMindmap = useCallback(() => {
    if (mapSelectedIds.length === 0) {
      showToast('⚠️ Please select at least one concept');
      return;
    }
    setActiveCardIds(mapSelectedIds);
    showToast('🚀 Study loop initialized successfully');
    setAppState('HOME');
  }, [mapSelectedIds, showToast]);

  const handleStartStudy = useCallback((mode: StudyMode, payload: any = null) => {
    setStudyMode(mode);
    let queue: Card[] = [];
    if (mode === 'NORMAL') queue = cards.filter(c => activeCardIds.includes(c.id));
    else if (mode === 'WEAKNESS') queue = cards.filter(c => weakPool.includes(c.id));
    else if (mode === 'SINGLE') queue = cards.filter(c => c.id === payload);
    else if (mode === 'CHAPTER') queue = cards.filter(c => c.chapter === payload);
      
    if (queue.length === 0) {
      showToast('⚠️ No content available for this mode');
      return;
    }
    
    if (mode === 'WEAKNESS') {
      setSessionStats({ total: queue.length, mastered: 0, unsure: 0 });
    }

    setStudyQueue(queue);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedOption(null);
    setSessionStartTime(Date.now());
    setAppState('STUDYING');
  }, [activeCardIds, weakPool, showToast]);

  const handleExitStudy = useCallback(() => {
    if (studyMode === 'NORMAL') setAppState('HOME');
    else if (studyMode === 'WEAKNESS' || studyMode === 'SINGLE') setAppState('ANALYTICS');
    else setAppState('MINDMAP');
  }, [studyMode]);

  const recordSessionEnd = useCallback(() => {
    if (sessionStartTime) {
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
      setUserProgress(prev => ({
        ...prev,
        totalStudyTime: prev.totalStudyTime + duration,
        sessions: [
          ...prev.sessions,
          {
            id: Date.now().toString(),
            timestamp: Date.now(),
            duration: duration,
            conceptsCount: studyQueue.length,
            masteryRate: sessionStats ? sessionStats.mastered / studyQueue.length : 1
          }
        ]
      }));
      setSessionStartTime(null);
    }
  }, [sessionStartTime, studyQueue.length, sessionStats]);

  const handleFeedback = useCallback((isMastered: boolean) => {
    const currentCard = studyQueue[currentIndex];
    if (!currentCard) return;

    if (studyMode === 'WEAKNESS' && sessionStats) {
      setSessionStats(prev => prev ? ({
        ...prev,
        mastered: isMastered ? prev.mastered + 1 : prev.mastered,
        unsure: !isMastered ? prev.unsure + 1 : prev.unsure
      }) : null);
    }

    if (!isMastered && !weakPool.includes(currentCard.id)) setWeakPool(prev => [...prev, currentCard.id]);
    else if (isMastered && (studyMode === 'WEAKNESS' || studyMode === 'SINGLE' || studyMode === 'CHAPTER')) {
      setWeakPool(prev => prev.filter(id => id !== currentCard.id));
      setResolvedToday(prev => prev + 1);
    }
    
    setIsFlipped(false);
    
    setTimeout(() => {
      if (studyMode === 'SINGLE' && currentIndex === studyQueue.length - 1) {
        setAppState('ANALYTICS');
        showToast('✅ Targeted review complete');
        recordSessionEnd();
        return;
      }

      const isEndOfCycle = studyMode === 'NORMAL' && (currentIndex + 1) % 3 === 0;
      if (currentIndex < studyQueue.length - 1) {
        if (isEndOfCycle) setAppState('QUIZ');
        else setCurrentIndex(prev => prev+1);
      } else {
        recordSessionEnd();
        if (isEndOfCycle && studyMode === 'NORMAL') setAppState('QUIZ');
        else if (studyMode === 'WEAKNESS') setAppState('WEAKNESS_REPORT');
        else {
          if (studyMode === 'CHAPTER') setAppState('MINDMAP');
          else setAppState('ANALYTICS');
          showToast('🎉 Session milestone reached!');
        }
      }
    }, 400);
  }, [currentIndex, studyQueue, studyMode, sessionStats, weakPool, showToast, recordSessionEnd]);

  const handleQuizComplete = useCallback(() => {
    setSelectedOption(null);
    if (currentIndex < studyQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAppState('STUDYING');
    } else {
      setAppState('ANALYTICS');
      setCurrentIndex(0);
      showToast('🎉 Learning cycle completed');
    }
  }, [currentIndex, studyQueue.length, showToast]);

  const handleInlineQuizSelect = useCallback((cardId: number, optionId: string, correctAnswer: string) => {
    if (inlineAnswers[cardId]) return;
    setInlineAnswers(prev => ({ ...prev, [cardId]: optionId }));
    if (optionId === correctAnswer) {
      setTimeout(() => {
        setWeakPool(prev => prev.filter(id => id !== cardId));
        setResolvedToday(prev => prev + 1);
        showToast('✅ Solved! Removed from weakness pool');
        setExpandedQuizId(null);
      }, 1500);
    } else {
      showToast('💪 Keep trying! Incorrect answer');
    }
  }, [inlineAnswers, showToast]);

  const groupedCards = useMemo(() => {
    const groups: Record<string, Card[]> = {};
    cards.forEach(card => {
      const subChapter = card.chapter.split(' > ')[1] || 'General Theory';
      if (!groups[subChapter]) groups[subChapter] = [];
      groups[subChapter].push(card);
    });
    return groups;
  }, [cards]);

  const weakCards = useMemo(() => 
    cards.filter(c => weakPool.includes(c.id)).sort((a, b) => b.errorCount - a.errorCount),
    [weakPool, cards]
  );
  
  const maxErrorCount = Math.max(...weakCards.map(c => c.errorCount), 1);
  const currentCard = studyQueue[currentIndex];
  const qIdx = Math.floor(currentIndex / 3);
  const currentQuiz = QUIZZES_DATA[qIdx] || QUIZZES_DATA[0];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] font-sans p-4 selection:bg-blue-100 selection:text-blue-900">
      <div className="relative w-full max-w-[390px] h-[844px] bg-white rounded-[54px] shadow-[0_24px_80px_rgba(0,0,0,0.12)] ring-8 ring-slate-900/5 overflow-hidden flex flex-col">
        
        {/* Subtle dynamic background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
              opacity: [0.03, 0.05, 0.03]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px]"
          />
          <motion.div 
             animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -5, 0],
              opacity: [0.02, 0.04, 0.02]
            }}
            transition={{ duration: 25, repeat: Infinity, delay: 2 }}
            className="absolute bottom-[10%] right-[-20%] w-[600px] h-[600px] bg-indigo-500 rounded-full blur-[150px]"
          />
        </div>

        <div className="flex-1 relative z-10 overflow-y-auto hide-scrollbar pb-[110px]">
          <AnimatePresence mode="wait">
            {appState === 'HOME' && (
              <HomeScreen 
                key="home"
                handleUpload={handleUpload}
                setAppState={setAppState}
                setMindmapContext={setMindmapContext}
                handleStartStudy={handleStartStudy}
                activeCardIds={activeCardIds}
              />
            )}
            {appState === 'PARSING' && (
              <ParsingScreen key="parsing" parseProgress={parseProgress} />
            )}
            {appState === 'MINDMAP' && (
              <MindMapScreen 
                key="mindmap"
                mindmapContext={mindmapContext}
                setAppState={setAppState}
                collapsedChapters={collapsedChapters}
                toggleChapterCollapse={toggleChapterCollapse}
                mapSelectedIds={mapSelectedIds}
                toggleMindmapCard={toggleMindmapCard}
                toggleMindmapChapter={toggleMindmapChapter}
                handleConfirmMindmap={handleConfirmMindmap}
                handleStartStudy={handleStartStudy}
                weakPool={weakPool}
                groupedCards={groupedCards}
              />
            )}
            {appState === 'STUDYING' && (
              <StudyScreen 
                key="studying"
                currentCard={currentCard}
                studyQueue={studyQueue}
                currentIndex={currentIndex}
                isFlipped={isFlipped}
                setIsFlipped={setIsFlipped}
                handleExitStudy={handleExitStudy}
                handleFeedback={handleFeedback}
                studyMode={studyMode}
              />
            )}
            {appState === 'ANALYTICS' && (
              <AnalyticsScreen 
                key="analytics"
                weakCards={weakCards}
                resolvedToday={resolvedToday}
                weakPool={weakPool}
                maxErrorCount={maxErrorCount}
                handleStartStudy={handleStartStudy}
                expandedQuizId={expandedQuizId}
                toggleExpandQuiz={setExpandedQuizId}
                inlineAnswers={inlineAnswers}
                handleInlineQuizSelect={handleInlineQuizSelect}
              />
            )}
            {appState === 'QUIZ' && (
              <QuizScreen 
                key="quiz"
                currentQuiz={currentQuiz}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                handleQuizComplete={handleQuizComplete}
              />
            )}
            {appState === 'PROFILE' && (
              <ProfileScreen 
                key="profile"
                setAppState={setAppState}
                resolvedToday={resolvedToday}
                userProgress={userProgress}
              />
            )}
            {appState === 'WEAKNESS_REPORT' && (
              <WeaknessReportScreen 
                key="report"
                sessionStats={sessionStats}
                handleStartStudy={handleStartStudy}
                setAppState={setAppState}
              />
            )}
          </AnimatePresence>
        </div>

        {['HOME', 'ANALYTICS', 'PROFILE'].includes(appState) && (
          <Navigation appState={appState} setAppState={setAppState} />
        )}

        {/* Global Toast */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div 
               initial={{ opacity: 0, y: 20, x: '-50%' }}
               animate={{ opacity: 1, y: 0, x: '-50%' }}
               exit={{ opacity: 0, scale: 0.95, x: '-50%' }}
               className="fixed bottom-[110px] left-1/2 whitespace-nowrap px-6 py-3 bg-slate-800 text-white text-[13px] font-black rounded-[20px] shadow-2xl z-50 pointer-events-none flex items-center gap-3 border border-slate-700/50 backdrop-blur-md"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      {/* Hide Scrollbar Style */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
}
