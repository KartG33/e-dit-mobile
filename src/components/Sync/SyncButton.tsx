import React from 'react';
import { Smartphone, RefreshCw } from 'lucide-react';
import { SyncStatus } from '../../hooks/useSync';

interface SyncButtonProps {
  status: SyncStatus;
  onClick: () => void;
}

export const SyncButton: React.FC<SyncButtonProps> = ({ status, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm
        ${status === 'connected' 
          ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30' 
          : status === 'connecting'
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
          : 'glass-button text-gray-300 hover:text-white'
        }
      `}
      title="Синхронизация с телефоном"
    >
      {status === 'connecting' ? <RefreshCw size={16} className="animate-spin" /> : <Smartphone size={16} />}
      <span className="text-sm font-medium">
        {status === 'connected' ? 'Синхронизировано' : status === 'connecting' ? 'Подключение...' : 'Синхронизация'}
      </span>
    </button>
  );
};
