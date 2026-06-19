import React from 'react';
import { Undo, Redo, Trash2, Copy, ClipboardPaste, BookOpen } from 'lucide-react';

interface EditorToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
  onNotesClick: () => void;
  text: string;
  onCommand?: (fn: (text: string) => string) => void;
  onPaste?: (text: string) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClear,
  onNotesClick,
  text,
  onPaste
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText || !onPaste) return;
      onPaste(clipText);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const handleNotes = () => {
    onNotesClick();
  };

  // min-h-[44px] min-w-[44px] is Apple HIG standard for touch targets
  const btnClass = "flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-xl transition-all duration-200 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-gray-300";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-2 p-2 bg-[#0a0d14]/90 backdrop-blur-xl border-t border-white/10 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
      
      {/* Group 1: History */}
      <div className="flex items-center gap-1">
        <button onClick={onUndo} disabled={!canUndo} className={btnClass} title="Отменить">
          <Undo size={20} />
          <span className="text-[10px] font-medium leading-none">Назад</span>
        </button>
        <button onClick={onRedo} disabled={!canRedo} className={btnClass} title="Повторить">
          <Redo size={20} />
          <span className="text-[10px] font-medium leading-none">Вперёд</span>
        </button>
      </div>

      <div className="w-px h-8 bg-white/10 mx-1" />

      {/* Group 2: Clipboard */}
      <div className="flex items-center gap-1">
        <button onClick={handlePaste} className={btnClass} title="Вставить">
          <ClipboardPaste size={20} />
          <span className="text-[10px] font-medium leading-none">Вставить</span>
        </button>
        <button onClick={handleCopy} className={btnClass} title="Копировать">
          <Copy size={20} />
          <span className="text-[10px] font-medium leading-none">Копия</span>
        </button>
      </div>

      <div className="w-px h-8 bg-white/10 mx-1" />

      {/* Group 3: Actions */}
      <div className="flex items-center gap-1">
        <button onClick={onClear} className="flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-xl transition-all duration-200 hover:bg-red-500/20 text-[#ff6b6b]" title="Очистить всё">
          <Trash2 size={20} />
          <span className="text-[10px] font-medium leading-none">Стереть</span>
        </button>
        <button onClick={handleNotes} className={btnClass} title="Заметки">
          <BookOpen size={20} />
          <span className="text-[10px] font-medium leading-none">Заметки</span>
        </button>
      </div>

    </div>
  );
};
