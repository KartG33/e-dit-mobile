import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { db } from '../../lib/db/schema';
import { useLiveQuery } from 'dexie-react-hooks';

interface NotesSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotesSheet: React.FC<NotesSheetProps> = ({ isOpen, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Always query the single "Заметки" note (id=1 for simplicity)
  const notes = useLiveQuery(() => db.notes.where('title').equals('Заметки').toArray());
  const scratchpad = notes && notes.length > 0 ? notes[0] : null;

  const [content, setContent] = useState('');

  // Update local state when db loads
  useEffect(() => {
    if (scratchpad) {
      setContent(scratchpad.content);
    }
  }, [scratchpad]);

  const saveNote = useCallback((newContent: string) => {
    setContent(newContent);
    if (scratchpad?.id) {
      db.notes.update(scratchpad.id, { content: newContent, updatedAt: Date.now() });
    } else {
      db.notes.add({ title: 'Заметки', content: newContent, createdAt: Date.now(), updatedAt: Date.now() });
    }
  }, [scratchpad]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
    >
      <div 
        ref={containerRef}
        className="w-full max-h-[80vh] flex flex-col bg-[#0f1219] rounded-t-2xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-slide-up"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Заметки</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto pb-safe">
          <textarea 
            className="w-full h-[300px] sm:h-[400px] bg-transparent border-none outline-none resize-none text-gray-200 placeholder:text-gray-500 font-sans text-sm"
            placeholder="Ваши заметки..."
            spellCheck={false}
            value={content}
            onChange={(e) => saveNote(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
