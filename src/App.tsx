import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { useEditor } from './hooks/useEditor';
import { TextEditor } from './components/Editor/TextEditor';
import { SymbolPanel } from './components/SymbolAnalyzer/SymbolPanel';
import { SyncButton } from './components/Sync/SyncButton';
import { SyncModal } from './components/Sync/SyncModal';
import { BottomNavTab } from './components/UI/BottomNavigation';
import { MobileCommandBar } from './components/UI/MobileCommandBar';
import { useSync } from './hooks/useSync';


function App() {
  const activeEditor = useEditor();
  const [activeTab, setActiveTab] = useState<BottomNavTab>('basic');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  // Real measured height of MobileCommandBar, so the editor reserves exactly
  // enough space and never shows a dead gap or gets covered by the bar.
  const [commandBarHeight, setCommandBarHeight] = useState(0);
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
    Keyboard.addListener('keyboardWillShow', () => {
      setIsKeyboardOpen(true);
    });
    Keyboard.addListener('keyboardWillHide', () => {
      setIsKeyboardOpen(false);
    });
    
    // Optional: Configure keyboard to resize body
    Keyboard.setResizeMode({ mode: KeyboardResize.Body }).catch(() => {});

    return () => {
      Keyboard.removeAllListeners();
    };
  }, []);

  const lastReceivedTextRef = useRef<string | null>(null);

  const handleReceiveText = useCallback((text: string) => {
    lastReceivedTextRef.current = text;
    activeEditor.setText(text);
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
        {/* Mobile Header */}
        <header className="flex items-center justify-between px-4 py-3 glass-panel border-b border-white/5 z-20 shadow-lg shrink-0">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">E-dit</h1>
          <div className="flex items-center gap-3">
            <div className="text-gray-400 text-xs font-medium bg-white/5 px-2 py-1 rounded-md border border-white/5 shadow-inner">
              <span className="text-blue-400">{activeEditor.stats.chars}</span> симв.
            </div>
            <SyncButton status={sync.status} onClick={() => setIsSyncModalOpen(true)} />
          </div>
        </header>

        {/* Mobile Main Editor */}
        <div className="flex-1 flex flex-col min-w-0 relative">
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
          
          <TextEditor
            value={displayedText}
            onChange={(newText) => {
              if (toggledSymbols.size === 0) {
                activeEditor.setText(newText);
              }
            }}
            readOnly={toggledSymbols.size > 0}
            placeholder="Введите или вставьте текст..."
            style={{ paddingBottom: isKeyboardOpen ? 0 : commandBarHeight }}
          />
        </div>

        {/* Unified Mobile Command Bar */}
        <MobileCommandBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCommand={activeEditor.applyCommand}
          onUndo={activeEditor.undo}
          onRedo={activeEditor.redo}
          canUndo={activeEditor.canUndo}
          canRedo={activeEditor.canRedo}
          onClear={activeEditor.clear}
          text={activeEditor.text}
          isKeyboardOpen={isKeyboardOpen}
          onHeightChange={setCommandBarHeight}
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
    </div>
  );
}

export default App;
