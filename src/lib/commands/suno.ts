import { Command } from './types';

export const sunoCommands: Command[] = [
  {
    id: 'suno-clean-tags',
    name: 'Очистить теги',
    category: 'suno',
    description: '[Verse 1 | upbeat] → [Verse 1]',
    execute: (text) => {
      return text.replace(/\[([^\]|]+)\|[^\]]*\]/g, '[$1]');
    }
  },
  {
    id: 'suno-pad-tags',
    name: 'Отбивка тегов',
    category: 'suno',
    description: 'Добавляет пустые строки до и после тегов',
    execute: (text) => {
      return text.replace(/(\[.*?\])/g, '\n$1\n').replace(/\n{3,}/g, '\n\n');
    }
  },
  {
    id: 'suno-capitalize-lines',
    name: 'Заглавные',
    category: 'suno',
    execute: (text) => {
      return text.split('\n').map(line => {
        if (line.trim() && !line.trim().startsWith('[')) {
          return line.charAt(0).toUpperCase() + line.slice(1);
        }
        return line;
      }).join('\n');
    }
  },
  {
    id: 'suno-text-only',
    name: 'Только текст',
    category: 'suno',
    execute: (text) => text.replace(/\[.*?\]/g, '').replace(/\n{2,}/g, '\n')
  },
  {
    id: 'suno-structure-only',
    name: 'Структура',
    category: 'suno',
    description: 'Оставляет только теги',
    execute: (text) => {
      const tags = text.match(/\[.*?\]/g);
      return tags ? tags.join('\n') : '';
    }
  },
  {
    id: 'suno-smart-spacing',
    name: 'Умные пробелы',
    category: 'suno',
    execute: (text) => {
      return text.replace(/(\[.*?\]\n)([^\[][\s\S]*?)(?=\n\[|\n*$)/g, (_match, tag, content) => {
        const compactContent = content.replace(/\n+/g, '\n');
        return tag + compactContent;
      });
    }
  },
  {
    id: 'suno-caps-tags',
    name: 'CAPS теги',
    category: 'suno',
    execute: (text) => {
      return text.replace(/\[(.*?)\]/g, (_match, content) => {
        return '[' + content.toUpperCase() + ']';
      });
    }
  }
];
