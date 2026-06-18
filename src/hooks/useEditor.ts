import { useState, useCallback } from 'react';

interface HistoryState {
  past: string[];
  present: string;
  future: string[];
}

export function useEditor(initialValue = '') {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialValue,
    future: []
  });

  const maxHistorySize = 100;

  const setText = useCallback((newText: string) => {
    setHistory(prev => ({
      past: [...prev.past.slice(-maxHistorySize + 1), prev.present],
      present: newText,
      future: []
    }));
  }, []);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);
      
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      
      const next = prev.future[0];
      const newFuture = prev.future.slice(1);
      
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  const applyCommand = useCallback((commandFn: (text: string) => string) => {
    setText(commandFn(history.present));
  }, [history.present, setText]);

  const stats = {
    chars: history.present.length,
    charsNoSpaces: history.present.replace(/\s/g, '').length,
    words: history.present.trim() ? history.present.trim().split(/\s+/).length : 0,
    sentences: (history.present.match(/[.!?]+/g) || []).length,
    paragraphs: history.present.split(/\n\s*\n/).filter(p => p.trim()).length,
    lines: history.present.split('\n').length
  };

  return {
    text: history.present,
    setText,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    applyCommand,
    stats,
    clear: () => setText('')
  };
}
