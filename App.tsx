import React, { useState, useEffect, useMemo } from 'react';
import { StudyLog, TimeRange, Lesson, Goals } from './types';
import { DEFAULT_LESSONS, DEFAULT_GOALS } from './constants';
import StatCard from './components/StatCard';
import LogForm from './components/LogForm';
import SettingsModal from './components/SettingsModal';

type ViewMode = 'dashboard' | 'history' | 'daily';

const App: React.FC = () => {
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>(DEFAULT_LESSONS);
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  
  // State for Lesson Detail View (Replaces Accordion)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Load data safely with strict ID enforcement
  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem('kpss_logs');
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed)) {
            const seenIds = new Set<string>();
            const sanitizedLogs = parsed.filter(l => l).map((log: any) => {
                let id = log.id;
                // Force unique string IDs
                if (!id || typeof id !== 'string' || seenIds.has(id)) {
                    id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 5)}`;
                }
                seenIds.add(id);
                
                return {
                    ...log,
                    id
                };
            });
            setLogs(sanitizedLogs);
        }
      }

      const savedLessons = localStorage.getItem('kpss_lessons');
      if (savedLessons) {
        const parsed = JSON.parse(savedLessons);
        if (Array.isArray(parsed) && parsed.length > 0) setLessons(parsed);
      }

      const savedGoals = localStorage.getItem('kpss_goals');
      if (savedGoals) {
        const parsed = JSON.parse(savedGoals);
        // Ensure structure matches including topicGoals
        if (parsed.daily && parsed.weekly) {
             setGoals({
                 ...DEFAULT_GOALS,
                 ...parsed
             });
        }
      }
    } catch (e) {
      console.error("Veri yükleme hatası:", e);
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('kpss_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('kpss_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('kpss_goals', JSON.stringify(goals));
  }, [goals]);

  const addLog = (newLog: Omit<StudyLog, 'id'>) => {
    const log: StudyLog = {
      ...newLog,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setLogs([log, ...logs]);
  };

  const deleteLog = (id: string) => {
    // Using simple confirm
    if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      setLogs((prevLogs) => prevLogs.filter(l => String(l.id) !== String(id)));
    }
  };

  // Dashboard Stats
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const rangeFilteredLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      if (timeRange === 'daily') return log.date === todayStr;
      if (timeRange === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return logDate >= weekAgo;
      }
      if (timeRange === 'monthly') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return logDate >= monthAgo;
      }
      return true;
    });

    const todayLogs = logs.filter(l => l.date === todayStr);
    const todayQuestions = todayLogs.reduce((acc, curr) => acc + (curr.questionsSolved || 0), 0);
    const todayTime = todayLogs.reduce((acc, curr) => acc + (curr.duration || 0), 0);

    const totalTime = rangeFilteredLogs.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const totalQuestions = rangeFilteredLogs.reduce((acc, curr) => acc + (curr.questionsSolved || 0), 0);
    const uniqueDays = new Set(rangeFilteredLogs.map(l => l.date)).size;

    return {
      totalTime,
      totalQuestions,
      uniqueDays,
      todayQuestions,
      todayTime
    };
  }, [logs, timeRange, lessons]);

  // Goal Calculations
  const goalStats = useMemo(() => {
    const currentGoal = goals[timeRange];
    
    const questionPct = Math.min(100, Math.round((stats.totalQuestions / (currentGoal.questions || 1)) * 100));

    return {
      currentGoal,
      questionPct
    };
  }, [stats, goals, timeRange]);

  // Daily Stats Grouping
  const dailyGroups = useMemo(() => {
    const groups: Record<string, { date: string; totalQuestions: number; totalDuration: number }> = {};
    
    logs.forEach(log => {
      if (!groups[log.date]) {
        groups[log.date] = { date: log.date, totalQuestions: 0, totalDuration: 0 };
      }
      groups[log.date].totalQuestions += (log.questionsSolved || 0);
      groups[log.date].totalDuration += (log.duration || 0);
    });

    return Object.values(groups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs]);

  // Helper to render lesson detail content
  const renderLessonDetail = () => {
    const lesson = lessons.find(l => l.id === selectedLessonId);
    if (!lesson) return null;

    const lessonLogs = logs.filter(l => l.lessonId === lesson.id);

    // Group by topic
    const logsByTopic: Record<string, StudyLog[]> = {};
    lessonLogs.forEach(log => {
      if (!logsByTopic[log.topic]) logsByTopic[log.topic] = [];
      logsByTopic[log.topic].push(log);
    });

    return (
      <div className="animate-in slide-in-from-right duration-300 pb-20">
        {/* Detail Header */}
        <div className="bg-white sticky top-16 z-20 pb-4 pt-2 border-b border-slate-50 mb-4">
           <button 
             onClick={() => setSelectedLessonId(null)}
             className="mb-4 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-bold text-sm"
           >
             <i className="fas fa-arrow-left"></i>
             <span>Derslere Dön</span>
           </button>

           <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${lesson.color} flex items-center justify-center text-white shadow-lg`}>
                 <span className="font-bold text-xl">{lesson.name[0]}</span>
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{lesson.name}</h2>
              </div>
           </div>
        </div>

        {/* Topics List */}
        <div className="space-y-6">
          {Object.keys(logsByTopic).length === 0 ? (
             <div className="text-center py-10 text-slate-300">
                <p>Bu ders için henüz kayıt yok.</p>
             </div>
          ) : (
             Object.entries(logsByTopic).map(([topic, topicLogs]) => {
              const topicTotalQuestions = topicLogs.reduce((acc, curr) => acc + (curr.questionsSolved || 0), 0);
              const topicTotalDuration = topicLogs.reduce((acc, curr) => acc + (curr.duration || 0), 0);
              
              const topicGoalKey = `${lesson.id}:${topic}`;
              const topicGoal = goals.topicGoals?.[topicGoalKey] || 0;
              const goalPct = topicGoal > 0 ? Math.min(100, Math.round((topicTotalQuestions / topicGoal) * 100)) : 0;
              
              return (
                <div key={topic} className="space-y-2">
                  {/* Topic Header with Stats - Added pointer-events-none to container and auto to children to allow clicking through empty space */}
                  <div className="px-2 bg-white/50 backdrop-blur-sm py-2 sticky top-[165px] z-10 flex flex-col gap-1.5 pointer-events-none">
                    <div className="flex items-center justify-between pointer-events-auto">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${lesson.color}`}></div>
                          <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">
                            {topic}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <div className="bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                             <span className="text-[10px] font-bold text-slate-500">{topicTotalQuestions} Soru</span>
                           </div>
                           <div className="bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                             <span className="text-[10px] font-bold text-slate-400">{topicTotalDuration} dk</span>
                           </div>
                        </div>
                    </div>
                    
                    {/* Topic Goal Progress */}
                    {topicGoal > 0 && (
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex pointer-events-auto">
                            <div 
                                className={`h-full ${lesson.color} transition-all duration-500`} 
                                style={{ width: `${goalPct}%` }}
                            ></div>
                        </div>
                    )}
                  </div>
                  
                  {/* Individual Logs */}
                  <div className="grid gap-2">
                    {topicLogs
                      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(log => (
                      <div key={log.id} className="relative flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                         <div className="flex items-center gap-3">
                           <div className="bg-slate-50 w-10 h-10 rounded-xl flex flex-col items-center justify-center border border-slate-100 text-slate-400">
                             <span className="text-[10px] font-black text-slate-700">{new Date(log.date).getDate()}</span>
                             <span className="text-[8px] font-bold uppercase tracking-wide">{new Date(log.date).toLocaleString('tr-TR', {month:'short'})}</span>
                           </div>
                           <div className="flex flex-col">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-700">{log.questionsSolved} Soru</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-slate-400">{log.duration} dk</span>
                             </div>
                           </div>
                         </div>
                         <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteLog(log.id);
                            }}
                            className="relative z-20 w-10 h-10 flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all active:scale-90 cursor-pointer shadow-sm border border-transparent hover:border-rose-100"
                            title="Kaydı Sil"
                          >
                            <i className="fas fa-trash-alt text-sm pointer-events-none"></i>
                          </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 pb-24 select-none">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Soru Takip" className="w-10 h-10 rounded-xl shadow-lg shadow-indigo-100 object-cover bg-white" />
          <h1 className="font-extrabold text-xl tracking-tight text-slate-800">SORU TAKİP</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 active:bg-slate-200 transition-colors"
          >
            <i className="fas fa-cog"></i>
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
          >
            <i className="fas fa-plus mr-2"></i>Ekle
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        
        {/* DASHBOARD VIEW */}
        {activeView === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Today Summary */}
            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex justify-around">
               <div className="text-center">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bugünkü Soru</p>
                 <p className="text-3xl font-black text-indigo-600">{stats.todayQuestions}</p>
               </div>
               <div className="w-px bg-slate-100 h-10 my-auto"></div>
               <div className="text-center">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Bugünkü Süre</p>
                 <p className="text-3xl font-black text-slate-800">{stats.todayTime}<span className="text-sm font-medium ml-1">dk</span></p>
               </div>
            </div>

            {/* Time Selector */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
              {(['daily', 'weekly', 'monthly'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                    timeRange === range ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {range === 'daily' ? 'Gün' : range === 'weekly' ? 'Hafta' : 'Ay'}
                </button>
              ))}
            </div>

            {/* Goal Progress Section */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
               <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                 <i className="fas fa-bullseye text-indigo-500"></i>
                 Hedef Durumu <span className="text-xs font-medium text-slate-400 ml-auto capitalize">{timeRange === 'daily' ? 'Günlük' : timeRange === 'weekly' ? 'Haftalık' : 'Aylık'}</span>
               </h3>
               
               {/* Question Goal */}
               <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Soru Hedefi</span>
                    <span className="text-xs font-bold text-slate-700">{stats.totalQuestions} / {goalStats.currentGoal.questions}</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2"
                      style={{ width: `${goalStats.questionPct}%` }}
                    >
                       {goalStats.questionPct > 15 && <span className="text-[9px] font-bold text-white leading-none">{goalStats.questionPct}%</span>}
                    </div>
                  </div>
               </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatCard title="Toplam Süre" value={`${stats.totalTime} dk`} icon="fa-clock" color="bg-indigo-500" />
              <StatCard title="Toplam Soru" value={stats.totalQuestions} icon="fa-check-circle" color="bg-emerald-500" />
              <div className="col-span-2 md:col-span-1">
                <StatCard title="Çalışılan Gün" value={stats.uniqueDays} icon="fa-calendar" color="bg-amber-500" />
              </div>
            </div>
          </div>
        )}

        {/* DAILY VIEW */}
        {activeView === 'daily' && (
           <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300 pb-20">
             <h2 className="text-xl font-black text-slate-800 mb-2 px-2">Günlük Özet</h2>
             {dailyGroups.length === 0 ? (
                <div className="text-center py-20 text-slate-300">
                  <i className="fas fa-calendar-times text-5xl mb-4"></i>
                  <p className="font-medium text-sm">Henüz kayıt yok.</p>
                </div>
             ) : (
                <div className="space-y-3">
                  {dailyGroups.map((dayStat) => {
                    const dateObj = new Date(dayStat.date);
                    return (
                      <div key={dayStat.date} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                         {/* Date Section */}
                         <div className="flex items-center gap-4">
                            <div className="bg-slate-50 w-14 h-14 rounded-2xl flex flex-col items-center justify-center border border-slate-100 text-slate-800">
                               <span className="text-xl font-black leading-none">{dateObj.getDate()}</span>
                               <span className="text-[9px] font-bold uppercase text-slate-400 mt-0.5">{dateObj.toLocaleString('tr-TR', {month:'short'})}</span>
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-800">{dateObj.toLocaleString('tr-TR', {weekday:'long'})}</p>
                               <p className="text-[10px] text-slate-400 font-medium">Günlük Toplam</p>
                            </div>
                         </div>
                         
                         {/* Stats Section */}
                         <div className="text-right flex items-center gap-5 pr-2">
                            <div>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Soru</p>
                               <p className="text-lg font-black text-indigo-600">{dayStat.totalQuestions}</p>
                            </div>
                            <div className="w-px h-8 bg-slate-100"></div>
                            <div>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Süre</p>
                               <p className="text-lg font-black text-slate-800">{dayStat.totalDuration}<span className="text-[10px] ml-0.5 font-bold text-slate-400">dk</span></p>
                            </div>
                         </div>
                      </div>
                    )
                  })}
                </div>
             )}
           </div>
        )}

        {/* LESSON HISTORY VIEW */}
        {activeView === 'history' && (
          // If a lesson is selected, show detail view
          selectedLessonId ? (
            renderLessonDetail()
          ) : (
            // Otherwise show list of lessons
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300 pb-20">
              <h2 className="text-xl font-black text-slate-800 mb-2 px-2">Ders Geçmişi</h2>
              {logs.length === 0 ? (
                <div className="text-center py-20 text-slate-300">
                  <i className="fas fa-ghost text-5xl mb-4"></i>
                  <p className="font-medium text-sm">Henüz kayıt girmedin.</p>
                </div>
              ) : (
                // Group logs by Lesson
                lessons
                  .filter(lesson => logs.some(log => log.lessonId === lesson.id))
                  .map(lesson => {
                    return (
                      <div key={lesson.id} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 active:scale-[0.98]">
                        
                        {/* Lesson Card (Navigates to detail) */}
                        <button 
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl ${lesson.color} flex items-center justify-center text-white shadow-sm`}>
                               <span className="font-bold text-lg">{lesson.name[0]}</span>
                            </div>
                            <div className="text-left">
                              <h3 className="font-black text-slate-800 text-lg leading-tight">{lesson.name}</h3>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                            <i className="fas fa-chevron-right text-xs"></i>
                          </div>
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          )
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 h-20 px-6 flex items-center justify-between z-50">
        <button 
          onClick={() => {
            setActiveView('dashboard');
            setSelectedLessonId(null);
          }}
          className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${activeView === 'dashboard' ? 'text-indigo-600' : 'text-slate-300'}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full mb-0.5 transition-all ${activeView === 'dashboard' ? 'bg-indigo-600 scale-100' : 'bg-transparent scale-0'}`}></div>
          <i className="fas fa-home-alt text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Panel</span>
        </button>

        <button 
          onClick={() => {
            setActiveView('daily');
            setSelectedLessonId(null);
          }}
          className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${activeView === 'daily' ? 'text-indigo-600' : 'text-slate-300'}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full mb-0.5 transition-all ${activeView === 'daily' ? 'bg-indigo-600 scale-100' : 'bg-transparent scale-0'}`}></div>
          <i className="fas fa-calendar-alt text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Günlük</span>
        </button>

        <button 
          onClick={() => {
            setActiveView('history');
            setSelectedLessonId(null);
          }}
          className={`flex-1 flex flex-col items-center gap-1.5 transition-all ${activeView === 'history' ? 'text-indigo-600' : 'text-slate-300'}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full mb-0.5 transition-all ${activeView === 'history' ? 'bg-indigo-600 scale-100' : 'bg-transparent scale-0'}`}></div>
          <i className="fas fa-layer-group text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Dersler</span>
        </button>
      </nav>

      {isFormOpen && <LogForm lessons={lessons} onAdd={addLog} onClose={() => setIsFormOpen(false)} />}
      {isSettingsOpen && <SettingsModal lessons={lessons} setLessons={setLessons} goals={goals} setGoals={setGoals} onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default App;