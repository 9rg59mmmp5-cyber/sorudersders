
import React, { useState, useEffect } from 'react';
import { Lesson, StudyLog } from '../types';

interface LogFormProps {
  lessons: Lesson[];
  onAdd: (log: Omit<StudyLog, 'id'>) => void;
  onClose: () => void;
}

const LogForm: React.FC<LogFormProps> = ({ lessons, onAdd, onClose }) => {
  if (lessons.length === 0) return null;

  const [lessonId, setLessonId] = useState(lessons[0].id);
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Changed to string to allow empty input without forcing '0'
  const [duration, setDuration] = useState<string>('60');
  const [questions, setQuestions] = useState<string>('');

  const selectedLesson = lessons.find(l => l.id === lessonId);

  useEffect(() => {
    if (selectedLesson && selectedLesson.topics.length > 0) {
      if (!selectedLesson.topics.includes(topic)) {
        setTopic(selectedLesson.topics[0]);
      }
    }
  }, [lessonId, selectedLesson]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    onAdd({ 
      date, 
      lessonId, 
      topic, 
      duration: Number(duration) || 0, 
      questionsSolved: Number(questions) || 0 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] animate-in fade-in duration-200">
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in slide-in-from-bottom-20 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Çalışma Ekle</h2>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:bg-slate-200 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pb-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Ders Seçimi</label>
            <div className="grid grid-cols-3 gap-2">
              {lessons.map(l => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLessonId(l.id)}
                  className={`py-3 px-2 rounded-2xl text-[10px] font-bold transition-all border ${
                    lessonId === l.id 
                    ? `${l.color} text-white border-transparent shadow-md scale-105` 
                    : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Konu</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
            >
              {selectedLesson?.topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Soru Sayısı</label>
              <input
                type="number"
                inputMode="numeric"
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-300"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Dakika</label>
              <input
                type="number"
                inputMode="numeric"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tarih</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-indigo-100 active:scale-95 transition-all mt-4"
          >
            KAYDET
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogForm;
