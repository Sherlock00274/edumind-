import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppState, StudyMode, Card, Chapter, Course, CourseStructureDraft, SessionStats, SourceDocument, UserProgress } from './types';
import {
  analyzeSyllabus,
  completeStudySession,
  createCourseFromDraft,
  createStudySession,
  getAuthToken,
  getCourseAnalytics,
  getCourseCards,
  getCourseChapters,
  getCourseDocuments,
  getUserProgress,
  isBackendApiConfigured,
  listCourses,
  submitQuizAnswer,
  submitStudyFeedback,
  toQuiz,
  updateActiveConcepts,
  uploadStudyMaterials,
} from './services/apiService';
import { Navigation } from './components/Navigation';
import { HomeScreen } from './components/screens/HomeScreen';
import { ParsingScreen } from './components/screens/ParsingScreen';
import { MindMapScreen } from './components/screens/MindMapScreen';
import { StudyScreen } from './components/screens/StudyScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { QuizScreen } from './components/screens/QuizScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { WeaknessReportScreen } from './components/screens/WeaknessReportScreen';
import { CourseReviewScreen } from './components/screens/CourseReviewScreen';
import { PriorityReviewScreen } from './components/screens/PriorityReviewScreen';

export default function App() {
  const [appState, setAppState] = useState<AppState>('HOME');
  const [studyMode, setStudyMode] = useState<StudyMode>('NORMAL');
  const [studyQueue, setStudyQueue] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [authVersion, setAuthVersion] = useState(0);
  
  const [courseId, setCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [courseDraft, setCourseDraft] = useState<CourseStructureDraft | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [documents, setDocuments] = useState<SourceDocument[]>([]);
  const [activeCardIds, setActiveCardIds] = useState<string[]>([]);
  const [weakPool, setWeakPool] = useState<string[]>([]);
  const [dailyConceptTarget, setDailyConceptTarget] = useState(8);
  const [resolvedToday, setResolvedToday] = useState(0);
  const [reviewedConceptCount, setReviewedConceptCount] = useState(0);
  const [unseenConceptCount, setUnseenConceptCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [behaviorHint, setBehaviorHint] = useState<string>('');

  const [mindmapContext, setMindmapContext] = useState<'ONBOARDING' | 'REVIEW'>('REVIEW');
  const [mapSelectedIds, setMapSelectedIds] = useState<string[]>([]);
  const [collapsedChapters, setCollapsedChapters] = useState<string[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalStudyTime: 0,
    sessions: [],
    upcomingReviews: [],
  });

  const [parseProgress, setParseProgress] = useState(0);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  }, []);

  const clearUserWorkspace = useCallback(() => {
    setCourseId(null);
    setCourse(null);
    setChapters([]);
    setCourseDraft(null);
    setCards([]);
    setDocuments([]);
    setActiveCardIds([]);
    setWeakPool([]);
    setStudyQueue([]);
    setMapSelectedIds([]);
    setCollapsedChapters([]);
    setActiveSessionId(null);
    setSessionStats(null);
    setReviewedConceptCount(0);
    setUnseenConceptCount(0);
    setSelectedOption(null);
    setUserProgress({
      totalStudyTime: 0,
      sessions: [],
      upcomingReviews: [],
    });
  }, []);

  const refreshAnalytics = useCallback(async (targetCourseId: string) => {
    const analytics = await getCourseAnalytics(targetCourseId);
    setWeakPool(analytics.weakPool);
    setResolvedToday(analytics.resolvedToday);
    setReviewedConceptCount(analytics.reviewedConceptCount);
    setUnseenConceptCount(analytics.unseenConceptCount);
    setBehaviorHint(analytics.behaviorHint.message);
    setUserProgress(prev => ({
      ...prev,
      ...analytics.userProgress,
    }));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCourse = async () => {
      if (!isBackendApiConfigured) {
        setIsLoadingCourse(false);
        return;
      }
      if (!getAuthToken()) {
        clearUserWorkspace();
        setIsLoadingCourse(false);
        return;
      }

      try {
        const [courses, progress] = await Promise.all([
          listCourses(),
          getUserProgress().catch(() => null),
        ]);
        if (!isMounted) return;

        if (progress) setUserProgress(progress);

        const currentCourse = courses[0];
        if (!currentCourse) {
          clearUserWorkspace();
          return;
        }

        const [loadedCards, loadedDocuments, loadedChapters] = await Promise.all([
          getCourseCards(currentCourse.id),
          getCourseDocuments(currentCourse.id),
          getCourseChapters(currentCourse.id),
        ]);
        if (!isMounted) return;

        setCourseId(currentCourse.id);
        setCourse({
          id: currentCourse.id,
          userId: currentCourse.user_id,
          code: currentCourse.code,
          title: currentCourse.title,
          subject: currentCourse.subject,
          details: currentCourse.details,
        });
        setCards(loadedCards);
        setDocuments(loadedDocuments);
        setChapters(loadedChapters);
        setActiveCardIds(loadedCards.map(card => card.id));
        setMapSelectedIds(loadedCards.map(card => card.id));
        await refreshAnalytics(currentCourse.id);
      } catch (error) {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : '';
        if (message.includes('Authentication required') || message.includes('401')) {
          clearUserWorkspace();
          return;
        }
        showToast('Backend connection failed. Check http://localhost:8000');
      } finally {
        if (isMounted) setIsLoadingCourse(false);
      }
    };

    loadCourse();
    return () => {
      isMounted = false;
    };
  }, [authVersion, clearUserWorkspace, refreshAnalytics, showToast]);

  const handleSyllabusUpload = useCallback(async (files: File[]) => {
    if (!isBackendApiConfigured) {
      showToast('⚠️ Backend API is not configured. Set VITE_API_BASE_URL in .env.local');
      return;
    }
    if (files.length === 0) {
      showToast('Select at least one course file');
      return;
    }

    setAppState('PARSING');
    setParseProgress(0);
    
    // Start progress simulation for the beginning
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 2;
      if (progress < 90) setParseProgress(progress);
    }, 500);

    try {
      const draft = await analyzeSyllabus(files[0]);
      clearInterval(progressInterval);
      setParseProgress(100);
      
      setTimeout(() => {
        setCourseDraft(draft);
        setAppState('COURSE_REVIEW');
        showToast('Syllabus structure extracted');
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setAppState('HOME');
      showToast('Failed to analyze syllabus. Please try again.');
    }
  }, [refreshAnalytics, showToast]);

  const handleConfirmCourseDraft = useCallback(async (draft: CourseStructureDraft) => {
    try {
      const created = await createCourseFromDraft(draft);
      const loadedChapters = await getCourseChapters(created.id);
      setCourse(created);
      setCourseId(created.id);
      setChapters(loadedChapters);
      setCourseDraft(null);
      setCards([]);
      setDocuments([]);
      setActiveCardIds([]);
      setMapSelectedIds([]);
      setMindmapContext('REVIEW');
      setAppState('HOME');
      showToast('Course workspace created');
    } catch (error) {
      showToast('Failed to create course');
    }
  }, [showToast]);

  const handleMaterialUpload = useCallback(async (files: File[], chapterIds: string[] = []) => {
    if (!courseId) {
      showToast('Create a course from syllabus before uploading materials');
      return;
    }
    if (files.length === 0) {
      showToast('Select at least one course file');
      return;
    }

    setAppState('PARSING');
    setParseProgress(0);
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 2;
      if (progress < 90) setParseProgress(progress);
    }, 500);

    try {
      const result = await uploadStudyMaterials(courseId, files, chapterIds);
      clearInterval(progressInterval);
      setParseProgress(100);
      setTimeout(async () => {
        setCards(result.cards);
        setDocuments(prev => [...prev, ...result.documents]);
        const newIds = result.cards.map(c => c.id);
        setActiveCardIds(newIds);
        setMapSelectedIds(newIds);
        await refreshAnalytics(courseId);
        const chapterNames = chapters.length > 0
          ? chapters.map(chapter => chapter.title)
          : Array.from(new Set(result.cards.map(card => card.chapter.split(' > ')[1] || 'General Theory')));
        setCollapsedChapters(chapterNames);
        setMindmapContext('ONBOARDING');
        setAppState('MINDMAP');
        showToast('Materials generated ' + result.cards.length + ' study cards');
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setAppState('HOME');
      showToast('Failed to process materials. Please try again.');
    }
  }, [chapters, courseId, refreshAnalytics, showToast]);

  const toggleMindmapCard = useCallback((cardId: string) => {
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

  const openKnowledgeMap = useCallback((context: 'ONBOARDING' | 'REVIEW' = 'REVIEW') => {
    if (!courseId) {
      showToast('Create a course before managing materials');
      setAppState('HOME');
      return;
    }
    const chapterNames = chapters.length > 0
      ? chapters.map(chapter => chapter.title)
      : Array.from(new Set(cards.map(card => card.chapter.split(' > ')[1] || 'General Theory')));
    setCollapsedChapters(chapterNames);
    setMindmapContext(context);
    setAppState('MINDMAP');
  }, [cards, chapters, courseId, showToast]);

  const handleNavigate = useCallback((state: AppState) => {
    if (!getAuthToken() && state !== 'PROFILE') {
      showToast('Please login or create an account first');
      setAppState('PROFILE');
      return;
    }
    if (state === 'MINDMAP' && !courseId) {
      showToast('Create a course before managing materials');
      setAppState('HOME');
      return;
    }
    setAppState(state);
  }, [courseId, showToast]);

  const handleAuthChange = useCallback(() => {
    setAuthVersion(version => version + 1);
    setIsLoadingCourse(true);
    setAppState('HOME');
  }, []);

  const handleLogout = useCallback(() => {
    clearUserWorkspace();
    setAuthVersion(version => version + 1);
    setAppState('PROFILE');
  }, [clearUserWorkspace]);

  const redirectUnauthenticatedClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (appState === 'PROFILE' || getAuthToken()) return;
    event.preventDefault();
    event.stopPropagation();
    showToast('Please login or create an account first');
    setAppState('PROFILE');
  }, [appState, showToast]);

  const handleConfirmMindmap = useCallback(async () => {
    if (mapSelectedIds.length === 0) {
      showToast('Please select at least one concept');
      return;
    }
    if (courseId) {
      await updateActiveConcepts(courseId, mapSelectedIds);
    }
    setActiveCardIds(mapSelectedIds);
    showToast('Study loop initialized successfully');
    setAppState('HOME');
  }, [courseId, mapSelectedIds, showToast]);

  const handleStartStudy = useCallback(async (mode: StudyMode, payload: string | null = null) => {
    if (!courseId) {
      showToast('Upload course material before starting a session');
      return;
    }

    setStudyMode(mode);
    let queue: Card[] = [];
    try {
      const session = await createStudySession(courseId, mode, payload ?? undefined);
      setActiveSessionId(session.sessionId);
      queue = session.cards;
    } catch (error) {
      showToast('Failed to start backend study session');
      return;
    }
      
    if (queue.length === 0) {
      showToast('No content available for this mode');
      return;
    }
    
    if (mode === 'WEAKNESS') {
      setSessionStats({ total: queue.length, mastered: 0, unsure: 0 });
    }
    if (mode === 'NORMAL') {
      queue = queue.slice(0, Math.max(1, dailyConceptTarget));
    }

    setStudyQueue(queue);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedOption(null);
    setSessionStartTime(Date.now());
    setAppState(mode === 'WEAKNESS' ? 'PRIORITY_REVIEW' : 'STUDYING');
  }, [courseId, dailyConceptTarget, showToast]);

  const handleExitStudy = useCallback(() => {
    if (studyMode === 'NORMAL') setAppState('HOME');
    else if (studyMode === 'WEAKNESS' || studyMode === 'SINGLE') setAppState('ANALYTICS');
    else setAppState('MINDMAP');
  }, [studyMode]);

  const recordSessionEnd = useCallback(async () => {
    let completedStats = sessionStats;
    if (activeSessionId) {
      const stats = await completeStudySession(activeSessionId);
      setSessionStats(stats);
      completedStats = stats;
      setActiveSessionId(null);
    }

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
            masteryRate: completedStats && studyQueue.length > 0 ? completedStats.mastered / studyQueue.length : 1
          }
        ]
      }));
      setSessionStartTime(null);
    }
    if (courseId) {
      await refreshAnalytics(courseId);
      const refreshedCards = await getCourseCards(courseId);
      setCards(refreshedCards);
    }
  }, [activeSessionId, courseId, refreshAnalytics, sessionStartTime, studyQueue.length, sessionStats]);

  const currentCard = studyQueue[currentIndex];
  const currentQuiz = currentCard ? toQuiz(currentCard) : null;

  const handleFeedback = useCallback(async (isMastered: boolean) => {
    const currentCard = studyQueue[currentIndex];
    if (!currentCard) return;

    if (activeSessionId) {
      try {
        const stats = await submitStudyFeedback(
          activeSessionId,
          currentCard.id,
          isMastered,
          sessionStartTime ? (Date.now() - sessionStartTime) / 1000 : 0,
        );
        setSessionStats(stats);
      } catch (error) {
        showToast('Failed to save feedback');
        return;
      }
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
        showToast('Targeted review complete');
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
          showToast('Session milestone reached');
        }
      }
    }, 400);
  }, [activeSessionId, currentIndex, sessionStartTime, studyQueue, studyMode, weakPool, showToast, recordSessionEnd]);

  const handleQuizComplete = useCallback(() => {
    setSelectedOption(null);
    if (courseId) {
      getCourseCards(courseId).then(setCards).catch(() => undefined);
      refreshAnalytics(courseId).catch(() => undefined);
    }
    if (currentIndex < studyQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAppState('STUDYING');
    } else {
      setAppState('ANALYTICS');
      setCurrentIndex(0);
      showToast('Learning cycle completed');
    }
  }, [courseId, currentIndex, refreshAnalytics, studyQueue.length, showToast]);

  const handleQuizOptionSelect = useCallback(async (optionId: string) => {
    if (!currentQuiz || !currentCard || !courseId || selectedOption) return;
    setSelectedOption(optionId);
    try {
      await submitQuizAnswer(
        courseId,
        currentQuiz.id,
        optionId,
        optionId === currentQuiz.correctAnswer ? 0.85 : 0.35,
        sessionStartTime ? (Date.now() - sessionStartTime) / 1000 : 0,
      );
      if (optionId !== currentQuiz.correctAnswer && !weakPool.includes(currentCard.id)) {
        setWeakPool(prev => [...prev, currentCard.id]);
      }
    } catch (error) {
      showToast('Failed to save quiz answer');
    }
  }, [courseId, currentCard, currentQuiz, selectedOption, sessionStartTime, showToast, weakPool]);

  const handlePriorityReviewAnswer = useCallback(async (optionId: string) => {
    if (!currentQuiz || !currentCard || !courseId || selectedOption) return;

    setSelectedOption(optionId);
    const isCorrect = optionId === currentQuiz.correctAnswer;
    const responseTime = sessionStartTime ? (Date.now() - sessionStartTime) / 1000 : 0;

    try {
      await submitQuizAnswer(
        courseId,
        currentQuiz.id,
        optionId,
        isCorrect ? 0.9 : 0.35,
        responseTime,
      );

      if (activeSessionId) {
        const stats = await submitStudyFeedback(
          activeSessionId,
          currentCard.id,
          isCorrect,
          responseTime,
        );
        setSessionStats(stats);
      }

      if (isCorrect) {
        setWeakPool(prev => prev.filter(id => id !== currentCard.id));
        setResolvedToday(prev => prev + 1);
      } else if (!weakPool.includes(currentCard.id)) {
        setWeakPool(prev => [...prev, currentCard.id]);
      }
    } catch (error) {
      showToast('Failed to save priority review result');
    }
  }, [activeSessionId, courseId, currentCard, currentQuiz, selectedOption, sessionStartTime, showToast, weakPool]);

  const handlePriorityReviewContinue = useCallback(async () => {
    if (selectedOption === null) return;

    if (currentIndex < studyQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setSessionStartTime(Date.now());
      return;
    }

    await recordSessionEnd();
    setSelectedOption(null);
    setAppState('WEAKNESS_REPORT');
  }, [currentIndex, recordSessionEnd, selectedOption, studyQueue.length]);

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
  
  const shouldShowNavigation =
    ['HOME', 'ANALYTICS', 'PROFILE'].includes(appState) ||
    (appState === 'MINDMAP' && mindmapContext === 'REVIEW');

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] font-sans p-4 selection:bg-blue-100 selection:text-blue-900">
      <div
        onClickCapture={redirectUnauthenticatedClick}
        className="relative w-full max-w-[390px] h-[844px] bg-white rounded-[54px] shadow-[0_24px_80px_rgba(0,0,0,0.12)] ring-8 ring-slate-900/5 overflow-hidden flex flex-col"
      >
        
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
                handleSyllabusUpload={handleSyllabusUpload}
                setAppState={setAppState}
                setMindmapContext={setMindmapContext}
                openKnowledgeMap={openKnowledgeMap}
                handleStartStudy={handleStartStudy}
                activeCardIds={activeCardIds}
                isAiEnabled={isBackendApiConfigured}
                isLoadingCourse={isLoadingCourse}
                totalConcepts={cards.length}
                weakCount={weakPool.length}
                reviewedConceptCount={reviewedConceptCount}
                unseenConceptCount={unseenConceptCount}
                masteryPercent={cards.length ? Math.round((cards.reduce((sum, card) => sum + card.mastery, 0) / cards.length) * 100) : 0}
                documents={documents}
                course={course}
                chapters={chapters}
                dailyConceptTarget={dailyConceptTarget}
                setDailyConceptTarget={setDailyConceptTarget}
              />
            )}
            {appState === 'PARSING' && (
              <ParsingScreen key="parsing" parseProgress={parseProgress} />
            )}
            {appState === 'COURSE_REVIEW' && courseDraft && (
              <CourseReviewScreen
                key="course-review"
                draft={courseDraft}
                setDraft={setCourseDraft}
                onConfirm={handleConfirmCourseDraft}
                onCancel={() => setAppState('HOME')}
              />
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
                handleMaterialUpload={handleMaterialUpload}
                weakPool={weakPool}
                groupedCards={groupedCards}
                documents={documents}
                chapters={chapters}
                course={course}
              />
            )}
            {appState === 'STUDYING' && currentCard && (
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
                reviewedConceptCount={reviewedConceptCount}
                unseenConceptCount={unseenConceptCount}
                behaviorHint={behaviorHint}
                handleStartStudy={handleStartStudy}
              />
            )}
            {appState === 'PRIORITY_REVIEW' && currentCard && (
              <PriorityReviewScreen
                key="priority-review"
                currentCard={currentCard}
                currentIndex={currentIndex}
                total={studyQueue.length}
                selectedOption={selectedOption}
                onSelectOption={handlePriorityReviewAnswer}
                onContinue={handlePriorityReviewContinue}
                onExit={handleExitStudy}
              />
            )}
            {appState === 'QUIZ' && currentQuiz && (
              <QuizScreen 
                key="quiz"
                currentQuiz={currentQuiz}
                selectedOption={selectedOption}
                setSelectedOption={handleQuizOptionSelect}
                handleQuizComplete={handleQuizComplete}
              />
            )}
            {appState === 'PROFILE' && (
              <ProfileScreen 
                key="profile"
                setAppState={setAppState}
                userProgress={userProgress}
                activeCourseId={courseId}
                behaviorHint={behaviorHint}
                onAuthChange={handleAuthChange}
                onLogout={handleLogout}
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

        {shouldShowNavigation && (
          <Navigation appState={appState} setAppState={handleNavigate} />
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
