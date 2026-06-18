import React from 'react';
import { Command } from '../../lib/commands/types';
import { AlertCircle } from 'lucide-react';

interface CommandButtonProps {
  command: Command;
  onClick: () => void;
}

export const CommandButton: React.FC<CommandButtonProps> = ({ command, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap
        transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
        ${command.dangerous 
          ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
          : 'glass-button text-gray-200'
        }
      `}
      title={command.description || command.name}
    >
      {command.dangerous && <AlertCircle size={12} className="text-red-400" />}
      <span className="font-medium">{command.name}</span>
    </button>
  );
};
