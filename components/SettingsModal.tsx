
import React, { useState } from 'react';
import { Lesson } from '../types';

interface SettingsModalProps {
  lessons: Lesson[];
  setLessons: (lessons: Lesson[]) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ lessons, setLessons, onClose }) => {
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id || '');
  const [newTopic, setNewTopic] = useState('');
  const [editingTopic, setEditingTopic] = useState<{ old: string, new: string } | null>(null);

  const activeLesson = lessons.find(l => l.id === selectedLessonId);

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
    if (!confirm(`"${topicToDelete}" konusunu silmek istediğinize emin misiniz?`)) return;

    const updatedLessons = lessons.map(l => {
      if (l.id === selectedLessonId) {
        return { ...l, topics: l.topics.filter(t => t !== topicToDelete) };
      }
      return l;
    });
    setLessons(updatedLessons);
  };

  const startEditing = (topic: string) => {
    setEditingTopic({ old: topic, new: topic });
  };

  const saveEdit = () => {
    if (!editingTopic || !editingTopic.new.trim() || !activeLesson) return;

    const updatedLessons = lessons.map(l => {
      if (l.id === selectedLessonId) {
        const newTopics = l.topics.map(t => t === editingTopic.old ? editingTopic.new.trim() : t);
        return { ...l, topics: newTopics };
      }
      return l;
    });

    setLessons(updatedLessons);
    setEditingTopic(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            Konu Yönetimi
          </h2>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:bg-slate-200 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Lesson Selector - Fixed Grid */}
        <div className="flex-shrink-0 p-3 bg-slate-50 border-b border-slate-100">
          <div className="grid grid-cols-3 gap-2">
            {lessons.map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLessonId(l.id)}
                className={`py-3 px-2 rounded-2xl text-[10px] font-bold transition-all border ${
                  selectedLessonId === l.id
                    ? `${l.color} text-white border-transparent shadow-sm scale-105`
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add New Topic */}
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

          {/* Topic List */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mevcut Konular ({activeLesson?.topics.length})</h3>
            <div className="grid grid-cols-1 gap-2">
              {activeLesson?.topics.map((topic, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-white border border-slate-50 rounded-2xl active:bg-slate-50 transition-colors group">
                  {editingTopic?.old === topic ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editingTopic.new}
                        onChange={(e) => setEditingTopic({ ...editingTopic, new: e.target.value })}
                        className="flex-1 bg-slate-50 rounded-xl px-3 py-1 text-sm font-bold text-slate-800 border-none focus:ring-0"
                      />
                      <button onClick={saveEdit} className="text-emerald-500 p-2"><i className="fas fa-check"></i></button>
                    </div>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                      <span className="flex-1 text-sm font-bold text-slate-700 truncate">{topic}</span>
                      <div className="flex gap-1">
                        <button onClick={() => startEditing(topic)} className="p-2 text-slate-200 active:text-indigo-500"><i className="fas fa-pen text-xs"></i></button>
                        <button onClick={() => handleDeleteTopic(topic)} className="p-2 text-slate-200 active:text-rose-500"><i className="fas fa-trash text-xs"></i></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
