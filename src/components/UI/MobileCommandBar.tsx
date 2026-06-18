import React, { useEffect, useRef } from 'react';
import { EditorToolbar } from '../Editor/EditorToolbar';
import { BasicCommands } from '../Commands/BasicCommands';
import { SunoCommands } from '../Commands/SunoCommands';
import { PresetsTab } from '../Presets/PresetsTab';
import { BottomNavigation, BottomNavTab } from './BottomNavigation';

interface MobileCommandBarProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  onCommand: (fn: (text: string) => string) => void;
  // Toolbar props
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
  text: string;
  isKeyboardOpen?: boolean;
  // Reports the bar's real rendered height in px, so parents can reserve
  // exactly that much space instead of guessing with a fixed number.
  onHeightChange?: (height: number) => void;
}

export const MobileCommandBar: React.FC<MobileCommandBarProps> = ({
  activeTab,
  onTabChange,
  onCommand,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClear,
  text,
  isKeyboardOpen,
  onHeightChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !onHeightChange) return;

    // Report height whenever it changes: different tabs (Basic/Suno/Presets)
    // can wrap to different numbers of rows, and the keyboard toggling
    // hides/shows the bottom section entirely.
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        onHeightChange(entry.contentRect.height);
      }
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <div ref={containerRef} className="fixed bottom-0 left-0 right-0 z-30 flex flex-col pointer-events-none">
      
      {/* Top Layer: Floating Actions */}
      <div className="flex justify-center w-full mb-3 pointer-events-auto">
        <EditorToolbar
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onClear={onClear}
          text={text}
          onCommand={onCommand}
          className=""
        />
      </div>

      {/* Container for Commands and Nav - Hidden when keyboard is open */}
      {!isKeyboardOpen && (
        <div className="bg-[#0a0d14]/90 backdrop-blur-xl border-t border-white/10 pointer-events-auto pb-safe">
          
          {/* Middle Layer: Scrollable Commands Strip */}
          <div className="w-full border-b border-white/5 bg-white/[0.02]">
            <div className="flex overflow-x-auto scroll-fade-x px-2 py-2 items-center gap-2">
              {activeTab === 'basic' && <BasicCommands onCommand={onCommand} />}
              {activeTab === 'suno' && <SunoCommands onCommand={onCommand} />}
              {activeTab === 'presets' && <PresetsTab onCommand={onCommand} />}
            </div>
          </div>

          {/* Bottom Layer: Navigation Tabs */}
          <BottomNavigation activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      )}
    </div>
  );
};
