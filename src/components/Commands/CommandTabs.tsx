import React, { useState } from 'react';
import { BasicCommands } from './BasicCommands';
import { SunoCommands } from './SunoCommands';
import { PresetsTab } from '../Presets/PresetsTab';

interface CommandTabsProps {
  onCommand: (fn: (text: string) => string) => void;
}

export const CommandTabs: React.FC<CommandTabsProps> = ({ onCommand }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'suno' | 'presets'>('basic');

  return (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="flex px-4 pt-3 gap-2 bg-transparent">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-5 py-2 text-sm font-medium rounded-t-xl transition-all duration-300 relative ${
            activeTab === 'basic'
              ? 'text-blue-400 bg-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
          }`}
        >
          Команды
          {activeTab === 'basic' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('suno')}
          className={`px-5 py-2 text-sm font-medium rounded-t-xl transition-all duration-300 relative ${
            activeTab === 'suno'
              ? 'text-blue-400 bg-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
          }`}
        >
          Suno
          {activeTab === 'suno' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-5 py-2 text-sm font-medium rounded-t-xl transition-all duration-300 relative ${
            activeTab === 'presets'
              ? 'text-blue-400 bg-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
          }`}
        >
          Пресеты
          {activeTab === 'presets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] rounded-t-full" />}
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3 bg-white/5 backdrop-blur-md min-h-[50px] relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/10" />
        {activeTab === 'basic' && <BasicCommands onCommand={onCommand} />}
        {activeTab === 'suno' && <SunoCommands onCommand={onCommand} />}
        {activeTab === 'presets' && <PresetsTab onCommand={onCommand} />}
      </div>
    </div>
  );
};
