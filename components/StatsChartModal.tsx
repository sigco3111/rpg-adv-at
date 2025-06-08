import React from 'react';
import { PlayerState, StatChartData } from '../types';
import { MAX_STAT_VALUE_FOR_CHART } from '../constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatsChartModalProps {
  player: PlayerState;
  onClose: () => void;
}

export const StatsChartModal: React.FC<StatsChartModalProps> = ({ player, onClose }) => {
  const data: StatChartData[] = [
    { subject: '공격력', value: player.attack, fullMark: MAX_STAT_VALUE_FOR_CHART },
    { subject: '방어력', value: player.defense, fullMark: MAX_STAT_VALUE_FOR_CHART },
    { subject: '속도', value: player.speed, fullMark: MAX_STAT_VALUE_FOR_CHART },
    { subject: 'HP', value: player.maxHp, fullMark: Math.max(player.maxHp, MAX_STAT_VALUE_FOR_CHART) }, // HP might exceed default fullMark
    { subject: 'MP', value: player.maxMp, fullMark: Math.max(player.maxMp, MAX_STAT_VALUE_FOR_CHART) }, // MP might exceed default fullMark
    { subject: '행운', value: player.luck, fullMark: MAX_STAT_VALUE_FOR_CHART },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content w-full max-w-lg text-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-sky-400">캐릭터 능력치 프로필</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 10']} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name={player.name} dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.6} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.25rem' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <button 
          onClick={onClose} 
          className="mt-8 w-full px-4 py-2.5 bg-sky-700 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md transition duration-150"
        >
          차트 닫기
        </button>
      </div>
    </div>
  );
};