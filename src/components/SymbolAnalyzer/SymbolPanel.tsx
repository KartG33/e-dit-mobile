import React, { useMemo, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

interface Props { 
  text: string;
  onRemoveSymbol?: (symbol: string) => void;
}

export const SymbolPanel: React.FC<Props> = ({ text, onRemoveSymbol }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const debouncedText = useDebounce(text, 300);

  const symbols = useMemo(() => {
    if (!debouncedText) return [];
    const counts: Record<string, number> = {};
    let remainingText = debouncedText;

    const numberedListMatches = remainingText.match(/(?:^|\n)\s*\d+\./g);
    if (numberedListMatches) {
      counts['1.'] = numberedListMatches.length;
      remainingText = remainingText.replace(/(?:^|\n)\s*\d+\./g, '');
    }

    const multiTokens = ['---', '...', '```', '=='];
    for (const token of multiTokens) {
      const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapeRegex(token), 'g');
      const matches = remainingText.match(regex);
      if (matches) {
        counts[token] = matches.length;
        remainingText = remainingText.replace(regex, '');
      }
    }

    const symbolRegex = /[_\-+\>~`!@#$%^&*()[\]{}|\\:;"'<>,.?/]/g;
    const matches = remainingText.match(symbolRegex);
    if (matches) {
      for (const char of matches) {
        counts[char] = (counts[char] || 0) + 1;
      }
    }

    return Object.entries(counts)
      .map(([symbol, count]) => ({ symbol, count }))
      .sort((a, b) => b.count - a.count);
  }, [debouncedText]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  if (symbols.length === 0) return null;

  return (
    <div className="border-b border-white/5 bg-white/[0.03] backdrop-blur-sm flex items-center p-2.5 gap-4 shrink-0 shadow-sm relative z-10 overflow-x-auto whitespace-nowrap scroll-fade-x">
      
      <div 
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex gap-2 flex-nowrap shrink-0"
      >
        {symbols.map(({ symbol, count }) => (
          <button
            key={symbol}
            onClick={() => onRemoveSymbol?.(symbol)}
            className="flex items-center gap-2 px-3 py-1.5 glass-button rounded-lg text-xs text-blue-200 whitespace-nowrap shrink-0 hover:bg-red-500/20 hover:text-red-300 transition-colors"
            title="Удалить символ"
          >
            <span className="font-mono font-medium">{symbol}</span>
            <span className="bg-black/30 text-blue-300/70 px-1.5 py-0.5 rounded text-[10px] shadow-inner">{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
