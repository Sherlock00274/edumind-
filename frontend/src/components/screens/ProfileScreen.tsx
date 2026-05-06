import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  BookOpen,
  BookMarked,
  BrainCircuit,
  Calendar,
  ChevronRight,
  Clock,
  KeyRound,
  History,
  LogOut,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAuthToken, getCurrentStudyPlan, getCurrentUser, getProfileStats, getUserLlmSettings, getUserProgress, login, logout, register, updateUserLlmSettings } from '../../services/apiService';
import { ProfileStats, StudyPlan, UserAccount, UserLlmSettings, UserProgress } from '../../types';

interface ProfileScreenProps {
  setAppState: (state: string) => void;
  userProgress: UserProgress;
  activeCourseId: string | null;
  behaviorHint: string;
  onAuthChange: () => void;
  onLogout: () => void;
}

type ProfileTab = 'OVERVIEW' | 'HISTORY' | 'PLAN' | 'SETTINGS';
type AuthMode = 'LOGIN' | 'REGISTER';

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  setAppState,
  userProgress,
  activeCourseId,
  behaviorHint,
  onAuthChange,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('OVERVIEW');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [user, setUser] = useState<UserAccount | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [progress, setProgress] = useState<UserProgress>(userProgress);
  const [llmSettings, setLlmSettings] = useState<UserLlmSettings | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [name, setName] = useState('Felix Wang');
  const [email, setEmail] = useState('felix@example.com');
  const [password, setPassword] = useState('password');
  const [subject, setSubject] = useState('Computer Science');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    const [currentUser, profileStats, latestProgress, currentLlmSettings] = await Promise.all([
      getCurrentUser(),
      getProfileStats(),
      getUserProgress(),
      getUserLlmSettings().catch(() => null),
    ]);
    setUser(currentUser);
    setStats(profileStats);
    setProgress(latestProgress);
    setLlmSettings(currentLlmSettings);
    if (activeCourseId) {
      setPlan(await getCurrentStudyPlan(activeCourseId).catch(() => null));
    }
  };

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        if (getAuthToken()) {
          await loadProfile();
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [activeCourseId]);

  const handleAuth = async () => {
    setAuthError('');
    try {
      const account = authMode === 'LOGIN'
        ? await login(email, password)
        : await register(name, email, password, subject);
      setUser(account);
      const [profileStats, latestProgress, currentLlmSettings] = await Promise.all([getProfileStats(), getUserProgress(), getUserLlmSettings().catch(() => null)]);
      setStats(profileStats);
      setProgress(latestProgress);
      setLlmSettings(currentLlmSettings);
      onAuthChange();
    } catch (error) {
      setAuthError(authMode === 'LOGIN' ? 'Login failed. Check your email and password.' : 'Registration failed. Try a different email.');
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setStats(null);
    setPlan(null);
    setLlmSettings(null);
    setApiKeyInput('');
    setSettingsMessage('');
    setProgress({
      totalStudyTime: 0,
      sessions: [],
      upcomingReviews: [],
    });
    onLogout();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const masteryPercent = Math.round((stats?.masteryRate ?? 0) * 100);
  const growthPercent = Math.round((stats?.retentionGrowth ?? 0) * 1000) / 10;
  const sortedSessions = useMemo(
    () => [...progress.sessions].sort((a, b) => b.timestamp - a.timestamp),
    [progress.sessions],
  );

  const tabs = [
    { id: 'OVERVIEW' as const, label: 'Overview', icon: TrendingUp },
    { id: 'HISTORY' as const, label: 'History', icon: History },
    { id: 'PLAN' as const, label: 'Future', icon: Calendar },
    { id: 'SETTINGS' as const, label: 'Settings', icon: KeyRound },
  ];

  const handleSaveApiKey = async () => {
    setIsSavingApiKey(true);
    setSettingsMessage('');
    try {
      const nextSettings = await updateUserLlmSettings(apiKeyInput);
      setLlmSettings(nextSettings);
      setApiKeyInput('');
      setSettingsMessage(nextSettings.hasUserApiKey ? 'API Key saved to this local app profile.' : 'Custom API Key cleared. The app will use the environment key if available.');
    } catch (error) {
      setSettingsMessage('Failed to save API Key.');
    } finally {
      setIsSavingApiKey(false);
    }
  };

  if (isLoading) {
    return <div className="px-6 pt-20 text-sm font-bold text-slate-400">Loading profile...</div>;
  }

  if (!user) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-6 pt-16 pb-28">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Account</h1>
        <p className="text-sm font-medium text-slate-400 mb-8">Sign in to sync progress, history, and future reviews.</p>

        <div className="rounded-[32px] bg-white border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-1">
            {(['LOGIN', 'REGISTER'] as AuthMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setAuthMode(mode)}
                className={`rounded-xl py-3 text-[12px] font-black ${authMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                {mode === 'LOGIN' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          {authMode === 'REGISTER' && (
            <input value={name} onChange={event => setName(event.target.value)} placeholder="Name" className="w-full rounded-2xl bg-slate-50 px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" />
          )}
          <input value={email} onChange={event => setEmail(event.target.value)} placeholder="Email" className="w-full rounded-2xl bg-slate-50 px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" />
          <input value={password} type="password" onChange={event => setPassword(event.target.value)} placeholder="Password" className="w-full rounded-2xl bg-slate-50 px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" />
          {authMode === 'REGISTER' && (
            <input value={subject} onChange={event => setSubject(event.target.value)} placeholder="Subject" className="w-full rounded-2xl bg-slate-50 px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10" />
          )}
          {authError && <p className="rounded-xl bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-600">{authError}</p>}
          <button onClick={handleAuth} className="w-full rounded-[22px] bg-blue-600 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/20">
            {authMode === 'LOGIN' ? 'Login' : 'Create Account'}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-6 pt-16 pb-28">
      <header className="mb-10 flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence</h1>
        <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all">
          <LogOut size={18}/>
        </button>
      </header>

      <div className="flex items-center gap-5 mb-10">
        <div className="w-20 h-20 rounded-[28px] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}`} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-black text-slate-900 break-words">{user.name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
             <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-wider">Level {user.level}</span>
             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><BookOpen size={10}/> {user.subject ?? 'General Study'}</span>
          </div>
        </div>
      </div>

      <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] mb-8 relative">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[18px] text-[13px] font-bold transition-all relative z-10 ${isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
              {isActive && <motion.div layoutId="profile-tab" className="absolute inset-0 bg-white shadow-sm rounded-[18px]" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />}
              <Icon size={16} className="relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'OVERVIEW' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <MetricCard icon={<Clock size={16} className="text-blue-500" />} label="Study Time" value={formatDuration(stats?.totalStudyTime ?? 0)} />
              <MetricCard icon={<BrainCircuit size={16} className="text-emerald-500" />} label="Mastery" value={`${masteryPercent}%`} />
            </div>

            <div className="bg-slate-900 text-white p-7 rounded-[40px] shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-lg font-black tracking-tight mb-1">Synaptic Retention</h3>
                  <p className="text-slate-400 text-[12px] font-medium mb-6">Based on completed backend sessions</p>
                  <div className="flex items-end gap-1.5 mb-2">
                     <span className="text-4xl font-black tracking-tighter">{masteryPercent}%</span>
                     <span className={`text-sm font-bold flex items-center gap-1 mb-1.5 ${growthPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                       <TrendingUp size={14}/> {growthPercent >= 0 ? '+' : ''}{growthPercent}%
                     </span>
                  </div>
               </div>
               <svg className="absolute bottom-0 left-0 w-full h-[80px] opacity-20" viewBox="0 0 100 40">
                  <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} d={curvePath(stats?.activityDistribution ?? [])} fill="none" stroke="white" strokeWidth="2" />
               </svg>
            </div>

            <div className="flex items-center justify-between px-1">
               <h3 className="text-[15px] font-black text-slate-900">Activity Distribution</h3>
               <span className="text-slate-400 text-[11px] font-bold">Past 4 weeks</span>
            </div>
            <ActivityGrid days={stats?.activityDistribution ?? []} />
          </motion.div>
        )}

        {activeTab === 'HISTORY' && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {sortedSessions.length === 0 && <EmptyState text="No completed backend sessions yet." />}
            {sortedSessions.map((session) => (
              <div key={session.id} className="bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm flex items-center justify-between group hover:border-blue-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                    <History size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[14px] leading-none mb-1.5">{session.conceptsCount} concepts reviewed</h4>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">{new Date(session.timestamp).toLocaleDateString()} • {formatDuration(session.duration)}</p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[13px] font-black text-slate-900">{(session.masteryRate * 100).toFixed(0)}%</div>
                   <div className="text-[9px] font-bold text-slate-300 uppercase">Mastery</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'PLAN' && (
          <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="bg-blue-600 text-white p-6 rounded-[32px] shadow-lg shadow-blue-600/20 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} />
                <span className="text-[12px] font-black uppercase tracking-[0.2em] opacity-80">Backend Forecast</span>
              </div>
              <h3 className="text-lg font-black leading-tight mb-2">{plan?.tasks.length ?? progress.upcomingReviews.length ?? 0} adaptive tasks queued.</h3>
              <p className="text-blue-100 text-sm font-medium opacity-80 leading-relaxed">{behaviorHint || 'Generated from weak concepts, response latency, and scheduled review candidates.'}</p>
            </div>
            <h3 className="text-[15px] font-black text-slate-900 px-1 mb-4 flex items-center gap-2">Adaptive Plan <Calendar size={18} className="text-slate-300" /></h3>
            {!plan && progress.upcomingReviews.length === 0 && <EmptyState text="No scheduled reviews yet." />}
            {plan?.tasks.slice(0, 8).map((task) => (
              <div key={task.id} className="bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Target className="text-blue-500" size={20} />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-[14px] font-black text-slate-900 truncate mb-1">{task.type.toUpperCase()} • {task.durationMinutes} min</p>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock size={10} /> {new Date(task.scheduledFor).toLocaleDateString([], { month: 'short', day: 'numeric' })} • Priority {task.priority.toFixed(2)}
                  </p>
                </div>
                <button onClick={() => setAppState('HOME')} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm active:scale-90">
                  <ChevronRight size={18} strokeWidth={3} />
                </button>
              </div>
            ))}
            {!plan && progress.upcomingReviews.map((review) => (
              <div key={review.conceptId} className="bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <BookMarked className="text-blue-500" size={20} />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-[14px] font-black text-slate-900 truncate mb-1">{review.conceptName}</p>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock size={10} /> {new Date(review.scheduledTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • Review
                  </p>
                </div>
                <button onClick={() => setAppState('HOME')} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm active:scale-90">
                  <ChevronRight size={18} strokeWidth={3} />
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'SETTINGS' && (
          <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
            <div className="rounded-[32px] bg-slate-900 p-6 text-white shadow-xl">
              <div className="mb-3 flex items-center gap-2">
                <KeyRound size={18} />
                <span className="text-[12px] font-black uppercase tracking-[0.2em] opacity-80">LLM Settings</span>
              </div>
              <h3 className="mb-2 text-lg font-black">DashScope / OpenAI-compatible key</h3>
              <p className="text-sm font-medium leading-relaxed text-slate-300">
                The key is saved locally for the current account and used by the backend when parsing syllabus and course materials.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <div className="grid gap-3 text-[12px] font-bold text-slate-500">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">API URL</div>
                  <div className="break-all text-slate-800">{llmSettings?.apiUrl ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">Model</div>
                  <div className="text-slate-800">{llmSettings?.model ?? 'deepseek-v4-flash'}</div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  <CheckCircle2 size={14} className={(llmSettings?.hasEffectiveApiKey ?? false) ? 'text-emerald-500' : 'text-slate-300'} />
                  Current Status
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {llmSettings?.hasUserApiKey
                    ? `Using saved personal key ${llmSettings.apiKeyPreview ? `(${llmSettings.apiKeyPreview})` : ''}.`
                    : llmSettings?.hasEffectiveApiKey
                      ? 'No personal key saved. Using backend environment key.'
                      : 'No API Key configured yet.'}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Personal API Key
                </label>
                <input
                  value={apiKeyInput}
                  type="password"
                  onChange={event => setApiKeyInput(event.target.value)}
                  placeholder="Enter a new key, or leave blank to clear"
                  className="w-full rounded-2xl bg-slate-50 px-4 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
                />
                <p className="mt-2 text-[11px] font-medium text-slate-400">
                  Saving an empty value clears your personal key.
                </p>
              </div>

              {settingsMessage && (
                <p className={`rounded-xl px-3 py-2 text-[11px] font-bold ${settingsMessage.includes('Failed') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}>
                  {settingsMessage}
                </p>
              )}

              <button
                onClick={handleSaveApiKey}
                disabled={isSavingApiKey}
                className="w-full rounded-[22px] bg-blue-600 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingApiKey ? 'Saving...' : 'Save API Key'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MetricCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-3xl font-black text-slate-900">{value}</div>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-slate-400">{text}</div>
);

const ActivityGrid = ({ days }: { days: ProfileStats['activityDistribution'] }) => {
  const paddedDays = days.length > 0 ? days : Array.from({ length: 28 }, (_, index) => ({ date: String(index), minutes: 0, intensity: 0 }));
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {paddedDays.map((day) => (
        <div key={day.date} title={`${day.date}: ${day.minutes}m`} className={`aspect-square rounded-[6px] ${activityColor(day.intensity)}`} />
      ))}
    </div>
  );
};

const activityColor = (intensity: number) => {
  if (intensity >= 4) return 'bg-blue-600';
  if (intensity === 3) return 'bg-blue-500';
  if (intensity === 2) return 'bg-blue-300';
  if (intensity === 1) return 'bg-blue-100';
  return 'bg-slate-100';
};

const curvePath = (days: ProfileStats['activityDistribution']) => {
  if (days.length === 0) return 'M 0 35 Q 25 15 50 30 T 100 20';
  const points = days.slice(-7).map((day, index) => `${index * 16} ${35 - day.intensity * 7}`);
  return `M ${points.join(' L ')}`;
};
