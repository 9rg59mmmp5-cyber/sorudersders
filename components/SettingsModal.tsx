import React, { useState, useEffect } from 'react';
import { Lesson, Goals } from '../types';

interface SettingsModalProps {
  lessons: Lesson[];
  setLessons: (lessons: Lesson[]) => void;
  goals: Goals;
  setGoals: (goals: Goals) => void;
  onClose: () => void;
}

type Tab = 'topics' | 'goals';

const SettingsModal: React.FC<SettingsModalProps> = ({ lessons, setLessons, goals, setGoals, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('topics');
  
  // Topics State
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id || '');
  const [newTopic, setNewTopic] = useState('');
  const [editingTopic, setEditingTopic] = useState<{ old: string, new: string } | null>(null);

  // Goals State (Local buffer before save)
  const [localGoals, setLocalGoals] = useState<Goals>(goals);

  const activeLesson = lessons.find(l => l.id === selectedLessonId);

  // Sync props to local state when opening
  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  // --- Topic Logic ---
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !activeLesson) return;
    addTopics([newTopic.trim()]);
    setNewTopic('');
  };

  const addTopics = (topicsToAdd: string[]) => {
    const updatedLessons = lessons.map(l => {
      if (l.id === selectedLessonId) {
        const uniqueNew = topicsToAdd.filter(t => !l.topics.includes(t));
        return { ...l, topics: [...l.topics, ...uniqueNew] };
      }
      return l;
    });
    setLessons(updatedLessons);
  };

  const handleDeleteTopic = (topicToDelete: string) => {
    if (!window.confirm(`"${topicToDelete}" konusunu silmek istediğinize emin misiniz?`)) return;

    const updatedLessons = lessons.map(l => {
      if (l.id === selectedLessonId) {
        return { ...l, topics: l.topics.filter(t => t !== topicToDelete) };
      }
      return l;
    });
    setLessons(updatedLessons);
    
    // Also remove the goal for this topic if it exists
    const goalKey = `${selectedLessonId}:${topicToDelete}`;
    const newTopicGoals = { ...goals.topicGoals };
    delete newTopicGoals[goalKey];
    setGoals({ ...goals, topicGoals: newTopicGoals });
  };

  const startEditing = (topic: string) => {
    setEditingTopic({ old: topic, new: topic });
  };

  const saveTopicEdit = () => {
    if (!editingTopic || !editingTopic.new.trim() || !activeLesson) return;

    const updatedLessons = lessons.map(l => {
      if (l.id === selectedLessonId) {
        const newTopics = l.topics.map(t => t === editingTopic.old ? editingTopic.new.trim() : t);
        return { ...l, topics: newTopics };
      }
      return l;
    });

    setLessons(updatedLessons);
    
    // Migrate goal to new topic name
    const oldKey = `${selectedLessonId}:${editingTopic.old}`;
    const newKey = `${selectedLessonId}:${editingTopic.new.trim()}`;
    const currentGoal = goals.topicGoals?.[oldKey];
    
    if (currentGoal) {
        const newTopicGoals = { ...goals.topicGoals };
        delete newTopicGoals[oldKey];
        newTopicGoals[newKey] = currentGoal;
        setGoals({ ...goals, topicGoals: newTopicGoals });
    }

    setEditingTopic(null);
  };

  const updateTopicGoal = (topicName: string, value: string) => {
    const key = `${selectedLessonId}:${topicName}`;
    const val = Number(value);
    
    const newTopicGoals = { ...goals.topicGoals };
    if (val > 0) {
        newTopicGoals[key] = val;
    } else {
        delete newTopicGoals[key];
    }
    
    // Update global state directly for topic goals to match lesson editing UX
    setGoals({ ...goals, topicGoals: newTopicGoals });
    // Update local state to keep input in sync if we switch tabs
    setLocalGoals(prev => ({ ...prev, topicGoals: newTopicGoals }));
  };

  // --- Goal Logic ---
  const handleGoalChange = (
    range: keyof Goals,
    field: 'questions',
    value: string
  ) => {
    setLocalGoals(prev => ({
      ...prev,
      [range]: {
        ...prev[range],
        [field]: Number(value) || 0
      }
    }));
  };

  const saveGoals = () => {
    setGoals(localGoals);
    // Visual feedback could be added here
    onClose();
  };


  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header & Tabs */}
        <div className="flex-shrink-0 pt-6 px-6 pb-2 bg-white sticky top-0 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-slate-800">Ayarlar</h2>
            <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:bg-slate-200 transition-colors">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('topics')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'topics' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Konu Yönetimi
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'goals' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Hedefler
            </button>
          </div>
        </div>

        {/* --- TOPICS TAB CONTENT --- */}
        {activeTab === 'topics' && (
          <>
            <div className="flex-shrink-0 p-3 bg-white border-b border-slate-50">
              <div className="grid grid-cols-3 gap-2">
                {lessons.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLessonId(l.id)}
                    className={`py-3 px-2 rounded-2xl text-[10px] font-bold transition-all border ${
                      selectedLessonId === l.id
                        ? `${l.color} text-white border-transparent shadow-sm scale-105`
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <form onSubmit={handleAddTopic} className="relative">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Yeni konu adı..."
                  className="w-full bg-slate-50 border-none rounded-2xl pl-5 pr-14 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!newTopic.trim()}
                  className="absolute right-2 top-2 bottom-2 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all disabled:opacity-30"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </form>

              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mevcut Konular ({activeLesson?.topics.length})</h3>
                <div className="grid grid-cols-1 gap-2">
                  {activeLesson?.topics.map((topic, index) => (
                    <div key={index} className="flex flex-col gap-2 p-3 bg-white border border-slate-50 rounded-2xl transition-colors group">
                      <div className="flex items-center gap-2">
                          {editingTopic?.old === topic ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                autoFocus
                                type="text"
                                value={editingTopic.new}
                                onChange={(e) => setEditingTopic({ ...editingTopic, new: e.target.value })}
                                className="flex-1 bg-slate-50 rounded-xl px-3 py-1 text-sm font-bold text-slate-800 border-none focus:ring-0"
                              />
                              <button onClick={saveTopicEdit} className="text-emerald-500 p-2"><i className="fas fa-check"></i></button>
                            </div>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                              <span className="flex-1 text-sm font-bold text-slate-700 truncate">{topic}</span>
                              <div className="flex gap-1">
                                <button onClick={() => startEditing(topic)} className="p-2 text-slate-200 active:text-indigo-500"><i className="fas fa-pen text-xs"></i></button>
                                <button onClick={() => handleDeleteTopic(topic)} className="p-2 text-slate-400 hover:text-rose-500 active:text-rose-600 transition-colors"><i className="fas fa-trash text-xs"></i></button>
                              </div>
                            </>
                          )}
                      </div>
                      
                      {/* Topic Goal Input */}
                      <div className="flex items-center gap-2 pl-3.5">
                         <i className="fas fa-bullseye text-[10px] text-indigo-300"></i>
                         <input 
                            type="number" 
                            placeholder="Hedef Belirle (Soru)"
                            className="bg-slate-50 border-none text-[10px] font-bold text-slate-600 placeholder:text-slate-300 py-1 px-2 rounded-lg w-32 focus:ring-1 focus:ring-indigo-300 outline-none"
                            value={goals.topicGoals?.[`${selectedLessonId}:${topic}`] || ''}
                            onChange={(e) => updateTopicGoal(topic, e.target.value)}
                         />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* --- GOALS TAB CONTENT --- */}
        {activeTab === 'goals' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
            <div className="space-y-6">
              {(['daily', 'weekly', 'monthly'] as const).map(range => (
                <div key={range} className="space-y-3">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <i className={`fas ${range === 'daily' ? 'fa-calendar-day' : range === 'weekly' ? 'fa-calendar-week' : 'fa-calendar-alt'} text-xs`}></i>
                      </div>
                      <h3 className="font-bold text-slate-800 capitalize">
                        {range === 'daily' ? 'Günlük' : range === 'weekly' ? 'Haftalık' : 'Aylık'} Hedef
                      </h3>
                   </div>
                   
                   <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block mb-1">Soru Hedefi</label>
                      <input 
                          type="number" 
                          value={localGoals[range].questions}
                          onChange={(e) => handleGoalChange(range, 'questions', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                   </div>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
               <button 
                 onClick={saveGoals}
                 className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-all"
               >
                 AYARLARI KAYDET
               </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SettingsModal;