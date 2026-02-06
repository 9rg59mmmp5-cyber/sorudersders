
import React, { useState, useEffect, useMemo } from 'react';
import { StudyLog, TimeRange, Lesson } from './types';
import { DEFAULT_LESSONS } from './constants';
import StatCard from './components/StatCard';
import LogForm from './components/LogForm';
import SettingsModal from './components/SettingsModal';

type ViewMode = 'dashboard' | 'history';

const App: React.FC = () => {
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>(DEFAULT_LESSONS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');

  // Load data safely
  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem('kpss_logs');
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed)) setLogs(parsed);
      }

      const savedLessons = localStorage.getItem('kpss_lessons');
      if (savedLessons) {
        const parsed = JSON.parse(savedLessons);
        if (Array.isArray(parsed) && parsed.length > 0) setLessons(parsed);
      }
    } catch (e) {
      console.error("Veri yükleme hatası:", e);
      // Hata durumunda varsayılanlarla devam et
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('kpss_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('kpss_lessons', JSON.stringify(lessons));
  }, [lessons]);

  const addLog = (newLog: Omit<StudyLog, 'id'>) => {
    const log: StudyLog = {
      ...newLog,
      id: Math.random().toString(36).substr(2, 9)
    };
    setLogs([log, ...logs]);
  };

  const deleteLog = (id: string) => {
    if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      setLogs(logs.filter(l => l.id !== id));
    }
  };

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

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 pb-24 select-none">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <i className="fas fa-rocket"></i>
          </div>
          <h1 className="font-extrabold text-lg tracking-tight text-slate-800">KPSS Takip</h1>
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

        {activeView === 'history' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-black text-slate-800 mb-4 px-2">Çalışma Geçmişi</h2>
            {logs.length === 0 ? (
              <div className="text-center py-20 text-slate-300">
                <i className="fas fa-ghost text-5xl mb-4"></i>
                <p className="font-medium text-sm">Henüz kayıt girmedin.</p>
              </div>
            ) : (
              logs.map(log => {
                const lesson = lessons.find(l => l.id === log.lessonId);
                return (
                  <div key={log.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between active:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl ${lesson?.color || 'bg-slate-300'} flex items-center justify-center text-white shadow-sm`}>
                        <span className="font-bold">{lesson?.name?.[0] || '?'}</span>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          {new Date(log.date).toLocaleDateString('tr-TR', {day:'numeric', month:'short'})}
                        </p>
                        <h4 className="font-bold text-slate-800 truncate leading-tight">{lesson?.name || 'Bilinmeyen'}</h4>
                        <p className="text-xs text-slate-500 truncate">{log.topic}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{log.questionsSolved} Soru</span>
                          <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{log.duration} Dakika</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteLog(log.id)}
                      className="text-slate-200 active:text-rose-500 p-3"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 h-20 px-10 flex items-center justify-around z-50">
        <button 
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeView === 'dashboard' ? 'text-indigo-600' : 'text-slate-300'}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full mb-0.5 transition-all ${activeView === 'dashboard' ? 'bg-indigo-600 scale-100' : 'bg-transparent scale-0'}`}></div>
          <i className="fas fa-home-alt text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Panel</span>
        </button>
        <button 
          onClick={() => setActiveView('history')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeView === 'history' ? 'text-indigo-600' : 'text-slate-300'}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full mb-0.5 transition-all ${activeView === 'history' ? 'bg-indigo-600 scale-100' : 'bg-transparent scale-0'}`}></div>
          <i className="fas fa-history text-lg"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Geçmiş</span>
        </button>
      </nav>

      {isFormOpen && <LogForm lessons={lessons} onAdd={addLog} onClose={() => setIsFormOpen(false)} />}
      {isSettingsOpen && <SettingsModal lessons={lessons} setLessons={setLessons} onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default App;
