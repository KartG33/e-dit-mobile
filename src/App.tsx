import { useState, useCallback, useEffect, useMemo } from 'react';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { useEditor } from './hooks/useEditor';
import { TextEditor } from './components/Editor/TextEditor';
import { SymbolPanel } from './components/SymbolAnalyzer/SymbolPanel';
import { HeaderTabs, NavTab } from './components/UI/HeaderTabs';
import { BasicCommands } from './components/Commands/BasicCommands';
import { SunoCommands } from './components/Commands/SunoCommands';
import { PresetsTab } from './components/Presets/PresetsTab';
import { EditorToolbar } from './components/Editor/EditorToolbar';
import { NotesSheet } from './components/Notes/NotesSheet';


function App() {
  const activeEditor = useEditor();
  const [activeTab, setActiveTab] = useState<NavTab>('basic');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [toggledSymbols, setToggledSymbols] = useState<Set<string>>(new Set());

  const { displayedText, indexMap } = useMemo(() => {
    let t = '';
    let map: number[] = [];
    const text = activeEditor.text;
    const symbols = Array.from(toggledSymbols).sort((a, b) => b.length - a.length);
    let i = 0;
    while (i < text.length) {
      const matchedSym = symbols.find(sym => {
        if (!text.startsWith(sym, i)) return false;
        
        const char = sym[0];
        const isUniform = sym.split('').every(c => c === char);
        if (isUniform) {
          if (i > 0 && text[i - 1] === char) return false;
          if (i + sym.length < text.length && text[i + sym.length] === char) return false;
        }
        return true;
      });
      
      if (matchedSym) {
        i += matchedSym.length;
      } else {
        map.push(i);
        t += text[i];
        i++;
      }
    }
    map.push(i);
    return { displayedText: t, indexMap: map };
  }, [activeEditor.text, toggledSymbols]);

  const handleEditorChange = useCallback((newText: string, start?: number, end?: number) => {
    if (toggledSymbols.size > 0 && newText !== displayedText) {
      let prefixLen = 0;
      while (prefixLen < displayedText.length && prefixLen < newText.length && displayedText[prefixLen] === newText[prefixLen]) {
        prefixLen++;
      }
      
      let suffixLen = 0;
      while (suffixLen < displayedText.length - prefixLen && suffixLen < newText.length - prefixLen && displayedText[displayedText.length - 1 - suffixLen] === newText[newText.length - 1 - suffixLen]) {
        suffixLen++;
      }

      const insertedText = newText.substring(prefixLen, newText.length - suffixLen);
      const origStart = indexMap[prefixLen];
      let origEnd = origStart;
      
      if (prefixLen < displayedText.length - suffixLen) {
         origEnd = indexMap[displayedText.length - suffixLen - 1] + 1;
      }

      const newOrigText = activeEditor.text.substring(0, origStart) + insertedText + activeEditor.text.substring(origEnd);
      
      const mapNewToOrig = (idx: number) => {
        if (idx <= prefixLen) return indexMap[idx];
        if (idx <= prefixLen + insertedText.length) return origStart + (idx - prefixLen);
        const suffixIdx = idx - (newText.length - suffixLen);
        return indexMap[displayedText.length - suffixLen + suffixIdx];
      };

      const newStart = typeof start === 'number' ? mapNewToOrig(start) : undefined;
      const newEnd = typeof end === 'number' ? mapNewToOrig(end) : undefined;

      activeEditor.setText(newOrigText, newStart, newEnd);
    } else {
      activeEditor.setText(newText, start, end);
    }
  }, [activeEditor, toggledSymbols, displayedText, indexMap]);

  useEffect(() => {
    // Optional: Configure keyboard to resize body
    Keyboard.setResizeMode({ mode: KeyboardResize.Body }).catch(() => {});
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col text-white font-sans bg-[#0a0d14] overflow-hidden">
        {/* Unified Sticky Top Section: Header -> Tabs -> Actions -> Symbols */}
        <div className="flex flex-col z-20 shadow-lg bg-[#0a0d14] shrink-0">
          <header className="flex items-center justify-between px-4 py-3 glass-panel border-b border-white/5">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">E-dit</h1>
            <div className="flex items-center gap-3">
              <div className="text-gray-400 text-[12px] font-medium bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5 shadow-inner">
                <span className="text-blue-400">{activeEditor.stats.chars}</span> симв.
              </div>
            </div>
          </header>

          {/* Navigation Tabs (Row 2) */}
          <HeaderTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Action Commands Row */}
          <div className="w-full border-b border-white/5 bg-white/[0.02]">
            <div className="flex overflow-x-auto scroll-fade-x px-4 py-2.5 items-center gap-2 scrollbar-hide">
              {activeTab === 'basic' && <BasicCommands onCommand={activeEditor.applyCommand} />}
              {activeTab === 'suno' && <SunoCommands onCommand={activeEditor.applyCommand} />}
              {activeTab === 'presets' && <PresetsTab onCommand={activeEditor.applyCommand} />}
            </div>
          </div>

          {/* Symbol Analyzer above text */}
          <SymbolPanel 
            text={activeEditor.text} 
            toggledSymbols={toggledSymbols}
            onToggleSymbol={(sym) => {
              setToggledSymbols(prev => {
                const next = new Set(prev);
                if (next.has(sym)) next.delete(sym);
                else next.add(sym);
                return next;
              });
            }}
          />
        </div>

        {/* Mobile Main Editor */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <TextEditor
            editorRef={activeEditor.textareaRef}
            value={displayedText}
            onChange={handleEditorChange}
            placeholder="Введите или вставьте текст..."
            className="pb-24" 
          />
        </div>

        {/* Fixed Bottom Toolbar */}
        <EditorToolbar
          onUndo={activeEditor.undo}
          onRedo={activeEditor.redo}
          canUndo={activeEditor.canUndo}
          canRedo={activeEditor.canRedo}
          onClear={activeEditor.clear}
          onNotesClick={() => setIsNotesOpen(true)}
          text={activeEditor.text}
          onCommand={activeEditor.applyCommand}
          onPaste={activeEditor.pasteAtCursor}
        />

        {/* Notes Sheet */}
        <NotesSheet 
          isOpen={isNotesOpen} 
          onClose={() => setIsNotesOpen(false)} 
        />
    </div>
  );
}

export default App;
