import React from 'react';

interface TextEditorProps {
  value: string;
  onChange: (value: string, start?: number, end?: number) => void;
  placeholder?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  editorRef?: React.RefObject<HTMLTextAreaElement>;
}

export const TextEditor: React.FC<TextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Введите текст...',
  isActive = true,
  onClick,
  className = '',
  style,
  editorRef
}) => {

  return (
    <div 
      className={`flex-1 flex flex-col w-full h-full cursor-text ${isActive ? '' : 'opacity-90 grayscale-[20%]'} ${className}`} 
      onClick={() => onClick && onClick()}
    >
      <textarea
        ref={editorRef}
        value={value}
        onChange={(e) => onChange(e.target.value, e.target.selectionStart, e.target.selectionEnd)}
        onSelect={(e) => {
          // Track cursor without changing text
          const target = e.target as HTMLTextAreaElement;
          onChange(value, target.selectionStart, target.selectionEnd);
        }}
        placeholder={placeholder}
        style={style}
        className={`w-full h-full p-6 text-gray-100 border-none outline-none resize-none font-mono text-base leading-relaxed placeholder:text-gray-500/50 ${isActive ? 'bg-black/40' : 'bg-black/20'}`}
        spellCheck={false}
      />
    </div>
  );
};
