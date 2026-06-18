import React, { useRef } from 'react';
import { sunoCommands } from '../../lib/commands/suno';
import { CommandButton } from './CommandButton';

interface Props {
  onCommand: (fn: (text: string) => string) => void;
}

export const SunoCommands: React.FC<Props> = ({ onCommand }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div 
      ref={scrollRef}
      onWheel={handleWheel}
      className="flex flex-nowrap overflow-x-auto gap-2 pb-1 scroll-fade-x"
    >
      {sunoCommands.map(cmd => (
        <CommandButton
          key={cmd.id}
          command={cmd}
          onClick={() => onCommand(cmd.execute)}
        />
      ))}
    </div>
  );
};
