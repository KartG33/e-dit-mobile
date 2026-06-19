import { useState, useCallback, useRef } from 'react';

interface EditorState {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}

export function useEditor(initialValue = '') {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: { text: initialValue, selectionStart: 0, selectionEnd: 0 },
    future: []
  });

  const maxHistorySize = 100;

  const setText = useCallback((newText: string, selectionStart?: number, selectionEnd?: number) => {
    setHistory(prev => {
      // Don't push to history if text hasn't changed (e.g. just cursor movement)
      if (prev.present.text === newText) {
        return {
          ...prev,
          present: {
            text: newText,
            selectionStart: selectionStart ?? prev.present.selectionStart,
            selectionEnd: selectionEnd ?? prev.present.selectionEnd
          }
        };
      }

      return {
        past: [...prev.past.slice(-maxHistorySize + 1), prev.present],
        present: {
          text: newText,
          selectionStart: selectionStart ?? newText.length,
          selectionEnd: selectionEnd ?? newText.length
        },
        future: []
      };
    });
  }, []);

  const restoreCursor = (state: EditorState) => {
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(state.selectionStart, state.selectionEnd);
      }
    }, 0);
  };

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      
      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);
      
      restoreCursor(previous);

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
      
      restoreCursor(next);

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  const applyCommand = useCallback((commandFn: (text: string) => string) => {
    setText(commandFn(history.present.text));
  }, [history.present.text, setText]);

  const pasteAtCursor = useCallback((clipText: string) => {
    const el = textareaRef.current;
    if (!el) {
      // Fallback: append
      setText(history.present.text + clipText);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const currentText = history.present.text;
    const newText = currentText.substring(0, start) + clipText + currentText.substring(end);
    
    // Calculate new cursor position after inserted text
    const newCursorPos = start + clipText.length;
    setText(newText, newCursorPos, newCursorPos);
    
    // Update real DOM cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [history.present.text, setText]);

  const stats = {
    chars: history.present.text.length,
    charsNoSpaces: history.present.text.replace(/\s/g, '').length,
    words: history.present.text.trim() ? history.present.text.trim().split(/\s+/).length : 0,
    sentences: (history.present.text.match(/[.!?]+/g) || []).length,
    paragraphs: history.present.text.split(/\n\s*\n/).filter(p => p.trim()).length,
    lines: history.present.text.split('\n').length
  };

  return {
    textareaRef,
    text: history.present.text,
    setText,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    applyCommand,
    pasteAtCursor,
    stats,
    clear: () => setText('')
  };
}
