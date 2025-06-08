
import React, { useState } from 'react';
import { Scene, PlayerState, SceneType, SceneChoice, CombatEnemyInstance, Skill } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface GameScreenProps {
  scene: Scene | null;
  player: PlayerState | null; 
  isLoading: boolean;
  isGameOver: boolean;
  isCombatActive: boolean;
  currentEnemies: CombatEnemyInstance[];
  combatTurn: 'player' | 'enemy' | 'enemy_acting' | null;
  playerTargetId: string | null;
  activeSkill: Skill | null;
  combatMessage: string | null;

  onAdvance: (nextSceneId: string | null) => void;
  onChoice: (choice: SceneChoice) => void;
  onResetGame: () => void;
  onRestPlayer: () => void; 
  onOpenShop: (sceneId: string) => void; 
  
  // Combat Actions
  onPlayerAttack: (targetId: string) => void;
  onPlayerSkillAction: (skillId: string, targetId?: string) => void;
  onPlayerUseItemInCombat: (itemId: string, targetId?: string) => void;
  onFleeAttempt: () => void;
  onSetPlayerTarget: (enemyCombatId: string | null) => void;
  onSetActiveSkillForTargeting: (skill: Skill | null) => void;
  onOpenSkillModal: () => void;
  onOpenInventoryModal: () => void;
  onRestartCurrentCombat: () => void; // New prop for restarting combat
}

export const GameScreen: React.FC<GameScreenProps> = ({
  scene, player, isLoading, isGameOver,
  isCombatActive, currentEnemies, combatTurn, playerTargetId, activeSkill, combatMessage,
  onAdvance, onChoice, onResetGame, onRestPlayer, onOpenShop,
  onPlayerAttack, onPlayerSkillAction, onPlayerUseItemInCombat, onFleeAttempt,
  onSetPlayerTarget, onSetActiveSkillForTargeting, onOpenSkillModal, onOpenInventoryModal,
  onRestartCurrentCombat
}) => {
  const [isTargetingAttack, setIsTargetingAttack] = useState(false);

  if (isGameOver) {
    return (
       <div className="bg-slate-800 p-4 sm:p-6 border-2 border-red-700 rounded-lg shadow-xl text-center flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-red-400 mb-3">게임 오버</h2>
        <p className="text-md sm:text-lg text-gray-300 mb-5">
          여정이 너무 일찍 끝나버렸습니다...
        </p>
        <button
          onClick={onResetGame}
          className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105 text-sm sm:text-base"
          aria-label="새 스크립트로 다시 시작"
        >
          새 스크립트로 다시 시작
        </button>
      </div>
    );
  }
  
  if (isLoading && !scene && !isCombatActive && !player) { 
     return (
      <div className="bg-slate-800 p-4 rounded-lg shadow-md text-center flex flex-col items-center justify-center h-full">
        <LoadingSpinner />
        <p className="text-slate-400 mt-3">게임 데이터 불러오는 중...</p>
      </div>
    );
  }

  // NEW DIAGNOSTIC LOG
  console.log(
    '[GameScreen] Pre-Main-Render Check. isLoading:', isLoading, 
    'isCombatActive:', isCombatActive, 
    'sceneId:', scene ? scene.id : 'null', 
    'sceneType:', scene ? scene.type : 'null',
    'playerExists:', !!player,
    'playerHp:', player ? player.hp : 'N/A',
    'isGameOver:', isGameOver
  );

  // Combat UI
  if (isCombatActive && player) {
    const handleEnemyClick = (enemyCombatId: string) => {
      if (combatTurn !== 'player') return;
      onSetPlayerTarget(enemyCombatId);
      if (isTargetingAttack) {
        onPlayerAttack(enemyCombatId);
        setIsTargetingAttack(false);
        onSetPlayerTarget(null);
      } else if (activeSkill) {
        if (activeSkill.targetType === 'enemy_single') {
          onPlayerSkillAction(activeSkill.id, enemyCombatId);
        }
        onSetActiveSkillForTargeting(null); 
        onSetPlayerTarget(null);
      }
    };

    return (
      <div className="bg-slate-800 p-3 sm:p-4 rounded-lg shadow-xl flex flex-col h-full overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-3 text-center border-b border-slate-700 pb-2">전투 중! - {scene?.title}</h2>
        
        <div className="mb-4 space-y-2">
          <h3 className="text-lg text-sky-400 font-semibold">적:</h3>
          {currentEnemies.map(enemy => (
            <div 
              key={enemy.combatId} 
              onClick={() => (isTargetingAttack || activeSkill?.targetType === 'enemy_single') && enemy.currentHp > 0 && handleEnemyClick(enemy.combatId) }
              className={`p-2 rounded border 
                ${enemy.currentHp <= 0 ? 'bg-slate-700 opacity-50' : 
                  (isTargetingAttack || activeSkill?.targetType === 'enemy_single') ? 'cursor-pointer hover:bg-red-700' : 'bg-slate-700/50'}
                ${playerTargetId === enemy.combatId && enemy.currentHp > 0 ? 'border-red-500 ring-2 ring-red-500' : 'border-slate-600'}`}
              aria-label={`${enemy.name} HP ${enemy.currentHp}/${enemy.maxHp}`}
            >
              <div className="flex justify-between items-center text-sm">
                <span className={enemy.currentHp <= 0 ? "line-through" : ""}>{enemy.name}</span>
                <span>HP: {enemy.currentHp} / {enemy.maxHp}</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2.5 mt-1">
                <div 
                  className="bg-red-600 h-2.5 rounded-full" 
                  style={{ width: `${(enemy.currentHp / (enemy.maxHp || 1)) * 100}%` }} // Added guard for enemy.maxHp
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 p-2 bg-slate-700/50 rounded border border-slate-600">
          <h3 className="text-lg text-green-400 font-semibold">{player.name}</h3>
          <div className="text-sm">HP: {player.hp} / {player.maxHp} | MP: {player.mp} / {player.maxMp}</div>
        </div>

        {combatMessage && <p className="text-center text-yellow-300 font-semibold my-2">{combatMessage}</p>}
        {isTargetingAttack && <p className="text-center text-sky-300 my-1">공격할 대상을 선택하세요.</p>}
        {activeSkill && activeSkill.targetType === 'enemy_single' && <p className="text-center text-sky-300 my-1">{activeSkill.name} 스킬 대상을 선택하세요.</p>}

        {combatTurn === 'player' && (
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <button
              onClick={() => { 
                setIsTargetingAttack(true); 
                onSetActiveSkillForTargeting(null);
                onSetPlayerTarget(null);
              }}
              className="px-3 py-2.5 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md"
            >공격</button>
            <button
              onClick={() => {
                setIsTargetingAttack(false);
                onSetPlayerTarget(null);
                onOpenSkillModal();
              }}
              className="px-3 py-2.5 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
            >스킬</button>
            <button
              onClick={() => {
                setIsTargetingAttack(false);
                onSetActiveSkillForTargeting(null);
                onSetPlayerTarget(null);
                onOpenInventoryModal();
              }}
              className="px-3 py-2.5 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md"
            >아이템</button>
            <button
              onClick={() => {
                setIsTargetingAttack(false);
                onSetActiveSkillForTargeting(null);
                onSetPlayerTarget(null);
                onFleeAttempt();
              }}
              className={`px-3 py-2.5 text-sm sm:text-base text-white font-semibold rounded-lg shadow-md ${scene?.type === SceneType.COMBAT_BOSS ? 'bg-gray-500 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'}`}
              disabled={scene?.type === SceneType.COMBAT_BOSS}
            >도망</button>
          </div>
        )}
        {combatTurn === 'enemy_acting' && (
            <div className="text-center text-slate-400 mt-auto py-2">적의 턴 진행 중...</div>
        )}
      </div>
    );
  }

  // Post-Normal-Combat UI or other scenes
  if (!isCombatActive && scene && player && player.hp > 0 && !isGameOver) {
    // Diagnostic log for post-normal-combat and general scenes
    console.log('[GameScreen] Rendering non-combat/post-combat branch. Scene ID:', scene.id, 'Type:', scene.type, 'NextSceneId:', scene.nextSceneId, 'isLoading:', isLoading);

    if (scene.type === SceneType.COMBAT_NORMAL) {
      // Player has won a normal combat and is not in active combat
      return (
        <div className="bg-slate-800 p-3 sm:p-4 rounded-lg shadow-xl flex flex-col h-full overflow-y-auto">
          <div className="mb-3 sm:mb-4 pr-1">
            <h2 className="text-lg sm:text-xl font-bold text-sky-400 mb-2 sm:mb-3">{scene.title} - 전투 승리!</h2>
            <p className="text-sm text-gray-300 mb-4">
              {combatMessage || "모든 적을 물리쳤습니다. 다시 도전하여 경험치를 더 얻거나 다음으로 진행할 수 있습니다."}
            </p>
          </div>
          <div className="space-y-2 mt-auto">
            <button
              onClick={onRestartCurrentCombat}
              disabled={isLoading}
              className="w-full px-3 py-2.5 text-sm sm:text-base bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60"
              aria-label="다시 싸우기"
            >
              다시 싸우기
            </button>
            {scene.nextSceneId && (
              <button
                onClick={() => onAdvance(scene.nextSceneId)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60"
                aria-label="계속 진행"
              >
                계속 진행
              </button>
            )}
            {!scene.nextSceneId && (
               <p className="text-center text-slate-500 italic py-2 text-xs sm:text-sm">이 전투 이후 다음 경로가 없습니다.</p>
            )}
          </div>
        </div>
      );
    } else if (scene.type === SceneType.TOWN) {
      return (
        <div className="bg-slate-800 p-3 sm:p-4 rounded-lg shadow-xl flex flex-col h-full overflow-y-auto">
          <div className="mb-3 sm:mb-4 pr-1">
            <h2 className="text-lg sm:text-xl font-bold text-sky-400 mb-2 sm:mb-3">{scene.title}</h2>
          </div>
          <div className="space-y-2 mt-auto"> {/* Changed to mt-auto for bottom alignment */}
            <p className="text-sm text-gray-400 mb-2 text-center">무엇을 하시겠습니까?</p>
            <button
              onClick={() => onOpenShop(scene.id)}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm sm:text-base bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60"
            >상점 이용하기</button>
            <button
              onClick={onRestPlayer}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60"
            >휴식하기 (HP/MP 회복)</button>
            {scene.nextSceneId && (
              <button
                onClick={() => onAdvance(scene.nextSceneId)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 text-sm sm:text-base bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60"
              >마을 떠나기</button>
            )}
            {!scene.nextSceneId && (
               <p className="text-center text-slate-500 italic py-2 text-xs sm:text-sm">이 길의 끝입니다. 새 스크립트를 로드하여 모험을 계속하세요.</p>
            )}
          </div>
        </div>
      );
    } else { // Default rendering for other scene types (NARRATION, CHOICE, ITEM_GET etc.)
      // ADDED DETAILED LOG FOR CONTINUE BUTTON
      const showContinueButton = scene.type !== SceneType.CHOICE && scene.nextSceneId;
      console.log(
        '[GameScreen] NARRATION/OTHER: Scene Type:', scene.type, 
        '| SceneType.CHOICE:', SceneType.CHOICE, 
        '| scene.nextSceneId:', scene.nextSceneId,
        '| Condition (scene.type !== SceneType.CHOICE):', (scene.type !== SceneType.CHOICE),
        '| Condition (!!scene.nextSceneId):', (!!scene.nextSceneId),
        '| Show Continue Button:', showContinueButton
      );

      return (
        <div className="bg-slate-800 p-3 sm:p-4 rounded-lg shadow-xl flex flex-col h-full overflow-y-auto">
          <div className="mb-3 sm:mb-4 pr-1 flex-grow"> {/* Added flex-grow */}
            <h2 className="text-lg sm:text-xl font-bold text-sky-400 mb-2 sm:mb-3">{scene.title}</h2>
            {/* For CHOICE type, content is often a question, so show it. Others show their narration. */}
            <p className="text-sm sm:text-base text-gray-300 whitespace-pre-line">{scene.content}</p>
          </div>
          
          <div className="space-y-2 mt-auto"> {/* Added mt-auto for bottom alignment */}
            {scene.type === SceneType.CHOICE && scene.choices && scene.choices.length > 0 && (
              <div className="space-y-2">
                {/* Content for CHOICE is already shown above */}
                {scene.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => onChoice(choice)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-sm sm:text-base bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60"
                  >{choice.text}</button>
                ))}
              </div>
            )}

            {showContinueButton && (
              <button
                onClick={() => onAdvance(scene.nextSceneId!)} // Ensured non-null with ! due to showContinueButton logic
                disabled={isLoading}
                className="w-full px-3 py-2.5 text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60"
              >계속하기</button>
            )}
            
            {!scene.nextSceneId && scene.type !== SceneType.CHOICE && (
               <p className="text-center text-slate-500 italic py-2 text-xs sm:text-sm">이 길의 끝입니다. 새 스크립트를 로드하여 모험을 계속하세요.</p>
            )}
          </div>
        </div>
      );
    }
  }

  // Fallback for when no specific UI matches (e.g., initial load before scene is set, or end of script)
  if (!isLoading) { // Avoid showing this during initial load spinner
      console.log('[GameScreen] Rendering fallback UI. Scene:', scene ? scene.id : 'null', 'Player:', !!player, 'isCombatActive:', isCombatActive, 'isGameOver:', isGameOver);
      return (
        <div className="bg-slate-800 p-4 rounded-lg shadow-md text-center flex flex-col items-center justify-center h-full">
            <p className="text-slate-400">모험을 시작하거나 계속할 장면이 없습니다.</p>
            <button
                onClick={onResetGame} 
                className="mt-4 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out text-sm"
            >
                메인 메뉴로 돌아가기
            </button>
        </div>
    );
  }
  
  // This should ideally not be reached if isLoading with no player/scene is handled above.
  console.log('[GameScreen] Rendering final loading spinner. isLoading:', isLoading, 'Scene:', scene ? scene.id : 'null');
  return <div className="bg-slate-800 p-4 rounded-lg shadow-md text-center flex flex-col items-center justify-center h-full"><LoadingSpinner /><p className="text-slate-400 mt-3">로딩 중...</p></div>;
};
