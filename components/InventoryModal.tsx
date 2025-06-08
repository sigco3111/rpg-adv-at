
import React from 'react';
import { PlayerState, GameItem, EquipmentSlot } from '../types';

interface InventoryModalProps {
  player: PlayerState;
  onClose: () => void;
  onUseItem: (item: GameItem) => void;
  onToggleEquipment: (item: GameItem) => void;
  isCombatActive: boolean; // Added to determine behavior of "Use" button
}

const ItemCard: React.FC<{ 
    item: GameItem; 
    isEquipped?: boolean;
    canEquip?: boolean;
    onAction: () => void; 
    actionLabel: string;
    isCombatActive: boolean;
}> = ({ item, isEquipped, canEquip, onAction, actionLabel, isCombatActive }) => {
  let borderColor = 'border-slate-700';
  if (isEquipped) borderColor = 'border-sky-500';
  else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') borderColor = 'border-yellow-500';

  let currentActionLabel = actionLabel;
  let isDisabled = (item.type !== 'consumable' && !item.equipSlot) || (item.type === 'consumable' && item.quantity === 0);

  if (item.type === 'consumable') {
    if (isCombatActive) {
      currentActionLabel = "전투 사용";
    } else {
      currentActionLabel = "사용";
    }
  } else if (item.equipSlot) {
    currentActionLabel = isEquipped ? "해제" : "장착";
    if (isCombatActive) isDisabled = true; // Cannot equip/unequip in combat
  } else {
    currentActionLabel = "사용 불가";
    isDisabled = true;
  }
  
  if (item.type === 'keyItem') {
    isDisabled = true;
    currentActionLabel = "정보";
  }


  return (
    <div className={`bg-slate-800 p-3 rounded-lg shadow-md border ${borderColor} flex flex-col`}>
      <h4 className="text-md font-semibold text-sky-300 mb-1">
        {item.icon && <span className="mr-2">{item.icon}</span>}
        {item.name} {item.quantity > 1 && item.type !== 'weapon' && item.type !== 'armor' && item.type !== 'accessory' ? `x${item.quantity}`: ''}
      </h4>
      <p className="text-xs text-slate-400 mb-2 flex-grow min-h-[30px]">{item.description}</p>
      {item.effects && (
        <div className="text-xs text-green-400 mb-1">
          효과:
          {item.effects.hp && ` HP+${item.effects.hp} `}
          {item.effects.mp && ` MP+${item.effects.mp} `}
          {item.effects.attack && ` 공격력+${item.effects.attack} `}
          {item.effects.defense && ` 방어력+${item.effects.defense} `}
          {item.effects.speed && ` 속도+${item.effects.speed} `}
          {item.effects.luck && ` 행운+${item.effects.luck} `}
          {item.effects.critChance && ` 치명타+${item.effects.critChance}% `}
        </div>
      )}
      {item.sellPrice && <p className="text-xs text-slate-500 mb-2">판매가: {item.sellPrice}G</p>}
      
      <button
        onClick={onAction}
        disabled={isDisabled}
        className={`mt-auto w-full px-3 py-1.5 text-xs rounded shadow-sm transition-colors duration-150 
                    ${isEquipped && !isCombatActive ? 'bg-red-600 hover:bg-red-700' : 
                     (!isDisabled) ? 'bg-sky-600 hover:bg-sky-700' : 
                     'bg-slate-600 cursor-not-allowed'} 
                     text-white disabled:opacity-50`}
      >
        {currentActionLabel}
      </button>
    </div>
  );
};

export const InventoryModal: React.FC<InventoryModalProps> = ({ player, onClose, onUseItem, onToggleEquipment, isCombatActive }) => {
  const equipmentSlots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];

  return (
    <div className="modal-overlay">
      <div className="modal-content w-full max-w-2xl text-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-sky-400">가방 (소지금: {player.gold}G)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <section className="mb-6">
          <h3 className="text-lg font-semibold text-sky-300 mb-3 border-b border-slate-700 pb-1">장착 중</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {equipmentSlots.map(slot => {
              const equippedItem = player.equipment[slot];
              if (equippedItem) {
                return (
                  <ItemCard 
                    key={equippedItem.id} 
                    item={equippedItem} 
                    isEquipped 
                    onAction={() => onToggleEquipment(equippedItem)}
                    actionLabel="해제"
                    isCombatActive={isCombatActive}
                  />
                );
              }
              return (
                <div key={slot} className="bg-slate-800 p-3 rounded-lg shadow-md border border-slate-700 text-center text-slate-500 italic">
                  ({slot === 'weapon' ? '무기' : slot === 'armor' ? '갑옷' : '장신구'}) 비어있음
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-sky-300 mb-3 border-b border-slate-700 pb-1">소지품</h3>
          {player.inventory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2">
              {player.inventory.map(item => (
                <ItemCard 
                  key={item.id} 
                  item={item}
                  canEquip={!!item.equipSlot}
                  onAction={() => item.equipSlot ? onToggleEquipment(item) : onUseItem(item)}
                  actionLabel={item.equipSlot ? '장착' : item.type === 'consumable' ? '사용' : '정보'}
                  isCombatActive={isCombatActive}
                />
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic text-center py-4">가방이 비어있습니다.</p>
          )}
        </section>

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
