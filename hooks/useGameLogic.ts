
import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  GameScript, Stage, Scene, PlayerState, Character, SceneChoice, GameLogEntry, SceneType, CharacterType, GameItem, PlayerEquipment, CombatEnemyInstance, Skill
} from '../types';
import { 
  LOCAL_STORAGE_SCRIPT_KEY, PLAYER_DEFAULT_HP, PLAYER_DEFAULT_GOLD, PLAYER_DEFAULT_EXP, 
  COMBAT_REWARDS, PLAYER_DEFAULT_MP, PLAYER_DEFAULT_LEVEL, PLAYER_DEFAULT_EXP_TO_NEXT_LEVEL,
  PLAYER_DEFAULT_BASE_ATTACK, PLAYER_DEFAULT_BASE_DEFENSE, PLAYER_DEFAULT_BASE_SPEED,
  PLAYER_DEFAULT_BASE_LUCK, PLAYER_DEFAULT_CRIT_CHANCE, ITEM_SMALL_POTION, ITEM_BASIC_SWORD,
  getItemDefinition, SHOP_INVENTORIES, DEFAULT_BUY_PRICE_MULTIPLIER, DEFAULT_SHOP_ITEM_IDS,
  ENEMY_DEFAULT_HP, ENEMY_DEFAULT_ATTACK, ENEMY_DEFAULT_DEFENSE, BOSS_DEFAULT_HP_MULTIPLIER, 
  BOSS_DEFAULT_ATTACK_MULTIPLIER, BOSS_DEFAULT_DEFENSE_MULTIPLIER, PLAYER_DEFAULT_SKILLS, getSkillDefinition,
  EXP_TO_NEXT_LEVEL_MULTIPLIER, LEVEL_UP_HP_GAIN, LEVEL_UP_MP_GAIN, LEVEL_UP_ATTACK_GAIN,
  LEVEL_UP_DEFENSE_GAIN, LEVEL_UP_SPEED_GAIN, LEVEL_UP_LUCK_GAIN, SKILLS_BY_LEVEL,
  LOCAL_STORAGE_GAME_STATE_KEY
} from '../constants';
import { loadFromLocalStorage, saveToLocalStorage, removeFromLocalStorage } from '../utils/localStorage';

export interface GameLogicState { // Renamed from GameState to avoid conflict with potential GameState type for saving
  script: GameScript | null;
  currentStage: Stage | null;
  currentScene: Scene | null;
  player: PlayerState | null;
  gameLog: GameLogEntry[];
  isLoading: boolean; 
  error: string | null;
  isGameOver: boolean;
  
  isShopOpen: boolean;
  currentShopId: string | null;
  currentShopItems: GameItem[];
  shopError: string | null;

  isCombatActive: boolean;
  currentEnemies: CombatEnemyInstance[];
  combatTurn: 'player' | 'enemy' | 'enemy_acting' | null; 
  playerTargetId: string | null; 
  activeSkill: Skill | null; 
  combatMessage: string | null;

  isDelegationModeActive: boolean; 
  awaitingPostDelegatedNormalCombatChoice: boolean;
  lastVisitedTownSceneId: string | null;
  pendingSafeSceneTransition: string | null;
}

const calculateDerivedStats = (player: PlayerState): PlayerState => {
  let newAttack = player.baseAttack;
  let newDefense = player.baseDefense;
  let newSpeed = player.baseSpeed;
  let newLuck = player.baseLuck;
  let newMaxHp = player.maxHp; // Start with base maxHp which includes level up gains
  let newMaxMp = player.maxMp; // Start with base maxMp

  Object.values(player.equipment).forEach(item => {
    if (item && item.effects) {
      newAttack += item.effects.attack || 0;
      newDefense += item.effects.defense || 0;
      newSpeed += item.effects.speed || 0;
      newLuck += item.effects.luck || 0;
      newMaxHp += item.effects.hp || 0; // Equipment can also grant max HP
      newMaxMp += item.effects.mp || 0; // Equipment can also grant max MP
    }
  });
  
  // Ensure HP/MP don't exceed new max values after recalculation from equipment
  const currentHp = Math.min(player.hp, newMaxHp);
  const currentMp = Math.min(player.mp, newMaxMp);


  return { ...player, attack: newAttack, defense: newDefense, speed: newSpeed, luck: newLuck, maxHp: newMaxHp, maxMp: newMaxMp, hp: currentHp, mp: currentMp };
};

const initialLogicState: GameLogicState = {
  script: null,
  currentStage: null,
  currentScene: null,
  player: null,
  gameLog: [],
  isLoading: false,
  error: null,
  isGameOver: false,
  isShopOpen: false,
  currentShopId: null,
  currentShopItems: [],
  shopError: null,
  isCombatActive: false,
  currentEnemies: [],
  combatTurn: null,
  playerTargetId: null,
  activeSkill: null,
  combatMessage: null,
  isDelegationModeActive: false,
  awaitingPostDelegatedNormalCombatChoice: false,
  lastVisitedTownSceneId: null,
  pendingSafeSceneTransition: null,
};


export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameLogicState>(initialLogicState);

  const addLogEntry = useCallback((type: GameLogEntry['type'], message: string, speaker?: string) => {
    setGameState(prev => ({
      ...prev,
      gameLog: [...prev.gameLog, { id: crypto.randomUUID(), type, message, speaker, timestamp: Date.now() }].slice(-100) 
    }));
  }, []);

  const toggleDelegationMode = useCallback(() => {
    setGameState(prev => {
      const newMode = !prev.isDelegationModeActive;
      addLogEntry('system', `전투 위임 모드가 ${newMode ? '활성화' : '비활성화'}되었습니다.`);
      return { 
        ...prev, 
        isDelegationModeActive: newMode,
        awaitingPostDelegatedNormalCombatChoice: newMode ? prev.awaitingPostDelegatedNormalCombatChoice : false,
      };
    });
  }, [addLogEntry]);

  const initializePlayer = useCallback((script: GameScript, stage: Stage): PlayerState => {
    const playerChar = stage.characters.find(c => c.type === CharacterType.PLAYER);
    if (!playerChar) throw new Error("플레이어 캐릭터를 스크립트에서 찾을 수 없습니다.");
    
    const initialEquipment: PlayerEquipment = { weapon: null, armor: null, accessory: null };
    const initialInventory: GameItem[] = [];

    const starterPotionDef = getItemDefinition(ITEM_SMALL_POTION.id);
    if (starterPotionDef) initialInventory.push({ ...starterPotionDef, quantity: 3 });
    
    const starterSwordDef = getItemDefinition(ITEM_BASIC_SWORD.id);
    if (starterSwordDef) initialEquipment.weapon = { ...starterSwordDef, quantity: 1};

    let player: PlayerState = {
      name: playerChar.name,
      level: PLAYER_DEFAULT_LEVEL,
      hp: PLAYER_DEFAULT_HP,
      maxHp: PLAYER_DEFAULT_HP,
      mp: PLAYER_DEFAULT_MP,
      maxMp: PLAYER_DEFAULT_MP,
      exp: PLAYER_DEFAULT_EXP,
      expToNextLevel: PLAYER_DEFAULT_EXP_TO_NEXT_LEVEL,
      gold: PLAYER_DEFAULT_GOLD,
      baseAttack: PLAYER_DEFAULT_BASE_ATTACK,
      baseDefense: PLAYER_DEFAULT_BASE_DEFENSE,
      baseSpeed: PLAYER_DEFAULT_BASE_SPEED,
      baseLuck: PLAYER_DEFAULT_BASE_LUCK,
      attack: PLAYER_DEFAULT_BASE_ATTACK, 
      defense: PLAYER_DEFAULT_BASE_DEFENSE,
      speed: PLAYER_DEFAULT_BASE_SPEED,
      luck: PLAYER_DEFAULT_BASE_LUCK,
      critChance: PLAYER_DEFAULT_CRIT_CHANCE,
      inventory: initialInventory,
      equipment: initialEquipment,
      currentLocation: stage.scenes[0]?.newLocationName || script.worldSettings.keyLocations?.split(',')[0]?.trim() || "알 수 없는 위치",
      learnedSkillIds: [...PLAYER_DEFAULT_SKILLS],
    };
    
    player = calculateDerivedStats(player); // This sets attack, defense etc. AND updates maxHp/maxMp from equipment
    // Ensure current HP/MP are not above the (potentially newly calculated) maxHP/MP
    player.hp = Math.min(player.hp, player.maxHp);
    player.mp = Math.min(player.mp, player.maxMp);

    addLogEntry('event', `${player.name}님, 환영합니다! ${script.worldSettings.title}에서의 모험이 시작됩니다.`);
    return player;
  }, [addLogEntry]);
  
  const handleLevelUp = useCallback((playerState: PlayerState): PlayerState => {
    let modifiablePlayer = { ...playerState }; 
    let oldLevel = modifiablePlayer.level;
  
    while (modifiablePlayer.exp >= modifiablePlayer.expToNextLevel) {
      const oldExpToNextLevel = modifiablePlayer.expToNextLevel;
      
      modifiablePlayer.level += 1;
      modifiablePlayer.exp -= oldExpToNextLevel;
      modifiablePlayer.expToNextLevel = Math.floor(oldExpToNextLevel * EXP_TO_NEXT_LEVEL_MULTIPLIER);
  
      const hpGain = LEVEL_UP_HP_GAIN;
      const mpGain = LEVEL_UP_MP_GAIN;
      const attackGain = LEVEL_UP_ATTACK_GAIN;
      const defenseGain = LEVEL_UP_DEFENSE_GAIN;
      const speedGain = LEVEL_UP_SPEED_GAIN;
      const luckGain = LEVEL_UP_LUCK_GAIN;
  
      modifiablePlayer.maxHp += hpGain;
      // modifiablePlayer.hp = modifiablePlayer.maxHp;  // HP is fully restored by calculateDerivedStats or explicitly after this
      modifiablePlayer.maxMp += mpGain;
      // modifiablePlayer.mp = modifiablePlayer.maxMp;
  
      modifiablePlayer.baseAttack += attackGain;
      modifiablePlayer.baseDefense += defenseGain;
      modifiablePlayer.baseSpeed += speedGain;
      modifiablePlayer.baseLuck += luckGain;
      
      addLogEntry('reward', `${modifiablePlayer.name}이(가) 레벨 ${modifiablePlayer.level}(으)로 상승했습니다!`);
      addLogEntry('event', `최대 HP +${hpGain}, 최대 MP +${mpGain}, 기본 공격력 +${attackGain}, 기본 방어력 +${defenseGain}, 기본 속도 +${speedGain}, 기본 행운 +${luckGain}. HP/MP가 모두 회복되었습니다.`);

      // Check for new skills based on the new level
      for (let lvl = oldLevel + 1; lvl <= modifiablePlayer.level; lvl++) {
        const skillsForThisLevel = SKILLS_BY_LEVEL[lvl];
        if (skillsForThisLevel) {
          skillsForThisLevel.forEach(skillId => {
            if (!modifiablePlayer.learnedSkillIds.includes(skillId)) {
              modifiablePlayer.learnedSkillIds.push(skillId);
              const newSkillDef = getSkillDefinition(skillId);
              if (newSkillDef) {
                addLogEntry('reward', `${modifiablePlayer.name}이(가) 새로운 스킬 "${newSkillDef.name}"을(를) 습득했습니다!`);
              }
            }
          });
        }
      }
      oldLevel = modifiablePlayer.level; 
    }
    // After all level ups, recalculate derived stats (which also handles equipment bonuses correctly)
    // and fully heal HP/MP
    let finalPlayer = calculateDerivedStats(modifiablePlayer);
    finalPlayer.hp = finalPlayer.maxHp;
    finalPlayer.mp = finalPlayer.maxMp;
  
    return finalPlayer; 
  }, [addLogEntry]);


  const addItemToInventory = (playerState: PlayerState, itemDefinition: GameItem, quantity: number = 1): PlayerState => {
    const newInventory = [...playerState.inventory];
    const existingItemIndex = newInventory.findIndex(i => i.id === itemDefinition.id);

    if (existingItemIndex > -1) {
      newInventory[existingItemIndex] = {
        ...newInventory[existingItemIndex],
        quantity: newInventory[existingItemIndex].quantity + quantity,
      };
    } else {
      newInventory.push({ ...itemDefinition, quantity });
    }
    return { ...playerState, inventory: newInventory };
  };

  const startCombat = useCallback((scene: Scene) => {
    setGameState(prev => {
      if (!prev.script || !prev.currentStage || !prev.player) return prev;

      const enemyDefinitions = scene.combatDetails?.enemyCharacterIds
        .map(id => prev.currentStage?.characters.find(c => c.id === id))
        .filter(c => c !== undefined) as Character[];

      if (!enemyDefinitions || enemyDefinitions.length === 0) {
        addLogEntry('error', `전투 시작 오류: ID가 ${scene.id}인 장면의 적 정보를 찾을 수 없습니다.`);
        return {...prev, isCombatActive: false, combatMessage: "적 정보 없음"}; 
      }
      
      const isBossFight = scene.type === SceneType.COMBAT_BOSS;

      const enemies: CombatEnemyInstance[] = enemyDefinitions.map((def, index) => ({
        ...def,
        combatId: `${def.id}_${index}_${crypto.randomUUID()}`, // Ensure unique combatId even on restart
        maxHp: def.hp ?? (isBossFight ? ENEMY_DEFAULT_HP * BOSS_DEFAULT_HP_MULTIPLIER : ENEMY_DEFAULT_HP),
        currentHp: def.hp ?? (isBossFight ? ENEMY_DEFAULT_HP * BOSS_DEFAULT_HP_MULTIPLIER : ENEMY_DEFAULT_HP),
        attack: def.attack ?? (isBossFight ? ENEMY_DEFAULT_ATTACK * BOSS_DEFAULT_ATTACK_MULTIPLIER : ENEMY_DEFAULT_ATTACK),
        defense: def.defense ?? (isBossFight ? ENEMY_DEFAULT_DEFENSE * BOSS_DEFAULT_DEFENSE_MULTIPLIER : ENEMY_DEFAULT_DEFENSE),
      }));
      
      addLogEntry('combat', `${scene.content} 전투 시작!`);
      enemies.forEach(e => addLogEntry('combat_action', `${e.name}이(가) 나타났다!`));

      return {
        ...prev,
        isCombatActive: true,
        currentEnemies: enemies,
        currentScene: scene, 
        combatTurn: 'player',
        playerTargetId: null,
        activeSkill: null,
        combatMessage: `${prev.player?.name}의 턴!`,
        awaitingPostDelegatedNormalCombatChoice: false,
        pendingSafeSceneTransition: null, 
      };
    });
  }, [addLogEntry]);


  const advanceToScene = useCallback((sceneId: string | null) => {
    setGameState(prev => {
      if (!prev.script || !prev.currentStage || !prev.player || prev.isGameOver || prev.isCombatActive) {
         if (prev.isCombatActive && !prev.pendingSafeSceneTransition) { 
            console.warn("Attempted to advance scene while combat is active and not retreating.");
            return prev;
         }
      }


      if (sceneId === null) {
        addLogEntry('event', "현재 챕터의 마지막에 도달했습니다.");
        // Check if this is the absolute end of the game (last scene of last stage)
        const currentStageIndex = prev.script.stages.findIndex(s => s.id === prev.currentStage.id);
        const isLastStage = currentStageIndex === prev.script.stages.length - 1;
        if (isLastStage) {
            addLogEntry('system', `축하합니다! ${prev.script.worldSettings.title} 모험을 완료했습니다! 게임을 초기화하거나 새 스크립트를 로드하세요.`);
            return {
                ...prev,
                isGameOver: true, // Treat as game over to show reset options
                isLoading: false,
                currentScene: null,
                combatMessage: "게임 완료!",
                awaitingPostDelegatedNormalCombatChoice: false,
                pendingSafeSceneTransition: null,
            }
        } else {
             // TODO: Implement advancing to next stage if available
            addLogEntry('system', "다음 스테이지로 진행하는 기능은 아직 구현되지 않았습니다. 현재 스테이지가 종료됩니다.");
             return { 
                ...prev, 
                isLoading: false, 
                currentScene: null,
                awaitingPostDelegatedNormalCombatChoice: false,
                pendingSafeSceneTransition: null,
            }; 
        }
      }

      const nextScene = prev.currentStage.scenes.find(s => s.id === sceneId);
      if (!nextScene) {
        return { 
            ...prev, 
            error: `ID가 ${sceneId}인 장면을 찾을 수 없습니다.`,
            awaitingPostDelegatedNormalCombatChoice: false,
            pendingSafeSceneTransition: null,
        };
      }
      
      let updatedPlayer = { ...prev.player };
      let sceneSpecificLog = nextScene.content;
      let newLastVisitedTownId = prev.lastVisitedTownSceneId;

      if (nextScene.newLocationName) {
        updatedPlayer.currentLocation = nextScene.newLocationName;
        addLogEntry('location', `${nextScene.newLocationName}에 도착했습니다.`);
      }

      if (nextScene.type === SceneType.TOWN) {
        newLastVisitedTownId = nextScene.id;
      }

      if (nextScene.type === SceneType.ITEM_GET && nextScene.item) {
        const itemDefinition = getItemDefinition(nextScene.item);
        if (itemDefinition) {
          updatedPlayer = addItemToInventory(updatedPlayer, itemDefinition, 1);
          sceneSpecificLog = `${nextScene.content} ${itemDefinition.name}을(를) 획득했습니다!`;
          addLogEntry('reward', `${itemDefinition.name}을(를) 획득했습니다!`);
        } else {
          addLogEntry('error', `아이템 "${nextScene.item}"의 정의를 찾을 수 없습니다.`);
          updatedPlayer = addItemToInventory(updatedPlayer, { id: crypto.randomUUID(), name: nextScene.item, type: 'keyItem', quantity: 1, description: '알 수 없는 아이템.' },1);
          sceneSpecificLog = `${nextScene.content} ${nextScene.item}을(를) 획득했습니다! (정의되지 않은 아이템)`;
          addLogEntry('reward', `${nextScene.item}을(를) 획득했습니다! (정의되지 않은 아이템)`);
        }
      }
      
      const finalPlayerState = calculateDerivedStats(updatedPlayer);
      
      if (nextScene.type !== SceneType.COMBAT_NORMAL && nextScene.type !== SceneType.COMBAT_BOSS) {
        if (sceneSpecificLog) {
           if (nextScene.type === SceneType.DIALOGUE) {
                // Dialogue content is handled by a separate useEffect based on characterIds
           } else if (nextScene.type === SceneType.TOWN) {
               addLogEntry('narration', sceneSpecificLog);
           } else if (nextScene.type !== SceneType.CHOICE) { 
               addLogEntry('narration', sceneSpecificLog);
           }
        }
      }

      const newState = {
        ...prev,
        currentScene: nextScene,
        player: finalPlayerState,
        isLoading: false,
        awaitingPostDelegatedNormalCombatChoice: false,
        lastVisitedTownSceneId: newLastVisitedTownId,
        pendingSafeSceneTransition: null, 
        isCombatActive: (nextScene.type === SceneType.COMBAT_NORMAL || nextScene.type === SceneType.COMBAT_BOSS) ? prev.isCombatActive : false, 
        combatMessage: (nextScene.type === SceneType.COMBAT_NORMAL || nextScene.type === SceneType.COMBAT_BOSS) ? prev.combatMessage : null,
      };
      return newState;
    });
  }, [addLogEntry]); 
  

  useEffect(() => {
    if (gameState.currentScene && 
        (gameState.currentScene.type === SceneType.COMBAT_NORMAL || gameState.currentScene.type === SceneType.COMBAT_BOSS) &&
        !gameState.isCombatActive && !gameState.isLoading && !gameState.isGameOver && !gameState.pendingSafeSceneTransition) { 
      
      if (gameState.awaitingPostDelegatedNormalCombatChoice && gameState.currentScene.type === SceneType.COMBAT_NORMAL) {
          return; 
      }
      startCombat(gameState.currentScene);
    }
  }, [gameState.currentScene, gameState.isCombatActive, gameState.isLoading, gameState.isGameOver, startCombat, gameState.awaitingPostDelegatedNormalCombatChoice, gameState.pendingSafeSceneTransition]);


  const checkCombatEndCondition = useCallback(() => {
    setGameState(prev => {
      if (!prev.isCombatActive || !prev.player || !prev.currentScene || prev.pendingSafeSceneTransition) return prev;

      let nextStateUpdate: Partial<GameLogicState> = {};

      if (prev.player.hp <= 0) {
        addLogEntry('combat_result', `${prev.player.name}이(가) 쓰러졌습니다...`);
        
        let safeSceneId: string | null = prev.lastVisitedTownSceneId;

        if (!safeSceneId && prev.script && prev.script.stages.length > 0) {
          const findSafeScene = (stages: Stage[]): string | null => {
            for (const stage of stages) {
              const townInStage = stage.scenes.find(s => s.type === SceneType.TOWN);
              if (townInStage) return townInStage.id;
              const nonCombatScene = stage.scenes.find(s => s.type !== SceneType.COMBAT_NORMAL && s.type !== SceneType.COMBAT_BOSS);
              if (nonCombatScene) return nonCombatScene.id;
            }
            return null;
          };
          safeSceneId = findSafeScene(prev.script.stages);
        }


        if (safeSceneId) {
          addLogEntry('system', `잠시 후 안전한 장소로 이동합니다.`);
          const updatedPlayerHp = Math.max(1, Math.floor(prev.player.maxHp * 0.1)); // Restore 10% HP, min 1
          const goldPenalty = Math.floor(prev.player.gold * 0.2); // Lose 20% gold
          const updatedPlayerGold = Math.max(0, prev.player.gold - goldPenalty);
          addLogEntry('event', `${goldPenalty} 골드를 잃었습니다.`);
          
          const updatedPlayer = { ...prev.player, hp: updatedPlayerHp, gold: updatedPlayerGold };
          const finalPlayerState = calculateDerivedStats(updatedPlayer);
          
          return { 
              ...prev, 
              player: finalPlayerState,
              pendingSafeSceneTransition: safeSceneId, 
              isGameOver: false, 
              combatTurn: null, 
              combatMessage: "전투 패배... 안전한 곳으로 이동합니다.",
              awaitingPostDelegatedNormalCombatChoice: false,
          };
        } else {
          addLogEntry('error', "안전한 장소를 찾을 수 없습니다. 게임 오버.");
           return { 
            ...prev, 
            isCombatActive: false, 
            isGameOver: true, 
            combatTurn: null, 
            combatMessage: "게임 오버...",
            awaitingPostDelegatedNormalCombatChoice: false,
            pendingSafeSceneTransition: null,
          };
        }
      }

      const allEnemiesDefeated = prev.currentEnemies.every(enemy => enemy.currentHp <= 0);
      if (allEnemiesDefeated) {
        const rewards = prev.currentScene.type === SceneType.COMBAT_BOSS ? COMBAT_REWARDS.boss : COMBAT_REWARDS.normal;
        
        let playerWithRewards = { ...prev.player, gold: prev.player.gold + rewards.gold, exp: prev.player.exp + rewards.exp };
        addLogEntry('reward', `${rewards.gold} 골드와 ${rewards.exp} 경험치를 얻었다.`);
        
        const playerAfterLevelUp = handleLevelUp(playerWithRewards);
        const finalPlayerStateAfterCombat = calculateDerivedStats(playerAfterLevelUp);
        
        if (prev.currentScene.type === SceneType.COMBAT_BOSS) {
          addLogEntry('combat_result', `보스 전투 승리!`);
          let bossVictoryMessage = "보스 전투 승리!";
          if (prev.isDelegationModeActive) {
            bossVictoryMessage += " [전투 위임]";
          }
          
          const nextSceneId = prev.currentScene.nextSceneId ?? null;
          if (nextSceneId) {
            bossVictoryMessage += " 잠시 후 다음 장면으로 진행합니다...";
            setTimeout(() => advanceToScene(nextSceneId), 1500); 
          } else {
            bossVictoryMessage += " 다음 장면이 없습니다.";
            // This is likely the end of a stage or game after a boss
             const currentStageIndex = prev.script!.stages.findIndex(s => s.id === prev.currentStage!.id);
             const isLastStage = currentStageIndex === prev.script!.stages.length - 1;
             if (isLastStage) {
                 addLogEntry('system', `축하합니다! ${prev.script!.worldSettings.title} 모험을 완료했습니다! 게임을 초기화하거나 새 스크립트를 로드하세요.`);
                 return {
                     ...prev,
                     player: finalPlayerStateAfterCombat,
                     isCombatActive: false,
                     combatTurn: null,
                     isGameOver: true, // Treat as game over to show reset options
                     combatMessage: "게임 완료!",
                     awaitingPostDelegatedNormalCombatChoice: false,
                     pendingSafeSceneTransition: null,
                 }
             }
          }
          addLogEntry('system', bossVictoryMessage); 

          return { 
            ...prev, 
            player: finalPlayerStateAfterCombat, 
            isCombatActive: false, 
            combatTurn: null, 
            combatMessage: bossVictoryMessage,
            awaitingPostDelegatedNormalCombatChoice: false,
            pendingSafeSceneTransition: null,
          };

        } else { 
          addLogEntry('combat_result', `전투 승리!`);
          if (prev.isDelegationModeActive) {
            addLogEntry('system', "전투 승리! [전투 위임] 행동을 선택하세요.");
            nextStateUpdate.awaitingPostDelegatedNormalCombatChoice = true;
          } else {
            nextStateUpdate.awaitingPostDelegatedNormalCombatChoice = false;
          }
          
          return { 
            ...prev, 
            ...nextStateUpdate,
            player: finalPlayerStateAfterCombat, 
            isCombatActive: false, 
            combatTurn: null, 
            combatMessage: "전투 승리! 다시 싸우거나 계속 진행할 수 있습니다.",
            pendingSafeSceneTransition: null,
          };
        }
      }
      return prev; 
    });
  }, [addLogEntry, advanceToScene, handleLevelUp]);

  useEffect(() => {
    if (gameState.pendingSafeSceneTransition) {
      const targetSceneId = gameState.pendingSafeSceneTransition;
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          isCombatActive: false, 
          currentEnemies: [],    
          playerTargetId: null,
          activeSkill: null,
          pendingSafeSceneTransition: null, 
          combatMessage: "안전한 곳으로 이동했습니다.", 
        }));
        advanceToScene(targetSceneId);
      }, 1500); 

      return () => clearTimeout(timer);
    }
  }, [gameState.pendingSafeSceneTransition, advanceToScene]);


  const processEnemyTurns = useCallback(() => {
    setGameState(prev => {
      if (!prev.isCombatActive || prev.combatTurn !== 'enemy_acting' || !prev.player || prev.pendingSafeSceneTransition) { 
          return prev;
      }
      
      let playerHp = prev.player.hp;
      const enemyActionsLog: string[] = [];

      prev.currentEnemies.forEach(enemy => {
        if (enemy.currentHp > 0 && playerHp > 0) {
          const damage = Math.max(1, (enemy.attack || ENEMY_DEFAULT_ATTACK) - prev.player!.defense);
          playerHp = Math.max(0, playerHp - damage);
          enemyActionsLog.push(`${enemy.name}이(가) ${prev.player!.name}에게 ${damage}의 피해를 입혔다! (남은 HP: ${playerHp})`);
        }
      });
      
      if (enemyActionsLog.length > 0) {
        addLogEntry('combat_action', enemyActionsLog.join(' '));
      } else if (prev.currentEnemies.some(e => e.currentHp > 0)) { // Only log if there are living enemies
        addLogEntry('combat_action', "적들이 행동하지 못했다.");
      }


      const updatedPlayer = { ...prev.player, hp: playerHp };
      const finalPlayerState = calculateDerivedStats(updatedPlayer);
      
      return { 
        ...prev, 
        player: finalPlayerState, 
        combatTurn: 'player' as const, 
        combatMessage: finalPlayerState.hp <= 0 ? "플레이어 쓰러짐..." : `${prev.player!.name}의 턴!` 
      };
    });
    setTimeout(() => checkCombatEndCondition(), 0);
  }, [addLogEntry, checkCombatEndCondition]);


  useEffect(() => {
    if (gameState.isCombatActive && gameState.combatTurn === 'enemy' && !gameState.isGameOver && !gameState.pendingSafeSceneTransition) { 
      setGameState(prev => ({...prev, combatTurn: 'enemy_acting' as const, combatMessage: "적의 턴..."})); 
      setTimeout(() => {
        setGameState(current => {
            if (current.isCombatActive && current.combatTurn === 'enemy_acting' && !current.isGameOver && !current.pendingSafeSceneTransition) {
                processEnemyTurns();
            }
            return current;
        });
      }, gameState.isDelegationModeActive ? 500 : 1000); 
    }
  }, [gameState.combatTurn, gameState.isCombatActive, gameState.isGameOver, processEnemyTurns, gameState.isDelegationModeActive, gameState.pendingSafeSceneTransition]);


  const handlePlayerAttack = useCallback((targetEnemyCombatId: string) => {
    setGameState(prev => {
      if (!prev.isCombatActive || prev.combatTurn !== 'player' || !prev.player || prev.pendingSafeSceneTransition) return prev;

      const targetEnemyIndex = prev.currentEnemies.findIndex(e => e.combatId === targetEnemyCombatId);
      if (targetEnemyIndex === -1) {
        addLogEntry('error', '잘못된 대상입니다.');
        return prev;
      }

      const targetEnemy = prev.currentEnemies[targetEnemyIndex];
      if (targetEnemy.currentHp <= 0) {
        addLogEntry('system', `${targetEnemy.name}은(는) 이미 쓰러져 있습니다.`);
        return prev;
      }
      
      const damage = Math.max(1, prev.player.attack - (targetEnemy.defense || 0));
      const newEnemyHp = Math.max(0, targetEnemy.currentHp - damage);

      const updatedEnemies = [...prev.currentEnemies];
      updatedEnemies[targetEnemyIndex] = { ...targetEnemy, currentHp: newEnemyHp };

      addLogEntry('combat_action', `${prev.player.name}이(가) ${targetEnemy.name}에게 공격! ${damage}의 피해를 입혔다.`);
      if (newEnemyHp <= 0) {
        addLogEntry('combat_result', `${targetEnemy.name}을(를) 쓰러뜨렸다!`);
      }
      
      return { 
        ...prev, 
        currentEnemies: updatedEnemies, 
        combatTurn: 'enemy' as const, 
        playerTargetId: null, 
        activeSkill: null,
        combatMessage: "적의 턴으로 넘어갑니다."
      };
    });
    setTimeout(() => checkCombatEndCondition(), 0);

  }, [addLogEntry, checkCombatEndCondition]);

  const handlePlayerSkill = useCallback((skillId: string, targetEnemyCombatId?: string) => {
    setGameState(prev => {
      if (!prev.isCombatActive || prev.combatTurn !== 'player' || !prev.player || prev.pendingSafeSceneTransition) return prev;
      
      const skill = getSkillDefinition(skillId);
      if (!skill) {
        addLogEntry('error', '알 수 없는 스킬입니다.');
        return prev;
      }
      if (prev.player.mp < skill.mpCost) {
        addLogEntry('system', 'MP가 부족합니다.');
        return prev;
      }

      let updatedPlayer = { ...prev.player, mp: prev.player.mp - skill.mpCost };
      let updatedEnemies = [...prev.currentEnemies];
      let logMsg = `${updatedPlayer.name}이(가) ${skill.name} 사용! (MP ${skill.mpCost} 소모)`;

      switch (skill.effectType) {
        case 'damage_hp':
          if (skill.targetType === 'enemy_single') {
            if (!targetEnemyCombatId) { 
              addLogEntry('error', '스킬 대상을 선택해야 합니다.');
              return { ...prev, activeSkill: skill, playerTargetId: null }; 
            }
            const targetIdx = updatedEnemies.findIndex(e => e.combatId === targetEnemyCombatId);
            if (targetIdx === -1 || updatedEnemies[targetIdx].currentHp <= 0) {
              addLogEntry('error', '잘못된 대상이거나 이미 쓰러진 적입니다.');
              return { ...prev, activeSkill: skill, playerTargetId: null };
            }
            const enemy = updatedEnemies[targetIdx];
            const damage = Math.max(1, (skill.effectValue || 0) + prev.player.attack - (enemy.defense || 0)); 
            enemy.currentHp = Math.max(0, enemy.currentHp - damage);
            logMsg += ` ${enemy.name}에게 ${damage}의 피해!`;
            if (enemy.currentHp <= 0) logMsg += ` ${enemy.name}을(를) 쓰러뜨렸다!`;
          } else if (skill.targetType === 'enemy_all') {
            let anyEnemyHit = false;
            updatedEnemies = updatedEnemies.map(enemy => {
              if (enemy.currentHp > 0) {
                anyEnemyHit = true;
                const damage = Math.max(1, (skill.effectValue || 0) + prev.player.attack - (enemy.defense || 0));
                const oldHp = enemy.currentHp;
                enemy.currentHp = Math.max(0, enemy.currentHp - damage);
                logMsg += ` ${enemy.name}에게 ${damage}의 피해!`;
                if (enemy.currentHp <= 0 && oldHp > 0) logMsg += ` (${enemy.name} 쓰러짐)`;
              }
              return enemy;
            });
            if (!anyEnemyHit) logMsg += ' 하지만 모든 적이 이미 쓰러져 있었다.';
          }
          break;
        case 'heal_hp':
          if (skill.targetType === 'self') {
            const healAmount = skill.effectValue || 0;
            updatedPlayer.hp = Math.min(updatedPlayer.maxHp, updatedPlayer.hp + healAmount);
            logMsg += ` 자신의 HP를 ${healAmount} 회복했다. (현재 HP: ${updatedPlayer.hp})`;
          }
          break;
        case 'heal_mp':
          if (skill.targetType === 'self') {
            const healAmount = skill.effectValue || 0;
            updatedPlayer.mp = Math.min(updatedPlayer.maxMp, updatedPlayer.mp + healAmount);
            logMsg += ` 자신의 MP를 ${healAmount} 회복했다. (현재 MP: ${updatedPlayer.mp})`;
          }
          break;
        case 'buff_defense':
          if (skill.targetType === 'self') {
            logMsg += ` 자신의 방어력을 증가시켰습니다. (효과 ${skill.effectTurns}턴 지속, 상세 효과는 추후 구현)`;
          }
          break;
        default:
          logMsg += ' 하지만 아무 일도 일어나지 않았다... (미구현 효과)';
          break;
      }
      
      addLogEntry('combat_action', logMsg);
      
      const finalPlayerState = calculateDerivedStats(updatedPlayer);
      return { 
        ...prev, 
        player: finalPlayerState, 
        currentEnemies: updatedEnemies, 
        combatTurn: 'enemy' as const, 
        playerTargetId: null, 
        activeSkill: null,
        combatMessage: "적의 턴으로 넘어갑니다."
      };
    });
     setTimeout(() => checkCombatEndCondition(), 0);
  }, [addLogEntry, checkCombatEndCondition]);


  const handlePlayerUseItemInCombat = useCallback((itemId: string, targetEnemyCombatId?: string) => {
    setGameState(prev => {
      if (!prev.isCombatActive || prev.combatTurn !== 'player' || !prev.player || prev.pendingSafeSceneTransition) return prev;

      const itemIndex = prev.player.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) {
        addLogEntry('error', "가방에 해당 아이템이 없습니다.");
        return prev;
      }
      const itemToUse = { ...prev.player.inventory[itemIndex] };
       if (itemToUse.type !== 'consumable' || !itemToUse.effects) {
        addLogEntry('system', `${itemToUse.name}은(는) 전투 중에 사용할 수 없습니다.`);
        return prev;
      }

      let updatedPlayer = { ...prev.player };
      let updatedEnemies = [...prev.currentEnemies];
      let logMsg = `${updatedPlayer.name}이(가) ${itemToUse.name}을(를) 사용!`;
      let effectApplied = false;

      if (itemToUse.effects.hp && itemToUse.effects.hp > 0) { 
         const healAmount = itemToUse.effects.hp;
         updatedPlayer.hp = Math.min(updatedPlayer.maxHp, updatedPlayer.hp + healAmount);
         logMsg += ` HP를 ${healAmount} 회복했다. (현재 HP: ${updatedPlayer.hp})`;
         effectApplied = true;
      } 
      else if (itemToUse.effects.mp && itemToUse.effects.mp > 0) {
        const mpAmount = itemToUse.effects.mp;
        updatedPlayer.mp = Math.min(updatedPlayer.maxMp, updatedPlayer.mp + mpAmount);
        logMsg += ` MP를 ${mpAmount} 회복했다. (현재 MP: ${updatedPlayer.mp})`;
        effectApplied = true;
      }
      else if (itemToUse.effects.attack && itemToUse.effects.attack > 0) { 
        if (!targetEnemyCombatId) {
            addLogEntry('error', '아이템 대상을 선택해야 합니다. (이 아이템은 적에게 사용합니다)');
             // Set up for targeting next if item requires it
            return { ...prev, playerTargetId: null, activeSkill: {id: itemId, name: itemToUse.name, description: '아이템 사용 대상 선택', mpCost:0, effectType: 'etc', targetType:'enemy_single' } };
        }
        const targetIdx = updatedEnemies.findIndex(e => e.combatId === targetEnemyCombatId);
        if (targetIdx === -1 || updatedEnemies[targetIdx].currentHp <= 0) {
            addLogEntry('error', '잘못된 대상이거나 이미 쓰러진 적입니다.');
            return { ...prev, playerTargetId: null, activeSkill: null };
        }
        const enemy = updatedEnemies[targetIdx];
        const damage = Math.max(1, (itemToUse.effects.attack || 0) - (enemy.defense || 0)); 
        enemy.currentHp = Math.max(0, enemy.currentHp - damage);
        logMsg += ` ${enemy.name}에게 ${damage}의 피해!`;
        if (enemy.currentHp <= 0) logMsg += ` ${enemy.name}을(를) 쓰러뜨렸다!`;
        effectApplied = true;
      } else {
        logMsg += ' 하지만 전투에 큰 영향은 없었다.';
        addLogEntry('combat_action', logMsg);
        return prev; 
      }

      if (!effectApplied) {
         addLogEntry('system', `${itemToUse.name}을(를) 사용했지만 전투에 큰 영향은 없었다.`);
         return prev;
      }

      let newInventory = [...updatedPlayer.inventory];
      if (itemToUse.quantity > 1) {
        newInventory[itemIndex] = { ...itemToUse, quantity: itemToUse.quantity - 1 };
      } else {
        newInventory.splice(itemIndex, 1);
      }
      updatedPlayer.inventory = newInventory;
      addLogEntry('combat_action', logMsg);
      
      const finalPlayerState = calculateDerivedStats(updatedPlayer);
      return { 
        ...prev, 
        player: finalPlayerState, 
        currentEnemies: updatedEnemies, 
        combatTurn: 'enemy' as const, 
        playerTargetId: null, 
        activeSkill: null,
        combatMessage: "적의 턴으로 넘어갑니다."
      };
    });
    setTimeout(() => checkCombatEndCondition(), 0);
  }, [addLogEntry, checkCombatEndCondition]);

  const handleFleeAttempt = useCallback(() => {
    setGameState(prev => {
      if (!prev.isCombatActive || prev.combatTurn !== 'player' || !prev.player || !prev.currentScene || prev.pendingSafeSceneTransition) return prev;
      
      if (prev.currentScene.type === SceneType.COMBAT_BOSS) {
        addLogEntry('combat_action', '강력한 적에게서는 도망칠 수 없다!');
        return { ...prev, combatMessage: "도망칠 수 없다!" };
      }

      const fleeSuccess = Math.random() < 0.5; 

      if (fleeSuccess) {
        addLogEntry('combat_result', '도망에 성공했다!');
        let nextSceneIdToAdvance : string | null = null;

        if (prev.isDelegationModeActive) {
           nextSceneIdToAdvance = prev.currentScene.nextSceneId ?? null;
            if (nextSceneIdToAdvance) {
               addLogEntry('system', "[전투 위임] 도망 후 다음 장면으로 진행합니다.");
            } else {
               addLogEntry('system', "[전투 위임] 도망 후 다음 장면이 없습니다.");
            }
        } else {
            nextSceneIdToAdvance = prev.currentScene.nextSceneId ?? null; 
            if (!nextSceneIdToAdvance) {
               addLogEntry('system', '전투 지역에서 벗어났습니다. 다음 행동을 선택하세요.');
            }
        }
        
        if (nextSceneIdToAdvance) {
            const targetSceneId = nextSceneIdToAdvance; 
            setTimeout(() => advanceToScene(targetSceneId), 1000);
        }

        return { 
            ...prev, 
            isCombatActive: false, 
            combatTurn: null, 
            combatMessage: "도망 성공!",
            awaitingPostDelegatedNormalCombatChoice: false, 
            currentEnemies: [], 
        }; 
      } else {
        addLogEntry('combat_action', '도망에 실패했다...');
        return { ...prev, combatTurn: 'enemy' as const, playerTargetId: null, activeSkill: null, combatMessage: "도망 실패! 적의 턴!" };
      }
    });
  }, [addLogEntry, advanceToScene]);

  const restartCurrentCombat = useCallback(() => {
    setGameState(prev => {
      if (!prev.currentScene || prev.isCombatActive || 
          (prev.currentScene.type !== SceneType.COMBAT_NORMAL && prev.currentScene.type !== SceneType.COMBAT_BOSS)) {
        addLogEntry('error', '현재 장면에서 전투를 다시 시작할 수 없습니다.');
        return prev;
      }
      addLogEntry('system', `${prev.currentScene.title}의 적들과 다시 전투를 시작합니다.`);
      return { 
        ...prev, 
        isLoading: true, 
        awaitingPostDelegatedNormalCombatChoice: false,
        pendingSafeSceneTransition: null, 
      }; 
    });
    
    setTimeout(() => { 
      setGameState(currentPrev => {
        const sceneToRestart = currentPrev.currentScene; 
        if (sceneToRestart && (sceneToRestart.type === SceneType.COMBAT_NORMAL || sceneToRestart.type === SceneType.COMBAT_BOSS)) {
          return {...currentPrev, isLoading: false, isCombatActive: false}; 
        }
        return {...currentPrev, isLoading: false};
      });
    }, 0);

  }, [addLogEntry]);


  const loadScript = useCallback((jsonString: string) => {
    setGameState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null, 
        isCombatActive: false, 
        currentEnemies: [],
        awaitingPostDelegatedNormalCombatChoice: false,
        lastVisitedTownSceneId: null,
        pendingSafeSceneTransition: null,
    })); 
    try {
      const parsedScript = JSON.parse(jsonString) as GameScript;
      if (!parsedScript.stages || parsedScript.stages.length === 0) {
        throw new Error("잘못된 스크립트: 스테이지를 찾을 수 없습니다.");
      }
      if (!parsedScript.stages[0].scenes || parsedScript.stages[0].scenes.length === 0) {
        throw new Error("잘못된 스크립트: 첫 번째 스테이지에 장면이 없습니다.");
      }

      const firstStage = parsedScript.stages[0];
      const firstScene = firstStage.scenes[0];
      const player = initializePlayer(parsedScript, firstStage);
      
      const initialLocation = firstScene.newLocationName || player.currentLocation;
      player.currentLocation = initialLocation;
      
      let newLastVisitedTownId = null;
      if (firstScene.type === SceneType.TOWN) {
        newLastVisitedTownId = firstScene.id;
      }
      
      addLogEntry('system', `게임 스크립트 "${parsedScript.worldSettings.title}"을(를) 성공적으로 불러왔습니다.`);
      addLogEntry('location', `현재 위치: ${initialLocation}.`);
      
      if (firstScene.type !== SceneType.COMBAT_NORMAL && firstScene.type !== SceneType.COMBAT_BOSS && firstScene.content) {
         if (firstScene.type === SceneType.DIALOGUE) {
            // Dialogue is handled by useEffect
         } else if (firstScene.type !== SceneType.CHOICE){
            addLogEntry('narration', firstScene.content);
         }
      }
      
      saveToLocalStorage(LOCAL_STORAGE_SCRIPT_KEY, parsedScript);

      setGameState(prev => ({
        ...prev,
        script: parsedScript,
        currentStage: firstStage,
        currentScene: firstScene,
        player,
        gameLog: prev.gameLog, 
        isLoading: false,
        error: null,
        isGameOver: false,
        awaitingPostDelegatedNormalCombatChoice: false,
        lastVisitedTownSceneId: newLastVisitedTownId,
        pendingSafeSceneTransition: null,
      }));
      
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "스크립트 분석에 실패했습니다.";
      console.error(errorMessage, e);
      setGameState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: errorMessage, 
          script: null,
          awaitingPostDelegatedNormalCombatChoice: false,
          lastVisitedTownSceneId: null,
          pendingSafeSceneTransition: null,
      }));
      removeFromLocalStorage(LOCAL_STORAGE_SCRIPT_KEY);
      removeFromLocalStorage(LOCAL_STORAGE_GAME_STATE_KEY); // Also remove game state on script error
    }
  }, [initializePlayer, addLogEntry]);


  useEffect(() => {
    if (!gameState.isCombatActive && gameState.currentScene?.type === SceneType.DIALOGUE && 
        gameState.currentStage && gameState.player && !gameState.isGameOver && !gameState.pendingSafeSceneTransition) {
      const scene = gameState.currentScene;
      const stage = gameState.currentStage;
      
      if (scene.characterIds.length > 0) {
        const npc = stage.characters.find(c => c.id === scene.characterIds[0]); 
        if (npc) {
          const dialogue = npc.dialogueSeed || `${npc.name}은(는) 할 말이 없습니다.`;
          const lastLog = gameState.gameLog.length > 0 ? gameState.gameLog[gameState.gameLog.length -1] : null;
          if (!lastLog || !(lastLog.type === 'dialogue' && lastLog.speaker === npc.name && lastLog.message === dialogue)) {
             addLogEntry('dialogue', dialogue, npc.name);
          }
        } else {
           addLogEntry('error', `ID ${scene.characterIds[0]}를 가진 NPC를 대화에서 찾을 수 없습니다.`, '시스템');
        }
      } else if (scene.content && scene.characterIds.length === 0) { // If dialogue type but no character, show content as narration
         const lastLog = gameState.gameLog.length > 0 ? gameState.gameLog[gameState.gameLog.length -1] : null;
         if (!lastLog || !(lastLog.type === 'narration' && lastLog.message === scene.content)) {
            addLogEntry('narration', scene.content);
         }
      }
    }
  }, [gameState.currentScene, gameState.currentStage, gameState.player, addLogEntry, gameState.isGameOver, gameState.isCombatActive, gameState.gameLog, gameState.pendingSafeSceneTransition]);


  const makeChoice = useCallback((choice: SceneChoice) => {
    if (gameState.isGameOver || gameState.isCombatActive) return;
    addLogEntry('event', `선택: "${choice.text}"`);
    advanceToScene(choice.nextSceneId);
  }, [advanceToScene, addLogEntry, gameState.isGameOver, gameState.isCombatActive]);

  const resetGame = useCallback(() => {
    removeFromLocalStorage(LOCAL_STORAGE_SCRIPT_KEY);
    removeFromLocalStorage(LOCAL_STORAGE_GAME_STATE_KEY); // Clear saved game state
    
    const currentLog = gameState.gameLog; // Preserve log temporarily
    setGameState(initialLogicState); // Reset to initial state

    // Re-add a reset message to the (now empty) log
    setGameState(prev => {
        const resetMessageEntry: GameLogEntry = { 
            id: crypto.randomUUID(), 
            type: 'system', 
            message: '게임이 초기화되었습니다. 새 스크립트를 불러오거나 저장된 게임을 로드하세요.', 
            timestamp: Date.now() 
        };
        return {
            ...prev, // prev here is initialLogicState
            gameLog: [...currentLog, resetMessageEntry].slice(-100)
        };
    });
  }, [gameState.gameLog]);
  
  const clearActiveGameSessionInMemory = useCallback(() => {
    const currentLogFromClosure = gameState.gameLog; // Preserve log from closure
    setGameState(prevState => { // Use prevState if you need anything from it, though this logic resets to initialLogicState mostly
      const newLogEntry: GameLogEntry = {
        id: crypto.randomUUID(),
        type: 'system',
        message: '활성 게임 세션이 메모리에서 초기화되었습니다. 메인 메뉴로 이동합니다.',
        timestamp: Date.now()
      };
      return {
        ...initialLogicState, // Reset to initial empty state for game data
        gameLog: [...currentLogFromClosure, newLogEntry].slice(-100),
        // Persist any states that are not part of a single game session if necessary
        // For example, if there were global settings, they would be preserved:
        // someGlobalSetting: prevState.someGlobalSetting 
      };
    });
  }, [gameState.gameLog]);


  const useItem = useCallback((itemId: string) => { 
    if (gameState.isCombatActive) {
      addLogEntry('system', "전투 중에는 이 방법으로 아이템을 사용할 수 없습니다. 전투 메뉴를 이용하세요.");
      return;
    }
    setGameState(prev => {
      if (!prev.player || prev.isGameOver) return prev;
      let player = { ...prev.player };
      const itemIndex = player.inventory.findIndex(i => i.id === itemId);

      if (itemIndex === -1) {
        addLogEntry('error', "가방에 해당 아이템이 없습니다.");
        return prev;
      }

      const itemToUse = player.inventory[itemIndex];
      if (itemToUse.type !== 'consumable' || !itemToUse.effects) {
        addLogEntry('system', `${itemToUse.name}은(는) 이런 방식으로 사용할 수 없습니다.`);
        return prev;
      }

      let effectApplied = false;
      let logMessage = `${itemToUse.name}을(를) 사용했습니다.`;

      if (itemToUse.effects.hp) {
        const oldHp = player.hp;
        player.hp = Math.min(player.maxHp, player.hp + itemToUse.effects.hp);
        logMessage += ` HP ${player.hp - oldHp} 회복.`;
        effectApplied = true;
      }
      if (itemToUse.effects.mp) {
         const oldMp = player.mp;
        player.mp = Math.min(player.maxMp, player.mp + itemToUse.effects.mp);
        logMessage += ` MP ${player.mp - oldMp} 회복.`;
        effectApplied = true;
      }
      
      if(effectApplied) {
        addLogEntry('event', logMessage);
      } else {
        addLogEntry('system', `${itemToUse.name}을(를) 사용했지만 아무 효과가 없었습니다.`);
        return prev; 
      }

      let newInventory = [...player.inventory];
      if (itemToUse.quantity > 1) {
        newInventory[itemIndex] = { ...itemToUse, quantity: itemToUse.quantity - 1 };
      } else {
        newInventory.splice(itemIndex, 1);
      }
      player.inventory = newInventory;
      return { ...prev, player: calculateDerivedStats(player) };
    });
  }, [addLogEntry, gameState.isCombatActive]);

  const toggleEquipment = useCallback((itemToToggle: GameItem) => {
    if (gameState.isCombatActive) {
        addLogEntry('system', "전투 중에는 장비를 변경할 수 없습니다.");
        return;
    }
    setGameState(prev => {
      if (!prev.player || !itemToToggle.equipSlot || prev.isGameOver) return prev;
      
      let modifiablePlayer = JSON.parse(JSON.stringify(prev.player)) as PlayerState; 
      const slot = itemToToggle.equipSlot;
      
      const currentlyEquipped = modifiablePlayer.equipment[slot];
      const invItemIndex = modifiablePlayer.inventory.findIndex(i => i.id === itemToToggle.id);

      if (currentlyEquipped && currentlyEquipped.id === itemToToggle.id) { 
        modifiablePlayer.equipment[slot] = null;
        const existingInvItemIndex = modifiablePlayer.inventory.findIndex(i => i.id === itemToToggle.id);
        if (existingInvItemIndex > -1) {
          modifiablePlayer.inventory[existingInvItemIndex].quantity += 1;
        } else {
          modifiablePlayer.inventory.push({ ...itemToToggle, quantity: 1 });
        }
        addLogEntry('system', `${itemToToggle.name}을(를) 해제했습니다.`);

      } else { 
        if (currentlyEquipped) {
          const existingInvItemIndexForOld = modifiablePlayer.inventory.findIndex(i => i.id === currentlyEquipped.id);
            if (existingInvItemIndexForOld > -1) {
                modifiablePlayer.inventory[existingInvItemIndexForOld].quantity +=1;
            } else {
                modifiablePlayer.inventory.push({ ...currentlyEquipped, quantity: 1 });
            }
          addLogEntry('system', `${currentlyEquipped.name}을(를) 해제하고 ${itemToToggle.name}을(를) 장착합니다.`);
        } else {
           addLogEntry('system', `${itemToToggle.name}을(를) 장착했습니다.`);
        }
        
        modifiablePlayer.equipment[slot] = { ...itemToToggle, quantity: 1 }; 

        if (invItemIndex !== -1) {
          if (modifiablePlayer.inventory[invItemIndex].quantity > 1) {
            modifiablePlayer.inventory[invItemIndex].quantity -= 1;
          } else {
            modifiablePlayer.inventory.splice(invItemIndex, 1);
          }
        } else {
          // This case should not happen if equipping from inventory.
          // If it was a starter item not in inventory, it's fine.
          console.warn("장착하려는 아이템이 인벤토리에 없습니다 (이미 장착된 아이템을 교체하는 경우가 아님):", itemToToggle.name);
        }
      }
      return { ...prev, player: calculateDerivedStats(modifiablePlayer) };
    });
  }, [addLogEntry, gameState.isCombatActive]);

  const restPlayer = useCallback(() => {
    if (gameState.isCombatActive) {
        addLogEntry('system', "전투 중에는 휴식할 수 없습니다.");
        return;
    }
    setGameState(prev => {
      if (!prev.player || prev.isGameOver) return prev;
      const restedPlayer = {
        ...prev.player,
        hp: prev.player.maxHp,
        mp: prev.player.maxMp,
      };
      addLogEntry('event', `${prev.player.name}님은 편안한 휴식을 취해 HP와 MP를 모두 회복했습니다.`);
      return { ...prev, player: restedPlayer };
    });
  }, [addLogEntry, gameState.isCombatActive]);

  const openShop = useCallback((sceneId: string) => {
    if (gameState.isGameOver || !gameState.player || gameState.isCombatActive) return;
    
    const scene = gameState.script?.stages.find(st => st.id === gameState.currentStage?.id)?.scenes.find(sc => sc.id === sceneId);
    const townName = scene?.title || "한 마을";

    let itemsToLoadIds = SHOP_INVENTORIES[sceneId];
    let shopLogMessage: string;

    if (itemsToLoadIds && itemsToLoadIds.length > 0) {
      shopLogMessage = `${townName}의 상점에 방문했습니다. 특별한 물품을 판매하고 있습니다.`;
    } else {
      itemsToLoadIds = DEFAULT_SHOP_ITEM_IDS; 
      shopLogMessage = `${townName}의 상점에 방문했습니다. 기본적인 물품을 판매하고 있습니다.`;
    }
    
    if (itemsToLoadIds && itemsToLoadIds.length > 0) {
      const itemsForSale = itemsToLoadIds
        .map(id => getItemDefinition(id))
        .filter(item => item !== undefined) as GameItem[];
      
      setGameState(prev => ({
        ...prev,
        isShopOpen: true,
        currentShopId: sceneId,
        currentShopItems: itemsForSale,
        shopError: null,
      }));
      addLogEntry('system', shopLogMessage);
    } else {
      setGameState(prev => ({
        ...prev,
        isShopOpen: true,
        currentShopId: sceneId,
        currentShopItems: [],
        shopError: "이 상점에는 현재 판매할 물품이 없습니다.",
      }));
      addLogEntry('system', `${townName}의 상점에는 판매할 물품이 없습니다.`);
    }
  }, [addLogEntry, gameState.isGameOver, gameState.player, gameState.isCombatActive, gameState.script, gameState.currentStage]);

  const closeShop = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isShopOpen: false,
      currentShopId: null,
      currentShopItems: [],
      shopError: null,
    }));
  }, []);

  const buyItem = useCallback((itemId: string, quantity: number) => {
    setGameState(prev => {
      if (!prev.player || prev.isGameOver || quantity <= 0) return prev;
      
      const itemDef = getItemDefinition(itemId);
      if (!itemDef) {
        return { ...prev, shopError: "알 수 없는 아이템입니다." };
      }
      if (itemDef.sellPrice === undefined || itemDef.sellPrice <= 0) {
        return { ...prev, shopError: `${itemDef.name}은(는) 구매할 수 없는 아이템입니다.` };
      }

      const buyPrice = itemDef.sellPrice * DEFAULT_BUY_PRICE_MULTIPLIER;
      const totalCost = buyPrice * quantity;

      if (prev.player.gold < totalCost) {
        return { ...prev, shopError: "골드가 부족합니다." };
      }

      let updatedPlayer = { ...prev.player, gold: prev.player.gold - totalCost };
      updatedPlayer = addItemToInventory(updatedPlayer, itemDef, quantity);
      
      addLogEntry('reward', `${itemDef.name} ${quantity}개를 구매했습니다. (${totalCost}G 소모)`);
      return { ...prev, player: calculateDerivedStats(updatedPlayer), shopError: null };
    });
  }, [addLogEntry]);

  const sellItem = useCallback((itemId: string, quantity: number) => {
    setGameState(prev => {
      if (!prev.player || prev.isGameOver || quantity <= 0) return prev;

      const itemIndex = prev.player.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) {
        return { ...prev, shopError: "판매할 아이템이 없습니다." };
      }

      const itemToSell = { ...prev.player.inventory[itemIndex] }; 
      if (itemToSell.quantity < quantity) {
        return { ...prev, shopError: "판매할 아이템의 수량이 부족합니다." };
      }
      if (itemToSell.sellPrice === undefined || itemToSell.sellPrice <= 0) {
        return { ...prev, shopError: `${itemToSell.name}은(는) 판매할 수 없는 아이템입니다.` };
      }

      const totalGain = itemToSell.sellPrice * quantity;
      let updatedPlayer = { ...prev.player, gold: prev.player.gold + totalGain };
      
      let newInventory = [...updatedPlayer.inventory];
      if (itemToSell.quantity - quantity > 0) {
        newInventory[itemIndex] = { ...itemToSell, quantity: itemToSell.quantity - quantity };
      } else {
        newInventory.splice(itemIndex, 1);
      }
      updatedPlayer.inventory = newInventory;

      addLogEntry('reward', `${itemToSell.name} ${quantity}개를 판매했습니다. (${totalGain}G 획득)`);
      return { ...prev, player: calculateDerivedStats(updatedPlayer), shopError: null };
    });
  }, [addLogEntry]);


  const saveFullGameState = useCallback(() => {
    if (gameState.player && gameState.script) {
      try {
        saveToLocalStorage(LOCAL_STORAGE_GAME_STATE_KEY, gameState);
        addLogEntry('system', '게임 상태가 성공적으로 저장되었습니다.');
      } catch (e) {
        console.error("게임 상태 저장 실패:", e);
        addLogEntry('error', '게임 상태 저장에 실패했습니다.');
      }
    } else {
      addLogEntry('error', '저장할 게임 데이터가 없습니다.');
    }
  }, [gameState, addLogEntry]);

  const loadFullGameState = useCallback((): boolean => {
    const loadedState = loadFromLocalStorage<GameLogicState>(LOCAL_STORAGE_GAME_STATE_KEY);
    if (loadedState && loadedState.script && loadedState.player) {
      // Ensure loaded player stats are recalculated if needed, though they should be saved correctly.
      // Make sure the loaded player object is complete before calculateDerivedStats
      const playerWithRecalculatedStats = calculateDerivedStats(loadedState.player);
      
      setGameState({
        ...loadedState,
        player: playerWithRecalculatedStats, // Use recalculated player state
        isLoading: false, 
        error: null,
        // Ensure log is an array even if corrupted
        gameLog: Array.isArray(loadedState.gameLog) ? loadedState.gameLog : [], 
      });
      addLogEntry('system', '저장된 게임 상태를 성공적으로 불러왔습니다.');
      return true;
    } else {
      addLogEntry('error', '저장된 게임 상태를 불러오는 데 실패했거나, 저장된 데이터가 없습니다.');
      removeFromLocalStorage(LOCAL_STORAGE_GAME_STATE_KEY); // Remove potentially corrupted data
      return false;
    }
  }, [addLogEntry, setGameState]);


  useEffect(() => {
    // This effect is primarily for initializing the log if empty.
    // Actual script/game loading is handled by App.tsx choices.
    if (gameState.gameLog.length === 0 && !gameState.isLoading && !gameState.error) {
       // Check if there is a saved game state. App.tsx will use this info.
       const savedGame = loadFromLocalStorage<GameLogicState>(LOCAL_STORAGE_GAME_STATE_KEY);
       if (!savedGame) { // Only add "no script" if no full game state either
            const savedScript = loadFromLocalStorage<GameScript>(LOCAL_STORAGE_SCRIPT_KEY);
            if (!savedScript) {
                addLogEntry('system', '저장된 스크립트나 게임 상태가 없습니다. 새 스크립트를 불러오거나 기본 게임을 시작하세요.');
            }
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const setPlayerTarget = useCallback((enemyCombatId: string | null) => {
    setGameState(prev => ({...prev, playerTargetId: enemyCombatId}));
  }, []);

  const setActiveSkillForTargeting = useCallback((skill: Skill | null) => {
    setGameState(prev => ({...prev, activeSkill: skill, playerTargetId: null })); 
  }, []);

  const performDelegatedAction = useCallback(() => {
    const { isLoading, isGameOver, combatTurn, player, currentEnemies, isDelegationModeActive, isCombatActive, pendingSafeSceneTransition } = gameState;

    if (isLoading || isGameOver || !player || player.hp <= 0 || !isDelegationModeActive || !isCombatActive || pendingSafeSceneTransition) {
        return;
    }

    if (combatTurn === 'player') { 
        const livingEnemies = currentEnemies.filter(e => e.currentHp > 0);
        if (livingEnemies.length > 0) {
            const targetEnemy = livingEnemies[0]; 
            addLogEntry('system', `[전투 위임] ${targetEnemy.name}을(를) 자동으로 공격합니다.`);
            handlePlayerAttack(targetEnemy.combatId);
        }
        return; 
    }
  }, [gameState, handlePlayerAttack, addLogEntry]);


  return { 
    ...gameState, 
    loadScript, 
    advanceToScene, 
    makeChoice, 
    resetGame,
    clearActiveGameSessionInMemory,
    addLogEntry, 
    useItem, 
    toggleEquipment, 
    restPlayer, 
    openShop, 
    closeShop, 
    buyItem, 
    sellItem,
    handlePlayerAttack,
    handlePlayerSkill,
    handlePlayerUseItemInCombat,
    handleFleeAttempt,
    setPlayerTarget,
    setActiveSkillForTargeting,
    restartCurrentCombat,
    toggleDelegationMode, 
    performDelegatedAction,
    saveFullGameState,
    loadFullGameState,
  };
};
