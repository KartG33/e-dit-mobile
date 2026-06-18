import React from 'react';

interface EditorStatsProps {
  stats: {
    chars: number;
    charsNoSpaces: number;
    words: number;
    sentences: number;
    paragraphs: number;
    lines: number;
  };
}

export const EditorStats: React.FC<EditorStatsProps> = ({ stats }) => {
  return (
    <div className="flex flex-wrap gap-4 text-sm text-gray-400 px-4 py-2 bg-secondary border-t border-gray-700">
      <span>Символов: <strong className="text-white">{stats.chars}</strong></span>
      <span>Без пробелов: <strong className="text-white">{stats.charsNoSpaces}</strong></span>
      <span>Слов: <strong className="text-white">{stats.words}</strong></span>
      <span>Предложений: <strong className="text-white">{stats.sentences}</strong></span>
      <span>Абзацев: <strong className="text-white">{stats.paragraphs}</strong></span>
      <span>Строк: <strong className="text-white">{stats.lines}</strong></span>
    </div>
  );
};
