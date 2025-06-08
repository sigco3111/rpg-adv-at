import React, { useEffect, useRef } from 'react';
import { GameLogEntry } from '../types';

interface GameLogPanelProps {
  logEntries: GameLogEntry[];
}

export const GameLogPanel: React.FC<GameLogPanelProps> = ({ logEntries }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logEntries]);

  const getEntryStyle = (type: GameLogEntry['type']): string => {
    switch (type) {
      case 'narration': return 'text-gray-300 italic';
      case 'dialogue': return 'text-amber-300';
      case 'event': return 'text-sky-300';
      case 'reward': return 'text-green-400 font-semibold';
      case 'error': return 'text-red-400 font-bold';
      case 'location': return 'text-purple-300 font-semibold';
      case 'system': return 'text-slate-400 text-xs';
      case 'combat': return 'text-orange-300';
      default: return 'text-gray-200';
    }
  };

  return (
    <div className="bg-slate-800 p-3 rounded-lg shadow-md h-full flex flex-col">
      <h3 className="text-base font-bold text-center text-sky-400 mb-2 border-b border-slate-700 pb-1.5">
        게임 로그
      </h3>
      <div className="flex-grow overflow-y-auto space-y-1.5 pr-1 text-xs sm:text-sm">
        {logEntries.length === 0 && (
          <p className="text-slate-400 text-center italic py-4">모험을 시작하세요...</p>
        )}
        {logEntries.map((entry) => (
          <div key={entry.id} className={`p-1.5 rounded ${getEntryStyle(entry.type)} bg-slate-700/40`}>
            {entry.type === 'dialogue' && entry.speaker && (
              <span className="font-bold text-amber-200">{entry.speaker}: </span>
            )}
            {entry.message}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};