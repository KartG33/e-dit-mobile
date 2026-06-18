import React from 'react';
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
  isKeyboardOpen
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col pointer-events-none">
      
      {/* Top Layer: Floating Actions */}
      <div className="flex justify-center w-full mb-3 pointer-events-auto">
        <EditorToolbar
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onClear={onClear}
          text={text}
          className=""
        />
      </div>

      {/* Container for Commands and Nav - Hidden when keyboard is open */}
      {!isKeyboardOpen && (
        <div className="bg-[#0a0d14]/90 backdrop-blur-xl border-t border-white/10 pointer-events-auto pb-safe">
          
          {/* Middle Layer: Scrollable Commands Strip */}
          <div className="w-full border-b border-white/5 bg-white/[0.02]">
            <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 items-center gap-2">
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
