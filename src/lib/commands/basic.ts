import { Command } from './types';

export const basicCommands: Command[] = [
  {
    id: 'remove-extra-spaces',
    name: 'Лишние пробелы',
    category: 'basic',
    description: 'Заменяет множественные пробелы и табы на один пробел',
    execute: (text) => text.replace(/[ \t]{2,}/g, ' ')
  },
  {
    id: 'replace-nbsp',
    name: 'NBSP',
    category: 'basic',
    description: 'Заменяет неразрывные пробелы (\\u00A0) на обычные',
    execute: (text) => text.replace(/\u00A0/g, ' ')
  },
  {
    id: 'trim-lines',
    name: 'Обрезать края',
    category: 'basic',
    description: 'Удаляет пробелы в начале и конце каждой строки',
    execute: (text) => text.split('\n').map(line => line.trim()).join('\n')
  },
  {
    id: 'to-uppercase',
    name: 'ВЕРХНИЙ',
    category: 'basic',
    execute: (text) => text.toUpperCase()
  },
  {
    id: 'to-lowercase',
    name: 'нижний',
    category: 'basic',
    execute: (text) => text.toLowerCase()
  },
  {
    id: 'to-title-case',
    name: 'Каждое Слово',
    category: 'basic',
    execute: (text) => text.replace(/\b\w/g, char => char.toUpperCase())
  },
  {
    id: 'to-sentence-case',
    name: 'Предложения',
    category: 'basic',
    description: 'Заглавная буква в начале предложений',
    execute: (text) => {
      return text.replace(/(^\s*\w|[.!?]\s+\w)/g, match => match.toUpperCase());
    }
  },
  {
    id: 'remove-space-before-punctuation',
    name: 'К знакам',
    category: 'basic',
    execute: (text) => text.replace(/\s+([.,;:!?])/g, '$1')
  },
  {
    id: 'add-space-after-punctuation',
    name: 'От знаков',
    category: 'basic',
    execute: (text) => text.replace(/([.,;:!?])(\S)/g, '$1 $2')
  },
  {
    id: 'remove-punctuation',
    name: 'Без пунктуации',
    category: 'basic',
    dangerous: true,
    execute: (text) => text.replace(/[.,;:!?'"«»()[\]{}\-—–]/g, '')
  },
  {
    id: 'remove-brackets-content',
    name: 'Без скобок',
    category: 'basic',
    dangerous: true,
    execute: (text) => text.replace(/\([^)]*\)|\[[^\]]*\]/g, '')
  },
  {
    id: 'remove-empty-lines',
    name: 'Без пустых строк',
    category: 'basic',
    execute: (text) => text.replace(/\n\s*\n\s*\n/g, '\n\n')
  },
  {
    id: 'join-to-one-line',
    name: 'В одну строку',
    category: 'basic',
    execute: (text) => text.replace(/\n+/g, ' ')
  },
  {
    id: 'sentence-per-line',
    name: 'По предложениям',
    category: 'basic',
    execute: (text) => text.replace(/([.!?])\s+/g, '$1\n')
  },
  {
    id: 'remove-numbering',
    name: 'Без нумерации',
    category: 'basic',
    execute: (text) => text.replace(/^\s*\d+[.)]\s*/gm, '')
  }
];
