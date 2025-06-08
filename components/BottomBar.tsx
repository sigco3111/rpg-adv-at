
import React from 'react';

interface BottomBarProps {
  playerGold: number;
  onOpenInventory: () => void;
  onOpenStatsChart: () => void;
  onOpenSkills: () => void; 
  onGoToMainMenu: () => void;
  onSaveGame: () => void;
  isGameActive: boolean; // To enable/disable save button
  isDelegationModeActive: boolean; 
  onToggleDelegationMode: () => void; 
}

const ActionButton: React.FC<{ onClick: () => void; label: string, className?: string, 'aria-label'?: string, disabled?: boolean }> = 
  ({ onClick, label, className, disabled, ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 px-2 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-medium text-sky-100 bg-sky-700 hover:bg-sky-600 rounded-md shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    aria-label={props['aria-label'] || label}
  >
    {label}
  </button>
);

export const BottomBar: React.FC<BottomBarProps> = ({ 
    playerGold,
    onOpenInventory, 
    onOpenStatsChart,
    onOpenSkills,
    onGoToMainMenu,
    onSaveGame,
    isGameActive,
    isDelegationModeActive,
    onToggleDelegationMode,
}) => {
  return (
    <div className="bg-slate-800 p-1.5 sm:p-2 mt-1 sm:mt-2 rounded-lg shadow-lg">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2">
        <ActionButton onClick={onOpenInventory} label={`가방 (${playerGold}G)`} aria-label={`가방 열기, 현재 소지금 ${playerGold} 골드`} className="sm:col-span-2"/>
        <ActionButton onClick={onOpenSkills} label="스킬" aria-label="스킬 목록 열기" />
        <ActionButton onClick={onOpenStatsChart} label="능력치" aria-label="능력치 차트 열기"/>
        <ActionButton 
          onClick={onSaveGame} 
          label="게임 저장" 
          aria-label="현재 게임 상태 저장" 
          disabled={!isGameActive}
          className="bg-green-600 hover:bg-green-700"
        />
        <ActionButton 
          onClick={onToggleDelegationMode} 
          label={isDelegationModeActive ? "위임 ON" : "위임 OFF"} 
          className={`${isDelegationModeActive ? 'bg-teal-600 hover:bg-teal-700' : 'bg-sky-700 hover:bg-sky-600'} sm:col-span-1`}
          aria-label={isDelegationModeActive ? "전투 위임 모드 비활성화" : "전투 위임 모드 활성화"}
        />
        <ActionButton onClick={onGoToMainMenu} label="메인 메뉴" className="bg-red-700 hover:bg-red-600 col-span-3 sm:col-span-6 mt-1 sm:mt-0" aria-label="메인 메뉴로 돌아가기" /> 
      </div>
    </div>
  );
};
