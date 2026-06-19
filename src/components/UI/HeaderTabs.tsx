import React from 'react';

export type NavTab = 'basic' | 'suno' | 'presets';

interface HeaderTabsProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const HeaderTabs: React.FC<HeaderTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'basic', label: 'Команды' },
    { id: 'suno', label: 'Suno' },
    { id: 'presets', label: 'Пресеты' }
  ] as const;

  return (
    <div className="flex items-center justify-start gap-2 px-4 py-2 w-full overflow-x-auto scrollbar-hide shrink-0 border-b border-white/5 bg-[#0a0d14]/90 backdrop-blur-md z-20">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              isActive 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
