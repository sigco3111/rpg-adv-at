export interface WorldSettings {
  title: string;
  description: string;
  mainConflict?: string;
  keyLocations?: string;
}

export enum CharacterType {
  PLAYER = "플레이어 캐릭터",
  NPC = "NPC",
  MONSTER_NORMAL = "일반 몬스터",
  MONSTER_BOSS = "보스 몬스터",
}

export interface Character {
  id: string;
  name: string;
  type: CharacterType;
  description: string;
  dialogueSeed: string | null;
  hp?: number;
  maxHp?: number;
  attack?: number;
  defense?: number; // Added for enemies
  skills?: string[]; // IDs of skills the character knows (for enemies)
  currentHp?: number; // For managing enemy HP in combat
}

export interface CombatEnemyInstance extends Character {
  combatId: string; // Unique ID for this combat instance
  currentHp: number; // Ensure currentHp is always present for combat enemies
  maxHp: number; // Ensure maxHp is always present
}


export interface CombatDetails {
  enemyCharacterIds: string[];
  reward: string; 
}

export interface SceneChoice {
  id: string;
  text: string;
  nextSceneId: string;
}

export enum SceneType {
  NARRATION = "나레이션",
  LOCATION_CHANGE = "장소 변경",
  TOWN = "마을",
  DIALOGUE = "대화",
  COMBAT_NORMAL = "일반 전투",
  ITEM_GET = "아이템 획득",
  CHOICE = "선택",
  COMBAT_BOSS = "보스 전투",
}

export interface Scene {
  id: string;
  stageId: string;
  title: string;
  type: SceneType;
  content: string;
  characterIds: string[]; 
  nextSceneId: string | null;
  newLocationName?: string;
  combatDetails?: CombatDetails;
  item?: string; // Name of the item received
  choices?: SceneChoice[];
}

export interface Stage {
  id: string;
  title: string;
  settingDescription: string;
  characters: Character[];
  scenes: Scene[];
}

export interface GameScript {
  worldSettings: WorldSettings;
  stages: Stage[];
}

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export interface GameItemEffect {
  hp?: number;
  mp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  luck?: number;
  critChance?: number;
}

export interface GameItem {
  id: string;
  name: string;
  description: string;
  type: 'consumable' | 'weapon' | 'armor' | 'accessory' | 'keyItem';
  quantity: number;
  effects?: GameItemEffect;
  equipSlot?: EquipmentSlot;
  sellPrice?: number;
  icon?: string; // e.g., emoji or path to image
}

export interface PlayerEquipment {
  weapon: GameItem | null;
  armor: GameItem | null;
  accessory: GameItem | null;
}

export interface PlayerState {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  exp: number;
  expToNextLevel: number;
  gold: number;
  // Core stats
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseLuck: number;
  // Derived stats (base + equipment)
  attack: number;
  defense: number;
  speed: number;
  luck: number;
  critChance: number; // Percentage
  
  inventory: GameItem[];
  equipment: PlayerEquipment;
  currentLocation: string;
  learnedSkillIds: string[]; // IDs of skills the player knows
}

export interface GameLogEntry {
  id: string;
  type: 'narration' | 'dialogue' | 'event' | 'reward' | 'error' | 'location' | 'system' | 'combat' | 'combat_action' | 'combat_result';
  speaker?: string; 
  message: string;
  timestamp: number;
}

// For Radar Chart
export interface StatChartData {
  subject: string;
  value: number;
  fullMark: number;
}

// Skill System Types
export type SkillTargetType = 'enemy_single' | 'enemy_all' | 'self' | 'ally_single' | 'none';
export type SkillEffectType = 
  | 'damage_hp' 
  | 'heal_hp' 
  | 'damage_mp' 
  | 'heal_mp' 
  | 'buff_attack' 
  | 'debuff_attack' 
  | 'buff_defense'
  | 'debuff_defense'
  | 'etc';

export interface Skill {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  effectValue?: number; // Base value for damage/heal/buff amount
  effectTurns?: number; // Duration for buffs/debuffs
  effectType: SkillEffectType;
  targetType: SkillTargetType;
  icon?: string; // e.g., emoji or path to image
}