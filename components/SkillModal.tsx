import React from 'react';
import { PlayerState, Skill } from '../types';
import { getSkillDefinition } from '../constants';

interface SkillModalProps {
  player: PlayerState;
  isOpen: boolean;
  onClose: () => void;
  onUseSkill: (skillId: string, targetId?: string) => void; // targetId is for combat
  isCombatMode: boolean;
  onSetActiveSkillForTargeting?: (skill: Skill) => void; // Used in combat if skill needs targeting
}

const SkillCard: React.FC<{
  skill: Skill;
  playerMp: number;
  onAction: () => void;
  isCombatMode: boolean;
}> = ({ skill, playerMp, onAction, isCombatMode }) => {
  const canUseSkill = playerMp >= skill.mpCost;
  const actionLabel = isCombatMode ? '선택' : '사용'; // In combat, "Select" might lead to targeting

  return (
    <div className={`bg-slate-800 p-3 rounded-lg shadow-md border ${canUseSkill ? 'border-slate-700' : 'border-red-700 opacity-70'}`}>
      <h4 className="text-md font-semibold text-sky-300 mb-1">
        {skill.icon && <span className="mr-2">{skill.icon}</span>}
        {skill.name}
      </h4>
      <p className="text-xs text-slate-400 mb-1">MP 소모: {skill.mpCost}</p>
      <p className="text-xs text-slate-300 mb-2 flex-grow min-h-[30px]">{skill.description}</p>
      {skill.effectValue && <p className="text-xs text-green-400">효과치: {skill.effectValue}</p>}
      <button
        onClick={onAction}
        disabled={!canUseSkill}
        className={`mt-2 w-full px-3 py-1.5 text-xs rounded shadow-sm transition-colors duration-150 
                    ${canUseSkill ? 'bg-sky-600 hover:bg-sky-700' : 'bg-slate-600 cursor-not-allowed'} 
                     text-white disabled:opacity-50`}
      >
        {actionLabel}
      </button>
    </div>
  );
};

export const SkillModal: React.FC<SkillModalProps> = ({ 
  player, isOpen, onClose, onUseSkill, isCombatMode, onSetActiveSkillForTargeting 
}) => {
  if (!isOpen) return null;

  const learnedSkills = player.learnedSkillIds
    .map(id => getSkillDefinition(id))
    .filter(skill => skill !== undefined) as Skill[];

  const handleSkillAction = (skill: Skill) => {
    if (player.mp < skill.mpCost) return;

    if (isCombatMode) {
      if (skill.targetType === 'enemy_single' && onSetActiveSkillForTargeting) {
        onSetActiveSkillForTargeting(skill); // Signal to GameScreen to handle targeting
        onClose(); // Close modal, GameScreen will show targeting prompt
      } else {
        // For self-target, enemy_all, or no target skills
        onUseSkill(skill.id); 
        if(skill.targetType !== 'enemy_single') onClose(); // Close modal if no further targeting needed
      }
    } else {
      // Non-combat: only self-target skills are typically usable
      if (skill.targetType === 'self') {
        onUseSkill(skill.id);
      } else {
        // Optionally, add a system message that this skill can only be used in combat
        console.log(`${skill.name}은(는) 전투 중에만 사용할 수 있습니다.`);
      }
      onClose();
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="skill-modal-title">
      <div className="modal-content w-full max-w-2xl text-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 id="skill-modal-title" className="text-2xl font-bold text-sky-400">스킬 목록</h2>
          <div className="text-lg text-blue-400">MP: {player.mp}/{player.maxMp}</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none" aria-label="스킬 목록 닫기">&times;</button>
        </div>

        {learnedSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
            {learnedSkills.map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                playerMp={player.mp}
                onAction={() => handleSkillAction(skill)}
                isCombatMode={isCombatMode}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-400 italic text-center py-4">습득한 스킬이 없습니다.</p>
        )}

        <button 
          onClick={onClose} 
          className="mt-8 w-full px-4 py-2.5 bg-sky-700 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md transition duration-150"
        >
          닫기
        </button>
      </div>
    </div>
  );
};