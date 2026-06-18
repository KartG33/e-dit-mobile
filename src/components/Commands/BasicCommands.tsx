import React, { useRef } from 'react';
import { basicCommands } from '../../lib/commands/basic';
import { CommandButton } from './CommandButton';

interface BasicCommandsProps {
  onCommand: (fn: (text: string) => string) => void;
}

export const BasicCommands: React.FC<BasicCommandsProps> = ({ onCommand }) => {
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
      className="flex flex-nowrap overflow-x-auto gap-2 pb-1 scrollbar-hide"
    >
      {basicCommands.map(cmd => (
        <CommandButton
          key={cmd.id}
          command={cmd}
          onClick={() => onCommand(cmd.execute)}
        />
      ))}
    </div>
  );
};
