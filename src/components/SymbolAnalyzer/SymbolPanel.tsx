import React, { useRef, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

interface Props { 
  text: string;
  toggledSymbols: Set<string>;
  onToggleSymbol: (symbol: string) => void;
}

export const SymbolPanel: React.FC<Props> = ({ text, toggledSymbols, onToggleSymbol }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const debouncedText = useDebounce(text, 300);
  
  const symbolsList = React.useMemo(() => {
    if (!debouncedText) return [];
  
    const newSymbols = new Set<string>();
    let remainingText = debouncedText;

    const numberedListMatches = remainingText.match(/(?:^|\n)\s*\d+\./g);
    if (numberedListMatches) {
      newSymbols.add('1.');
      remainingText = remainingText.replace(/(?:^|\n)\s*\d+\./g, '');
    }

    const symbolRegex = /([_\-+\>~`!@#$%^&*()[\]{}|\\:;"'<>,.?/=])\1*/g;
    const matches = remainingText.match(symbolRegex);
    if (matches) {
      for (const token of matches) {
        newSymbols.add(token);
      }
    }
    
    return Array.from(newSymbols);
  }, [debouncedText]);

  useEffect(() => {
    toggledSymbols.forEach(sym => {
      if (!symbolsList.includes(sym)) {
        onToggleSymbol(sym);
      }
    });
  }, [symbolsList, toggledSymbols, onToggleSymbol]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  if (symbolsList.length === 0) return null;

  return (
    <div className="border-b border-white/5 bg-white/[0.03] backdrop-blur-sm flex items-center p-2.5 gap-4 shrink-0 shadow-sm relative z-10 overflow-x-auto scrollbar-hide whitespace-nowrap scroll-fade-x">
      <div 
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex gap-2 flex-nowrap shrink-0"
      >
        {symbolsList.map((symbol) => {
          const isToggled = toggledSymbols.has(symbol);
          return (
            <button
              key={symbol}
              onClick={() => onToggleSymbol(symbol)}
              className={`flex items-center gap-2 px-3 py-1.5 glass-button rounded-lg text-sm whitespace-nowrap shrink-0 transition-colors ${
                isToggled 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
              title={isToggled ? "Вернуть символ" : "Удалить символ"}
            >
              <span className="font-mono font-medium">{symbol}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
