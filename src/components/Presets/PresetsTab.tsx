import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Preset } from '../../lib/db/schema';
import { basicCommands } from '../../lib/commands/basic';
import { sunoCommands } from '../../lib/commands/suno';
import { symbolCommands } from '../../lib/commands/symbols';
import { Command } from '../../lib/commands/types';
import { Plus, Check, X, ArrowRight } from 'lucide-react';

interface Props {
  onCommand: (fn: (text: string) => string) => void;
}

const allCommandsList = [...basicCommands, ...sunoCommands, ...symbolCommands];
const allCommandsMap = allCommandsList.reduce((acc, cmd) => {
  acc[cmd.id] = cmd;
  return acc;
}, {} as Record<string, Command>);

export const PresetsTab: React.FC<Props> = ({ onCommand }) => {
  const presets = useLiveQuery(() => db.presets.filter(p => p.type === 'chain').toArray());
  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleExecute = (preset: Preset) => {
    if (!preset.commandIds || !Array.isArray(preset.commandIds)) return;
    
    const allCmds = [...basicCommands, ...sunoCommands, ...symbolCommands];
    
    onCommand((text) => {
      let result = text;
      for (const id of preset.commandIds!) {
        const cmd = allCmds.find(c => c.id === id);
        if (cmd && typeof cmd.execute === 'function') {
          result = cmd.execute(result);
        }
      }
      return result;
    });
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) return;
    const finalName = newPresetName.trim() || `Мой пресет ${presets ? presets.length + 1 : 1}`;
    await db.presets.add({
      name: finalName,
      type: 'chain',
      commandIds: selectedIds,
      createdAt: Date.now()
    });
    setIsCreating(false);
    setNewPresetName('');
    setSelectedIds([]);
  };

  const handleDelete = async (id: number) => {
    await db.presets.delete(id);
  };

  if (isCreating) {
    return (
      <div className="flex flex-col gap-3 p-2 text-sm max-h-[300px] overflow-y-auto scrollbar-hide">
        <div className="flex gap-2 items-center">
          <input
            className="flex-1 bg-white/5 border border-white/10 px-4 py-2 rounded-xl outline-none focus:border-blue-500/50 focus:bg-white/10 text-gray-200 transition-all placeholder-gray-500"
            placeholder="Название пресета..."
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
          />
          <button onClick={handleSave} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded font-medium flex items-center gap-1 transition-colors"><Check size={16}/> Сохранить</button>
          <button onClick={() => setIsCreating(false)} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded flex items-center gap-1 transition-colors"><X size={16}/> Отмена</button>
        </div>
        
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Выбранная цепочка ({selectedIds.length})</div>
          {selectedIds.length === 0 ? (
            <div className="text-gray-600 italic text-xs py-1">Кликните на команды ниже, чтобы добавить их в цепочку</div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl min-h-[48px] shadow-inner">
              {selectedIds.map((id, index) => (
                <React.Fragment key={`${id}-${index}`}>
                  <span 
                    className="px-3 py-1.5 bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded-lg text-sm cursor-pointer hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 transition-all shadow-sm"
                    onClick={() => setSelectedIds(prev => prev.filter((_, i) => i !== index))}
                    title="Удалить из цепочки"
                  >
                    {allCommandsMap[id]?.name || id}
                  </span>
                  {index < selectedIds.length - 1 && <ArrowRight size={14} className="text-gray-600"/>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-2 pb-2">
          <div>
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Базовые команды</div>
            <div className="flex flex-wrap gap-1.5">
              {basicCommands.map(cmd => (
                <button
                  key={cmd.id}
                  onClick={() => setSelectedIds(prev => [...prev, cmd.id])}
                  className="glass-button px-3 py-1.5 rounded-lg text-sm text-gray-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  + {cmd.name}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Suno команды</div>
            <div className="flex flex-wrap gap-1.5">
              {sunoCommands.map(cmd => (
                <button
                  key={cmd.id}
                  onClick={() => setSelectedIds(prev => [...prev, cmd.id])}
                  className="glass-button px-3 py-1.5 rounded-lg text-sm text-gray-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  + {cmd.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Удаление символов</div>
            <div className="flex flex-wrap gap-1">
              {symbolCommands.map(cmd => (
                <button
                  key={cmd.id}
                  onClick={() => setSelectedIds(prev => [...prev, cmd.id])}
                  title={cmd.name}
                  className="w-8 h-8 flex items-center justify-center glass-button rounded-lg text-sm text-gray-300 transform hover:scale-[1.05] active:scale-[0.95] font-mono"
                >
                  {cmd.id.replace('remove-symbol-', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 p-1">
      {presets?.length === 0 && (
        <div className="text-gray-500 text-sm py-1.5 px-2 flex items-center">У вас пока нет пресетов</div>
      )}

      {presets?.map(preset => (
        <button
          key={preset.id}
          onClick={() => handleExecute(preset)}
          className="glass-button px-4 py-2 rounded-xl text-sm font-medium text-gray-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          title={`Цепочка: ${preset.commandIds?.map(id => allCommandsMap[id]?.name).join(' → ')}`}
          onContextMenu={(e) => {
            e.preventDefault();
            if (window.confirm('Удалить этот пресет?')) {
              handleDelete(preset.id!);
            }
          }}
        >
          {preset.name}
        </button>
      ))}
      
      <button
        onClick={() => setIsCreating(true)}
        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transform hover:scale-[1.02] active:scale-[0.98]"
        title="Создать пресет"
      >
        <Plus size={16} /> Создать пресет
      </button>
    </div>
  );
};
