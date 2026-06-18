import React from 'react';
import { TerminalSquare, Music, Bookmark } from 'lucide-react';

export type BottomNavTab = 'basic' | 'suno' | 'presets';

interface BottomNavigationProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'basic', label: 'Команды', icon: TerminalSquare },
    { id: 'suno', label: 'Suno', icon: Music },
    { id: 'presets', label: 'Пресеты', icon: Bookmark }
  ] as const;

  return (
    <div className="h-16 flex items-center justify-around px-2 w-full">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
              isActive ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-500/20' : ''}`}>
              <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''} />
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
