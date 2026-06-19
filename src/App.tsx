import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { useEditor } from './hooks/useEditor';
import { TextEditor } from './components/Editor/TextEditor';
import { SymbolPanel } from './components/SymbolAnalyzer/SymbolPanel';
import { SyncButton } from './components/Sync/SyncButton';
import { SyncModal } from './components/Sync/SyncModal';
import { HeaderTabs, NavTab } from './components/UI/HeaderTabs';
import { BasicCommands } from './components/Commands/BasicCommands';
import { SunoCommands } from './components/Commands/SunoCommands';
import { PresetsTab } from './components/Presets/PresetsTab';
import { EditorToolbar } from './components/Editor/EditorToolbar';
import { NotesSheet } from './components/Notes/NotesSheet';
import { useSync } from './hooks/useSync';


function App() {
  const activeEditor = useEditor();
  const [activeTab, setActiveTab] = useState<NavTab>('basic');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [toggledSymbols, setToggledSymbols] = useState<Set<string>>(new Set());

  // What to display: original text with toggled symbols removed
  const displayedText = useMemo(() => {
    let t = activeEditor.text;
    toggledSymbols.forEach(sym => {
      t = t.split(sym).join('');
    });
    return t;
  }, [activeEditor.text, toggledSymbols]);

  useEffect(() => {
    // Optional: Configure keyboard to resize body
    Keyboard.setResizeMode({ mode: KeyboardResize.Body }).catch(() => {});
  }, []);

  const lastReceivedTextRef = useRef<string | null>(null);

  const handleReceiveText = useCallback((text: string) => {
    lastReceivedTextRef.current = text;
    activeEditor.setText(text);
    setToggledSymbols(new Set()); // Remove filtering/readOnly conceptually on incoming text
  }, [activeEditor]);

  const sync = useSync(handleReceiveText);

  // Send text updates to peer, avoiding echo
  useEffect(() => {
    if (sync.status === 'connected') {
      if (activeEditor.text !== lastReceivedTextRef.current) {
        sync.sendText(activeEditor.text);
      }
      lastReceivedTextRef.current = null;
    }
  }, [activeEditor.text, sync.status, sync.sendText]);

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
              <SyncButton status={sync.status} onClick={() => setIsSyncModalOpen(true)} />
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
            onChange={(newText, start, end) => {
              if (toggledSymbols.size > 0) {
                setToggledSymbols(new Set()); // Restore normal text entry
              }
              activeEditor.setText(newText, start, end);
            }}
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

        {/* Sync Modal */}
        <SyncModal 
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          peerId={sync.peerId}
          remotePeerId={sync.remotePeerId}
          status={sync.status}
          errorMsg={sync.errorMsg}
          onConnect={sync.connectToPeer}
          onDisconnect={sync.disconnect}
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
