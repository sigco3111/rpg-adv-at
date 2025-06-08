
import { GameItem, Skill } from "./types";

export const LOCAL_STORAGE_SCRIPT_KEY = 'jrpg_script_data'; // For saving the loaded script itself
export const LOCAL_STORAGE_GAME_STATE_KEY = 'jrpg_full_game_state'; // For saving the entire game progress

// Player Defaults
export const PLAYER_DEFAULT_LEVEL = 1;
export const PLAYER_DEFAULT_HP = 50;
export const PLAYER_DEFAULT_MP = 20;
export const PLAYER_DEFAULT_EXP = 0;
export const PLAYER_DEFAULT_EXP_TO_NEXT_LEVEL = 100;
export const PLAYER_DEFAULT_GOLD = 50;
export const PLAYER_DEFAULT_BASE_ATTACK = 10;
export const PLAYER_DEFAULT_BASE_DEFENSE = 5;
export const PLAYER_DEFAULT_BASE_SPEED = 7;
export const PLAYER_DEFAULT_BASE_LUCK = 5;
export const PLAYER_DEFAULT_CRIT_CHANCE = 5; // Percentage

// Level Up Constants
export const EXP_TO_NEXT_LEVEL_MULTIPLIER = 1.5;
export const LEVEL_UP_HP_GAIN = 10;
export const LEVEL_UP_MP_GAIN = 5;
export const LEVEL_UP_ATTACK_GAIN = 2;
export const LEVEL_UP_DEFENSE_GAIN = 1;
export const LEVEL_UP_SPEED_GAIN = 1;
export const LEVEL_UP_LUCK_GAIN = 1;


// Combat
export const ENEMY_DEFAULT_HP = 30;
export const ENEMY_DEFAULT_ATTACK = 8; 
export const ENEMY_DEFAULT_DEFENSE = 3;
export const BOSS_DEFAULT_HP_MULTIPLIER = 5; 
export const BOSS_DEFAULT_ATTACK_MULTIPLIER = 2.5;
export const BOSS_DEFAULT_DEFENSE_MULTIPLIER = 2.0;


export const COMBAT_REWARDS = {
  normal: { gold: 15, exp: 25 }, 
  boss: { gold: 150, exp: 100 }, 
};

// --- CONSUMABLES ---
export const ITEM_SMALL_POTION: GameItem = {
  id: 'item_consumable_potion_hp_small',
  name: '작은 HP 물약',
  description: 'HP를 25 회복합니다.',
  type: 'consumable',
  quantity: 0, 
  effects: { hp: 25 },
  sellPrice: 10,
  icon: '🧪'
};

export const ITEM_MEDIUM_POTION: GameItem = {
  id: 'item_consumable_potion_hp_medium',
  name: '중형 HP 물약',
  description: 'HP를 50 회복합니다.',
  type: 'consumable',
  quantity: 0,
  effects: { hp: 50 },
  sellPrice: 25,
  icon: '🧪✨'
};

export const ITEM_LARGE_POTION: GameItem = {
  id: 'item_consumable_potion_hp_large',
  name: '대형 HP 물약',
  description: 'HP를 100 회복합니다.',
  type: 'consumable',
  quantity: 0,
  effects: { hp: 100 },
  sellPrice: 60,
  icon: '🧪🧪'
};

export const ITEM_MP_POTION_SMALL: GameItem = {
  id: 'item_consumable_potion_mp_small',
  name: '작은 MP 물약',
  description: 'MP를 15 회복합니다.',
  type: 'consumable',
  quantity: 0,
  effects: { mp: 15 },
  sellPrice: 20,
  icon: '💧'
};

export const ITEM_MP_POTION_MEDIUM: GameItem = {
  id: 'item_consumable_potion_mp_medium',
  name: '중형 MP 물약',
  description: 'MP를 30 회복합니다.',
  type: 'consumable',
  quantity: 0,
  effects: { mp: 30 },
  sellPrice: 45,
  icon: '💧✨'
};

export const ITEM_MP_POTION_LARGE: GameItem = {
  id: 'item_consumable_potion_mp_large',
  name: '대형 MP 물약',
  description: 'MP를 60 회복합니다.',
  type: 'consumable',
  quantity: 0,
  effects: { mp: 60 },
  sellPrice: 90,
  icon: '💧💧'
};

export const ITEM_ELIXIR_SMALL: GameItem = {
  id: 'item_consumable_elixir_small',
  name: '작은 엘릭서',
  description: 'HP와 MP를 각각 50% 회복합니다.',
  type: 'consumable',
  quantity: 0,
  effects: { hp: 999, mp: 999 }, // Placeholder for percentage logic if implemented, otherwise large flat values
  sellPrice: 150,
  icon: '🍹'
};

export const ITEM_ELIXIR_LARGE: GameItem = {
  id: 'item_consumable_elixir_large',
  name: '엘릭서',
  description: 'HP와 MP를 모두 회복합니다.',
  type: 'consumable',
  quantity: 0,
  effects: { hp: 9999, mp: 9999 },
  sellPrice: 500,
  icon: '🍸'
};

export const ITEM_ANTIDOTE: GameItem = {
  id: 'item_consumable_antidote',
  name: '해독제',
  description: '독 상태를 치료합니다. (효과 미구현)',
  type: 'consumable',
  quantity: 0,
  sellPrice: 30,
  icon: '🌿'
};

export const ITEM_PHOENIX_DOWN: GameItem = {
  id: 'item_consumable_phoenix_down',
  name: '불사조의 깃털',
  description: '쓰러진 아군을 부활시킵니다. (효과 미구현)',
  type: 'consumable',
  quantity: 0,
  sellPrice: 300,
  icon: '깃' // Placeholder, needs better icon
};

export const ITEM_ARROW: GameItem = {
  id: 'item_consumable_arrow_standard',
  name: '일반 화살',
  description: '표준적인 화살. 약간의 관통력을 가집니다.',
  type: 'consumable', 
  quantity: 0,
  effects: { attack: 1 }, 
  sellPrice: 2,
  icon: '➹'
};

// --- WEAPONS ---
export const ITEM_BASIC_SWORD: GameItem = {
  id: 'item_weapon_sword_basic',
  name: '기본 검',
  description: '간단한 검. 공격력 +3.',
  type: 'weapon',
  quantity: 0, 
  equipSlot: 'weapon',
  effects: { attack: 3 },
  sellPrice: 15,
  icon: '⚔️'
};

export const ITEM_SHORT_BOW: GameItem = {
  id: 'item_weapon_bow_short',
  name: '단궁',
  description: '가벼운 나무 활. 공격력 +4.',
  type: 'weapon',
  quantity: 0,
  equipSlot: 'weapon',
  effects: { attack: 4 },
  sellPrice: 30,
  icon: '🏹'
};

export const ITEM_IRON_SWORD: GameItem = {
  id: 'item_weapon_sword_iron',
  name: '철제 검',
  description: '튼튼한 철로 만들어진 검. 공격력 +7.',
  type: 'weapon',
  quantity: 0,
  equipSlot: 'weapon',
  effects: { attack: 7 },
  sellPrice: 70,
  icon: '🗡️'
};

export const ITEM_HUNTERS_BOW: GameItem = {
  id: 'item_weapon_bow_hunter',
  name: '사냥꾼의 활',
  description: '정교하게 만들어진 활. 공격력 +6.',
  type: 'weapon',
  quantity: 0,
  equipSlot: 'weapon',
  effects: { attack: 6 },
  sellPrice: 65,
  icon: '🏹✨'
};

export const ITEM_FIRE_ROD: GameItem = {
  id: 'item_weapon_rod_fire',
  name: '화염의 막대',
  description: '불꽃의 기운이 담긴 막대. 공격력 +7, 최대MP +5.',
  type: 'weapon',
  quantity: 0,
  equipSlot: 'weapon',
  effects: { attack: 7, mp: 5 },
  sellPrice: 100,
  icon: '🔥杖'
};

export const ITEM_STEEL_SWORD: GameItem = {
  id: 'item_weapon_sword_steel',
  name: '강철 검',
  description: '잘 벼려진 강철 검. 공격력 +12.',
  type: 'weapon',
  quantity: 0,
  equipSlot: 'weapon',
  effects: { attack: 12 },
  sellPrice: 150,
  icon: '🔪'
};

export const ITEM_COMPOSITE_BOW: GameItem = {
  id: 'item_weapon_bow_composite',
  name: '합성궁',
  description: '여러 재료를 합쳐 만든 강력한 활. 공격력 +10.',
  type: 'weapon',
  quantity: 0,
  equipSlot: 'weapon',
  effects: { attack: 10 },
  sellPrice: 130,
  icon: '🎯'
};

export const ITEM_WIZARD_ROD: GameItem = {
  id: 'item_weapon_rod_wizard',
  name: '마법사의 지팡이',
  description: '마력이 깃든 지팡이. 공격력 +8, 최대MP +20.',
  type: 'weapon',
  quantity: 0,
  equipSlot: 'weapon',
  effects: { attack: 8, mp: 20 },
  sellPrice: 180,
  icon: '🪄'
};

export const ITEM_GREAT_SWORD: GameItem = {
  id: 'item_weapon_sword_great',
  name: '그레이트 소드',
  description: '묵직한 양손 검. 공격력 +20.',
  type: 'weapon',
  quantity: 0,
  equipSlot: 'weapon',
  effects: { attack: 20 },
  sellPrice: 400,
  icon: '🔱'
};

export const ITEM_ELVEN_BOW: GameItem = {
  id: 'item_weapon_bow_elven',
  name: '엘프의 활',
  description: '가볍고 정교한 엘프제 활. 공격력 +18, 속도 +3.',
  type: 'weapon',
  quantity: 0,
  equipSlot: 'weapon',
  effects: { attack: 18, speed: 3 },
  sellPrice: 380,
  icon: '🌿🏹'
};

export const ITEM_ARCHMAGE_STAFF: GameItem = {
  id: 'item_weapon_staff_archmage',
  name: '대현자의 지팡이',
  description: '강대한 마력이 깃든 지팡이. 공격력 +12, 최대MP +30.',
  type: 'weapon',
  quantity: 0,
  equipSlot: 'weapon',
  effects: { attack: 12, mp: 30 },
  sellPrice: 450,
  icon: '🌟杖'
};

export const ITEM_LEGENDARY_SWORD: GameItem = {
  id: 'item_weapon_sword_legendary',
  name: '전설의 검',
  description: '고대의 영웅이 사용했다는 검. 공격력 +30, 치명타율 +5%.',
  type: 'weapon',
  quantity: 0,
  equipSlot: 'weapon',
  effects: { attack: 30, critChance: 5 },
  sellPrice: 1000,
  icon: '✨⚔️✨'
};


// --- ARMOR ---
export const ITEM_SILK_ROBE: GameItem = {
  id: 'item_armor_robe_silk',
  name: '비단 로브',
  description: '가볍고 부드러운 비단 로브. 방어력 +5.',
  type: 'armor',
  quantity: 0,
  equipSlot: 'armor',
  effects: { defense: 5 },
  sellPrice: 45, 
  icon: '👘'
};

export const ITEM_LEATHER_ARMOR: GameItem = {
  id: 'item_armor_leather_basic',
  name: '가죽 갑옷',
  description: '기본적인 가죽 갑옷. 방어력 +8.',
  type: 'armor',
  quantity: 0,
  equipSlot: 'armor',
  effects: { defense: 8 },
  sellPrice: 80, 
  icon: '🛡️'
};

export const ITEM_CHAIN_MAIL: GameItem = {
  id: 'item_armor_mail_chain',
  name: '사슬 갑옷',
  description: '촘촘한 사슬로 엮은 갑옷. 방어력 +12.',
  type: 'armor',
  quantity: 0,
  equipSlot: 'armor',
  effects: { defense: 12 },
  sellPrice: 130,
  icon: '🔗🛡️'
};

export const ITEM_STUDDED_LEATHER: GameItem = {
  id: 'item_armor_leather_studded',
  name: '징 박힌 가죽 갑옷',
  description: '방어력을 높인 가죽 갑옷. 방어력 +15.',
  type: 'armor',
  quantity: 0,
  equipSlot: 'armor',
  effects: { defense: 15 },
  sellPrice: 190,
  icon: '🛡️🔩'
};


export const ITEM_MAGE_ROBE: GameItem = {
  id: 'item_armor_robe_mage',
  name: '마법사의 로브',
  description: '마력 증폭 효과가 있는 로브. 방어력 +8, 최대MP +15.',
  type: 'armor',
  quantity: 0,
  equipSlot: 'armor',
  effects: { defense: 8, mp: 15 },
  sellPrice: 220,
  icon: '🔮👘'
};

export const ITEM_PLATE_ARMOR: GameItem = {
  id: 'item_armor_plate_steel',
  name: '강철 판금 갑옷',
  description: '견고한 강철 판금 갑옷. 방어력 +20.',
  type: 'armor',
  quantity: 0,
  equipSlot: 'armor',
  effects: { defense: 20 },
  sellPrice: 300,
  icon: '🏋️🛡️'
};

export const ITEM_ADAMANTITE_ARMOR: GameItem = {
  id: 'item_armor_plate_adamantite',
  name: '아다만타이트 갑옷',
  description: '전설의 금속 아다만타이트로 만든 갑옷. 방어력 +45.',
  type: 'armor',
  quantity: 0,
  equipSlot: 'armor',
  effects: { defense: 45 },
  sellPrice: 900,
  icon: '💎🛡️'
};

export const ITEM_CELESTIAL_ROBE: GameItem = {
  id: 'item_armor_robe_celestial',
  name: '천상의 로브',
  description: '별의 힘이 깃든 로브. 방어력 +30, 최대MP +50.',
  type: 'armor',
  quantity: 0,
  equipSlot: 'armor',
  effects: { defense: 30, mp: 50 },
  sellPrice: 800,
  icon: '🌌👘'
};


// --- ACCESSORIES ---
export const ITEM_WOODEN_SHIELD_ACC: GameItem = { 
  id: 'item_accessory_shield_wood',
  name: '나무 방패 (장신구)',
  description: '간단한 나무 방패. 방어력 +3.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { defense: 3 },
  sellPrice: 25,
  icon: '🛡️🪵'
};

export const ITEM_BRONZE_HELMET_ACC: GameItem = {
  id: 'item_accessory_helmet_bronze',
  name: '청동 투구 (장신구)',
  description: '기본적인 청동 투구. 방어력 +2.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { defense: 2 },
  sellPrice: 35,
  icon: '⛑️'
};

export const ITEM_LEATHER_GLOVES_ACC: GameItem = {
  id: 'item_accessory_gloves_leather',
  name: '가죽 장갑 (장신구)',
  description: '손을 보호하는 가죽 장갑. 방어력 +2, 공격력 +1.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { defense: 2, attack: 1 },
  sellPrice: 70,
  icon: '🧤'
};

export const ITEM_IRON_HELMET_ACC: GameItem = {
  id: 'item_accessory_helmet_iron',
  name: '철 투구 (장신구)',
  description: '견고한 철제 투구. 방어력 +4.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { defense: 4 },
  sellPrice: 90,
  icon: '🛡️🧢'
};


export const ITEM_SPEED_BOOTS: GameItem = {
  id: 'item_accessory_boots_speed',
  name: '속도의 장화',
  description: '민첩성을 올려주는 장화. 속도 +3.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { speed: 3 },
  sellPrice: 100,
  icon: '👢'
};

export const ITEM_LUCK_CHARM: GameItem = {
  id: 'item_accessory_charm_luck',
  name: '행운의 부적',
  description: '행운을 약간 올려주는 부적. 행운 +3.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { luck: 3 },
  sellPrice: 90,
  icon: '🍀'
};

export const ITEM_RING_OF_STRENGTH: GameItem = {
  id: 'item_accessory_ring_strength',
  name: '힘의 반지',
  description: '착용자의 공격력을 올려주는 반지. 공격력 +3.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { attack: 3 },
  sellPrice: 150,
  icon: '💍💪'
};

export const ITEM_RING_OF_PROTECTION: GameItem = {
  id: 'item_accessory_ring_protection',
  name: '보호의 반지',
  description: '착용자의 방어력을 올려주는 반지. 방어력 +3.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { defense: 3 },
  sellPrice: 150,
  icon: '💍🛡️'
};

export const ITEM_STEEL_HELMET_ACC: GameItem = {
  id: 'item_accessory_helmet_steel',
  name: '강철 투구 (장신구)',
  description: '튼튼한 강철 투구. 방어력 +6.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { defense: 6 },
  sellPrice: 170,
  icon: '🛡️🔩🧢'
};

export const ITEM_GAUNTLETS_OF_OGRE_POWER: GameItem = {
  id: 'item_accessory_gauntlets_strength',
  name: '오우거 힘의 건틀릿',
  description: '강력한 힘을 부여하는 건틀릿. 공격력 +5.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { attack: 5 },
  sellPrice: 280,
  icon: '🥊'
};

export const ITEM_CLOAK_OF_PROTECTION: GameItem = {
  id: 'item_accessory_cloak_defense',
  name: '수호의 망토',
  description: '마법적인 힘으로 보호해주는 망토. 방어력 +5.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { defense: 5 },
  sellPrice: 260,
  icon: '🧥'
};

export const ITEM_AMULET_OF_VITALITY: GameItem = {
  id: 'item_accessory_amulet_hp',
  name: '활력의 아뮬렛',
  description: '생명력을 증강시키는 아뮬렛. 최대HP +30.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { hp: 30 },
  sellPrice: 320,
  icon: '💖📿'
};

export const ITEM_BOOTS_OF_HASTE: GameItem = {
  id: 'item_accessory_boots_haste',
  name: '신속의 장화',
  description: '바람처럼 빠르게 만들어주는 장화. 속도 +7.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { speed: 7 },
  sellPrice: 350,
  icon: '👟💨'
};


export const ITEM_CRITICAL_GAUNTLETS: GameItem = {
  id: 'item_accessory_gauntlets_crit',
  name: '필살의 건틀릿',
  description: '치명타 확률을 높여주는 건틀릿. 치명타율 +5%.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { critChance: 5 },
  sellPrice: 450,
  icon: '💥🥊'
};

export const ITEM_AMULET_OF_WISDOM: GameItem = {
  id: 'item_accessory_amulet_mp',
  name: '지혜의 아뮬렛',
  description: '정신력을 증강시키는 아뮬렛. 최대MP +25.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { mp: 25 },
  sellPrice: 420,
  icon: '🧠📿'
};

export const ITEM_ARTIFACT_SHIELD_ACC: GameItem = {
  id: 'item_accessory_shield_artifact',
  name: '유물 방패 (장신구)',
  description: '고대 유물 방패. 방어력 +15, 모든 내성 +5 (효과 미구현).',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { defense: 15 },
  sellPrice: 950,
  icon: '🏛️🛡️'
};

export const ITEM_CROWN_OF_KINGS: GameItem = {
  id: 'item_accessory_crown_kings',
  name: '왕의 왕관',
  description: '고대 왕의 왕관. 모든 능력치 +3.',
  type: 'accessory',
  quantity: 0,
  equipSlot: 'accessory',
  effects: { attack: 3, defense: 3, speed: 3, luck: 3, hp:15, mp:10 },
  sellPrice: 1200,
  icon: '👑'
};


// --- KEY ITEMS ---
export const ITEM_OLD_RECORD_PIECE: GameItem = {
  id: 'item_keyitem_old_record_piece',
  name: '낡은 성소 기록 조각',
  description: '성소의 역사가 담긴 석판 조각.',
  type: 'keyItem',
  quantity: 0,
  icon: '📜',
};


export const ALL_ITEM_DEFINITIONS: Record<string, GameItem> = {
  // Consumables
  [ITEM_SMALL_POTION.id]: ITEM_SMALL_POTION,
  [ITEM_MEDIUM_POTION.id]: ITEM_MEDIUM_POTION,
  [ITEM_LARGE_POTION.id]: ITEM_LARGE_POTION,
  [ITEM_MP_POTION_SMALL.id]: ITEM_MP_POTION_SMALL,
  [ITEM_MP_POTION_MEDIUM.id]: ITEM_MP_POTION_MEDIUM,
  [ITEM_MP_POTION_LARGE.id]: ITEM_MP_POTION_LARGE,
  [ITEM_ELIXIR_SMALL.id]: ITEM_ELIXIR_SMALL,
  [ITEM_ELIXIR_LARGE.id]: ITEM_ELIXIR_LARGE,
  [ITEM_ANTIDOTE.id]: ITEM_ANTIDOTE,
  [ITEM_PHOENIX_DOWN.id]: ITEM_PHOENIX_DOWN,
  [ITEM_ARROW.id]: ITEM_ARROW,

  // Weapons
  [ITEM_BASIC_SWORD.id]: ITEM_BASIC_SWORD,
  [ITEM_SHORT_BOW.id]: ITEM_SHORT_BOW,
  [ITEM_IRON_SWORD.id]: ITEM_IRON_SWORD,
  [ITEM_HUNTERS_BOW.id]: ITEM_HUNTERS_BOW,
  [ITEM_FIRE_ROD.id]: ITEM_FIRE_ROD,
  [ITEM_STEEL_SWORD.id]: ITEM_STEEL_SWORD,
  [ITEM_COMPOSITE_BOW.id]: ITEM_COMPOSITE_BOW,
  [ITEM_WIZARD_ROD.id]: ITEM_WIZARD_ROD,
  [ITEM_GREAT_SWORD.id]: ITEM_GREAT_SWORD,
  [ITEM_ELVEN_BOW.id]: ITEM_ELVEN_BOW,
  [ITEM_ARCHMAGE_STAFF.id]: ITEM_ARCHMAGE_STAFF,
  [ITEM_LEGENDARY_SWORD.id]: ITEM_LEGENDARY_SWORD,
  
  // Armor
  [ITEM_SILK_ROBE.id]: ITEM_SILK_ROBE,
  [ITEM_LEATHER_ARMOR.id]: ITEM_LEATHER_ARMOR,
  [ITEM_CHAIN_MAIL.id]: ITEM_CHAIN_MAIL,
  [ITEM_STUDDED_LEATHER.id]: ITEM_STUDDED_LEATHER,
  [ITEM_MAGE_ROBE.id]: ITEM_MAGE_ROBE,
  [ITEM_PLATE_ARMOR.id]: ITEM_PLATE_ARMOR,
  [ITEM_ADAMANTITE_ARMOR.id]: ITEM_ADAMANTITE_ARMOR,
  [ITEM_CELESTIAL_ROBE.id]: ITEM_CELESTIAL_ROBE,

  // Accessories
  [ITEM_WOODEN_SHIELD_ACC.id]: ITEM_WOODEN_SHIELD_ACC,
  [ITEM_BRONZE_HELMET_ACC.id]: ITEM_BRONZE_HELMET_ACC,
  [ITEM_LEATHER_GLOVES_ACC.id]: ITEM_LEATHER_GLOVES_ACC,
  [ITEM_IRON_HELMET_ACC.id]: ITEM_IRON_HELMET_ACC,
  [ITEM_SPEED_BOOTS.id]: ITEM_SPEED_BOOTS,
  [ITEM_LUCK_CHARM.id]: ITEM_LUCK_CHARM,
  [ITEM_RING_OF_STRENGTH.id]: ITEM_RING_OF_STRENGTH,
  [ITEM_RING_OF_PROTECTION.id]: ITEM_RING_OF_PROTECTION,
  [ITEM_STEEL_HELMET_ACC.id]: ITEM_STEEL_HELMET_ACC,
  [ITEM_GAUNTLETS_OF_OGRE_POWER.id]: ITEM_GAUNTLETS_OF_OGRE_POWER,
  [ITEM_CLOAK_OF_PROTECTION.id]: ITEM_CLOAK_OF_PROTECTION,
  [ITEM_AMULET_OF_VITALITY.id]: ITEM_AMULET_OF_VITALITY,
  [ITEM_BOOTS_OF_HASTE.id]: ITEM_BOOTS_OF_HASTE,
  [ITEM_CRITICAL_GAUNTLETS.id]: ITEM_CRITICAL_GAUNTLETS,
  [ITEM_AMULET_OF_WISDOM.id]: ITEM_AMULET_OF_WISDOM,
  [ITEM_ARTIFACT_SHIELD_ACC.id]: ITEM_ARTIFACT_SHIELD_ACC,
  [ITEM_CROWN_OF_KINGS.id]: ITEM_CROWN_OF_KINGS,

  // Key Items
  [ITEM_OLD_RECORD_PIECE.id]: ITEM_OLD_RECORD_PIECE,
};

export const getItemDefinition = (idOrName: string): GameItem | undefined => {
  const byId = ALL_ITEM_DEFINITIONS[idOrName];
  if (byId) return JSON.parse(JSON.stringify(byId)); // Return a deep copy
  
  const foundByName = Object.values(ALL_ITEM_DEFINITIONS).find(item => item.name === idOrName);
  return foundByName ? JSON.parse(JSON.stringify(foundByName)) : undefined; // Return a deep copy
};

// Skills
export const SKILL_PUNCH: Skill = {
  id: 'skill_punch',
  name: '주먹질',
  description: '기본적인 주먹 공격을 합니다. 약간의 피해를 줍니다.',
  mpCost: 0,
  effectValue: 5, 
  effectType: 'damage_hp',
  targetType: 'enemy_single',
  icon: '👊'
};

export const SKILL_FIREBALL: Skill = {
  id: 'skill_fireball',
  name: '화염구',
  description: '작은 화염구를 던져 적 하나에게 화염 피해를 입힙니다.',
  mpCost: 5,
  effectValue: 15, 
  effectType: 'damage_hp',
  targetType: 'enemy_single',
  icon: '🔥'
};

export const SKILL_HEAL_LIGHT: Skill = {
  id: 'skill_heal_light',
  name: '가벼운 치유',
  description: '자신의 HP를 약간 회복합니다.',
  mpCost: 8,
  effectValue: 20, 
  effectType: 'heal_hp',
  targetType: 'self',
  icon: '✨'
};

// --- NEW SKILLS ---
export const SKILL_POWER_STRIKE: Skill = {
  id: 'skill_power_strike',
  name: '강력 타격',
  description: '힘을 모아 적 하나에게 강력한 물리 피해를 입힙니다.',
  mpCost: 8,
  effectValue: 25,
  effectType: 'damage_hp',
  targetType: 'enemy_single',
  icon: '💥'
};

export const SKILL_DEFENSE_UP: Skill = {
  id: 'skill_defense_up',
  name: '방어력 증가',
  description: '일정 시간 동안 자신의 방어력을 증가시킵니다. (전투 중 효과 구현 필요)',
  mpCost: 6,
  effectValue: 5, // Placeholder for defense increase amount
  effectTurns: 3, // Placeholder for duration
  effectType: 'buff_defense',
  targetType: 'self',
  icon: '🛡️⬆️'
};

export const SKILL_HEAL_MEDIUM: Skill = {
  id: 'skill_heal_medium',
  name: '중급 치유',
  description: '자신의 HP를 중간 정도 회복합니다.',
  mpCost: 12,
  effectValue: 40,
  effectType: 'heal_hp',
  targetType: 'self',
  icon: '💖'
};

export const SKILL_ICE_SHARD: Skill = {
  id: 'skill_ice_shard',
  name: '얼음 파편',
  description: '날카로운 얼음 파편을 적 하나에게 발사하여 피해를 줍니다.',
  mpCost: 10,
  effectValue: 20, // Lower damage than power strike but could have other effects later
  effectType: 'damage_hp',
  targetType: 'enemy_single',
  icon: '❄️'
};

export const SKILL_MEDITATE: Skill = {
  id: 'skill_meditate',
  name: '명상',
  description: '정신을 집중하여 자신의 MP를 약간 회복합니다.',
  mpCost: 0, // Costs 0 MP to use, but maybe takes a turn
  effectValue: 10,
  effectType: 'heal_mp',
  targetType: 'self',
  icon: '🧘'
};

export const SKILL_FLAME_SLASH: Skill = {
  id: 'skill_flame_slash',
  name: '화염 베기',
  description: '불꽃으로 강화된 검으로 적 하나를 베어 화염 피해를 입힙니다.',
  mpCost: 12,
  effectValue: 30, // Physical + Fire
  effectType: 'damage_hp',
  targetType: 'enemy_single',
  icon: '⚔️🔥'
};


export const ALL_SKILL_DEFINITIONS: Record<string, Skill> = {
  [SKILL_PUNCH.id]: SKILL_PUNCH,
  [SKILL_FIREBALL.id]: SKILL_FIREBALL,
  [SKILL_HEAL_LIGHT.id]: SKILL_HEAL_LIGHT,
  [SKILL_POWER_STRIKE.id]: SKILL_POWER_STRIKE,
  [SKILL_DEFENSE_UP.id]: SKILL_DEFENSE_UP,
  [SKILL_HEAL_MEDIUM.id]: SKILL_HEAL_MEDIUM,
  [SKILL_ICE_SHARD.id]: SKILL_ICE_SHARD,
  [SKILL_MEDITATE.id]: SKILL_MEDITATE,
  [SKILL_FLAME_SLASH.id]: SKILL_FLAME_SLASH,
};

export const getSkillDefinition = (id: string): Skill | undefined => {
  const skill = ALL_SKILL_DEFINITIONS[id];
  return skill ? JSON.parse(JSON.stringify(skill)) : undefined; // Return a deep copy
};

export const PLAYER_DEFAULT_SKILLS: string[] = [
  SKILL_PUNCH.id,
  SKILL_FIREBALL.id,
  SKILL_HEAL_LIGHT.id,
];

// Skills learned at specific levels
export const SKILLS_BY_LEVEL: Record<number, string[]> = {
  2: [SKILL_POWER_STRIKE.id],
  3: [SKILL_DEFENSE_UP.id], // Buff skill
  4: [SKILL_HEAL_MEDIUM.id], // Better heal
  5: [SKILL_ICE_SHARD.id],   // Elemental alternative
  6: [SKILL_MEDITATE.id],    // MP recovery
  7: [SKILL_FLAME_SLASH.id], // Stronger elemental attack
  // Example for higher levels (can be expanded)
  // 8: ['skill_aoe_fire'],
  // 10: ['skill_revive_light'],
};


export const MAX_STAT_VALUE_FOR_CHART = 50;

// DEFAULT_SHOP_ITEM_IDS: Fallback for shops without specific inventory (for 10-stage game)
export const DEFAULT_SHOP_ITEM_IDS: string[] = [
  ITEM_SMALL_POTION.id,
  ITEM_MP_POTION_SMALL.id,
  ITEM_ARROW.id,
  ITEM_BASIC_SWORD.id,
  ITEM_SHORT_BOW.id,
  ITEM_SILK_ROBE.id,
  ITEM_WOODEN_SHIELD_ACC.id,
  ITEM_MEDIUM_POTION.id, // Adding a few mid-tier items
  ITEM_IRON_SWORD.id,
  ITEM_LEATHER_ARMOR.id,
];

// Specific shop inventories for towns, adjusted for a 10-stage progression.
// Scene IDs used here are placeholders; actual game script would use its own scene IDs.
export const SHOP_INVENTORIES: Record<string, string[]> = {
  // '고요한 등불' 마을 상점 (기존) - 스테이지 1~2 상점 예시
  'kv7hl4q39': [ 
    ITEM_SMALL_POTION.id,
    ITEM_MP_POTION_SMALL.id,
    ITEM_ARROW.id,
    ITEM_BASIC_SWORD.id,
    ITEM_SHORT_BOW.id,
    ITEM_SILK_ROBE.id,
    ITEM_WOODEN_SHIELD_ACC.id,
    ITEM_BRONZE_HELMET_ACC.id,
    // ITEM_OLD_RECORD_PIECE.id, // Key items typically not sold unless for specific reason
  ],
  // 스테이지 1-2 상점 (위와 유사하거나 동일할 수 있음)
  'shop_stage_1_2': [
    ITEM_SMALL_POTION.id,
    ITEM_MP_POTION_SMALL.id,
    ITEM_ANTIDOTE.id, // Early access to antidote
    ITEM_ARROW.id,
    ITEM_BASIC_SWORD.id,
    ITEM_SHORT_BOW.id,
    ITEM_SILK_ROBE.id,
    ITEM_WOODEN_SHIELD_ACC.id,
    ITEM_BRONZE_HELMET_ACC.id,
  ],
  // 스테이지 3-4 상점
  'shop_stage_3_4': [
    ITEM_MEDIUM_POTION.id,
    ITEM_MP_POTION_MEDIUM.id,
    ITEM_ANTIDOTE.id,
    ITEM_IRON_SWORD.id,
    ITEM_HUNTERS_BOW.id,
    ITEM_LEATHER_ARMOR.id,
    ITEM_CHAIN_MAIL.id,
    ITEM_LEATHER_GLOVES_ACC.id,
    ITEM_SPEED_BOOTS.id,
    ITEM_LUCK_CHARM.id,
  ],
  // 스테이지 5-6 상점
  'shop_stage_5_6': [
    ITEM_LARGE_POTION.id,
    ITEM_MP_POTION_LARGE.id,
    ITEM_PHOENIX_DOWN.id, // 전투 불능 회복 아이템 등장
    ITEM_FIRE_ROD.id,
    ITEM_STEEL_SWORD.id,
    ITEM_COMPOSITE_BOW.id,
    ITEM_STUDDED_LEATHER.id,
    ITEM_MAGE_ROBE.id,
    ITEM_IRON_HELMET_ACC.id,
    ITEM_RING_OF_STRENGTH.id,
    ITEM_RING_OF_PROTECTION.id,
  ],
  // 스테이지 7-8 상점
  'shop_stage_7_8': [
    ITEM_LARGE_POTION.id, // 꾸준히 필요
    ITEM_MP_POTION_LARGE.id, // 꾸준히 필요
    ITEM_ELIXIR_SMALL.id, // HP/MP 동시 회복
    ITEM_PHOENIX_DOWN.id,
    ITEM_WIZARD_ROD.id,
    ITEM_GREAT_SWORD.id, // 강력한 무기 등장 시작
    ITEM_PLATE_ARMOR.id,
    ITEM_STEEL_HELMET_ACC.id,
    ITEM_GAUNTLETS_OF_OGRE_POWER.id,
    ITEM_CLOAK_OF_PROTECTION.id,
    ITEM_AMULET_OF_VITALITY.id,
    ITEM_BOOTS_OF_HASTE.id,
  ],
  // 스테이지 9-10 상점 (최종 단계)
  'shop_stage_9_10': [
    ITEM_ELIXIR_LARGE.id, // 최상급 회복 아이템
    ITEM_PHOENIX_DOWN.id, 
    ITEM_ELVEN_BOW.id,
    ITEM_ARCHMAGE_STAFF.id,
    ITEM_LEGENDARY_SWORD.id, // 전설급 무기 (하나 정도만 배치하거나, 매우 비싸게)
    ITEM_ADAMANTITE_ARMOR.id, // 최상급 방어구
    ITEM_CELESTIAL_ROBE.id, // 최상급 로브
    ITEM_CRITICAL_GAUNTLETS.id,
    ITEM_AMULET_OF_WISDOM.id,
    ITEM_ARTIFACT_SHIELD_ACC.id, // 강력한 장신구
    ITEM_CROWN_OF_KINGS.id, // 모든 능력치 상승
  ],
};

export const DEFAULT_BUY_PRICE_MULTIPLIER = 2;
