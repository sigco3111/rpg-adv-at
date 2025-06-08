import React from 'react';
import { PlayerState } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { getSkillDefinition } from '../constants'; // Import getSkillDefinition

interface PlayerStatsPanelProps {
  player: PlayerState | null;
}

const StatBar: React.FC<{current: number, max: number, color: string, label: string}> = ({ current, max, color, label}) => (
  <div className="mb-1">
    <div className="text-xs text-gray-300 mb-0.5 flex justify-between">
      <span>{label}</span>
      <span>{current} / {max}</span>
    </div>
    <ResponsiveContainer width="100%" height={18}>
      <BarChart data={[{ name: label, value: current }]} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis type="number" domain={[0, max]} hide />
        <YAxis type="category" dataKey="name" hide />
        <Bar dataKey="value" barSize={18} background={{ fill: '#374151' /* gray-700 */ }} radius={[3, 3, 3, 3]}>
          <Cell fill={color} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const StatGridItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-slate-700/50 p-2 rounded text-center">
    <div className="text-xs text-sky-300">{label}</div>
    <div className="text-sm font-semibold text-gray-100">{value}</div>
  </div>
);


export const PlayerStatsPanel: React.FC<PlayerStatsPanelProps> = ({ player }) => {
  if (!player) {
    return (
      <div className="p-4 bg-slate-800 rounded-lg shadow-md h-full text-center">
        <p className="text-gray-400">플레이어 데이터를 불러오는 중...</p>
      </div>
    );
  }

  const learnedSkills = player.learnedSkillIds
    .map(id => getSkillDefinition(id))
    .filter(skill => skill !== undefined);

  return (
    <div className="p-3 bg-slate-800 rounded-lg shadow-md h-full flex flex-col space-y-2.5 overflow-y-auto">
      <h3 className="text-lg font-bold text-center text-sky-400 mb-1 border-b border-slate-700 pb-1.5">
        {player.name} - 레벨 {player.level}
      </h3>
      
      <StatBar current={player.hp} max={player.maxHp} color="#22c55e" label="HP" />
      <StatBar current={player.mp} max={player.maxMp} color="#3b82f6" label="MP" />

      <div className="grid grid-cols-2 gap-1.5 text-sm">
        <StatGridItem label="경험치" value={`${player.exp} / ${player.expToNextLevel}`} />
        <StatGridItem label="골드" value={`${player.gold} G`} />
        <StatGridItem label="공격력" value={player.attack} />
        <StatGridItem label="방어력" value={player.defense} />
        <StatGridItem label="속도" value={player.speed} />
        <StatGridItem label="행운" value={player.luck} />
        <StatGridItem label="치명타율" value={`${player.critChance}%`} />
        <StatGridItem label="현 위치" value={player.currentLocation} />
      </div>
      
      <div className="pt-2 border-t border-slate-700">
        <h4 className="text-sm font-semibold text-sky-300 mb-1">장비:</h4>
        <div className="text-xs space-y-1">
          <p><span className="font-medium text-gray-400">무기:</span> {player.equipment.weapon?.name || <span className="italic text-gray-500">없음</span>}</p>
          <p><span className="font-medium text-gray-400">갑옷:</span> {player.equipment.armor?.name || <span className="italic text-gray-500">없음</span>}</p>
          <p><span className="font-medium text-gray-400">장신구:</span> {player.equipment.accessory?.name || <span className="italic text-gray-500">없음</span>}</p>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-700">
        <h4 className="text-sm font-semibold text-sky-300 mb-1">습득 스킬:</h4>
        {learnedSkills.length > 0 ? (
          <ul className="space-y-1 text-xs">
            {learnedSkills.map((skill) => skill && ( // Ensure skill is not undefined
              <li key={skill.id} className="text-gray-300 bg-slate-700/50 p-1 rounded truncate">
                {skill.icon && <span className="mr-1.5">{skill.icon}</span>}
                {skill.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-500 italic text-center">습득한 스킬 없음</p>
        )}
      </div>

      <div className="flex-grow mt-2 pt-2 border-t border-slate-700">
        <h4 className="text-sm font-semibold text-sky-300 mb-1">주요 소지품:</h4>
        {player.inventory.filter(item => item.type === 'keyItem').length > 0 ? (
          <ul className="space-y-1 max-h-24 overflow-y-auto pr-1 text-xs">
            {player.inventory.filter(item => item.type === 'keyItem').map((item) => (
              <li key={item.id} className="text-gray-300 bg-slate-700/50 p-1 rounded truncate">
                {item.icon && <span className="mr-1.5">{item.icon}</span>}
                {item.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-500 italic text-center">주요 소지품 없음</p>
        )}
      </div>
    </div>
  );
};