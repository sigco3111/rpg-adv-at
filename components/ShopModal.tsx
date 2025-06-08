import React, { useState } from 'react';
import { PlayerState, GameItem } from '../types';
import { DEFAULT_BUY_PRICE_MULTIPLIER } from '../constants';

interface ShopModalProps {
  player: PlayerState;
  shopItems: GameItem[];
  isOpen: boolean;
  onClose: () => void;
  onBuyItem: (itemId: string, quantity: number) => void;
  onSellItem: (itemId: string, quantity: number) => void;
  shopError: string | null;
}

interface ShopItemCardProps {
  item: GameItem;
  actionType: 'buy' | 'sell';
  playerGold?: number;
  onAction: (itemId: string, quantity: number) => void;
  currentQuantityInInventory?: number;
}

const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, actionType, playerGold, onAction, currentQuantityInInventory }) => {
  const [quantity, setQuantity] = useState(1);

  const buyPrice = item.sellPrice ? item.sellPrice * DEFAULT_BUY_PRICE_MULTIPLIER : undefined;
  const effectivePrice = actionType === 'buy' ? buyPrice : item.sellPrice;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    if (actionType === 'sell' && currentQuantityInInventory !== undefined && val > currentQuantityInInventory) {
      val = currentQuantityInInventory;
    }
    setQuantity(val);
  };

  const handleActionClick = () => {
    onAction(item.id, quantity);
    setQuantity(1); // Reset quantity after action
  };

  const canAfford = actionType === 'buy' && playerGold !== undefined && effectivePrice !== undefined ? playerGold >= effectivePrice * quantity : true;
  const hasStockToSell = actionType === 'sell' && currentQuantityInInventory !== undefined ? currentQuantityInInventory >= quantity : true;
  const isActionDisabled = 
    effectivePrice === undefined || 
    effectivePrice <= 0 ||
    (actionType === 'buy' && !canAfford) || 
    (actionType === 'sell' && (!hasStockToSell || quantity === 0));

  return (
    <div className="bg-slate-800 p-3 rounded-lg shadow-md border border-slate-700 flex flex-col h-full">
      <h4 className="text-md font-semibold text-sky-300 mb-1 truncate">
        {item.icon && <span className="mr-2">{item.icon}</span>}
        {item.name}
        {actionType === 'sell' && currentQuantityInInventory !== undefined && <span className="text-xs text-slate-400 ml-1">(보유: {currentQuantityInInventory})</span>}
      </h4>
      <p className="text-xs text-slate-400 mb-2 flex-grow min-h-[30px]">{item.description}</p>
      {item.effects && (
        <div className="text-xs text-green-400 mb-1 truncate">
          효과:
          {item.effects.hp && ` HP+${item.effects.hp} `}
          {item.effects.mp && ` MP+${item.effects.mp} `}
          {item.effects.attack && ` 공격력+${item.effects.attack} `}
          {item.effects.defense && ` 방어력+${item.effects.defense} `}
        </div>
      )}
      <p className="text-sm font-semibold text-yellow-400 mb-2">
        {actionType === 'buy' ? '구매가' : '판매가'}: {effectivePrice !== undefined && effectivePrice > 0 ? `${effectivePrice}G` : '거래 불가'}
      </p>
      <div className="flex items-center space-x-2 mt-auto">
        <input
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          min="1"
          max={actionType === 'sell' ? currentQuantityInInventory : undefined}
          className="w-16 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded focus:ring-sky-500 focus:border-sky-500"
          aria-label={`${item.name} ${actionType === 'buy' ? '구매' : '판매'} 수량`}
          disabled={effectivePrice === undefined || effectivePrice <= 0}
        />
        <button
          onClick={handleActionClick}
          disabled={isActionDisabled}
          className={`flex-grow px-3 py-1.5 text-xs rounded shadow-sm transition-colors duration-150 
                      ${isActionDisabled ? 'bg-slate-600 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'} 
                      text-white disabled:opacity-50`}
          aria-label={`${item.name} ${quantity}개 ${actionType === 'buy' ? '구매하기' : '판매하기'}`}
        >
          {actionType === 'buy' ? '구매' : '판매'}
        </button>
      </div>
    </div>
  );
};


export const ShopModal: React.FC<ShopModalProps> = ({ player, shopItems, isOpen, onClose, onBuyItem, onSellItem, shopError }) => {
  if (!isOpen) return null;

  const sellableInventory = player.inventory.filter(item => item.sellPrice !== undefined && item.sellPrice > 0);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="shop-modal-title">
      <div className="modal-content w-full max-w-4xl text-gray-100 flex flex-col" style={{maxHeight: '95vh'}}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
          <h2 id="shop-modal-title" className="text-2xl font-bold text-sky-400">상점</h2>
          <div className="text-lg text-yellow-400" aria-live="polite">소지금: {player.gold}G</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none" aria-label="상점 닫기">&times;</button>
        </div>

        {shopError && <p className="text-red-400 text-sm mb-3 text-center bg-red-900/50 p-2 rounded" role="alert">{shopError}</p>}

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
          {/* Buy Section */}
          <section className="flex flex-col overflow-hidden bg-slate-800/50 p-3 rounded-md">
            <h3 className="text-xl font-semibold text-sky-300 mb-3 text-center">구매하기</h3>
            {shopItems.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-grow">
                {shopItems.map(item => (
                  <ShopItemCard 
                    key={`buy-${item.id}`} 
                    item={item} 
                    actionType="buy" 
                    playerGold={player.gold}
                    onAction={onBuyItem} 
                  />
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-4 flex-grow flex items-center justify-center">판매 중인 아이템이 없습니다.</p>
            )}
          </section>

          {/* Sell Section */}
          <section className="flex flex-col overflow-hidden bg-slate-800/50 p-3 rounded-md">
            <h3 className="text-xl font-semibold text-sky-300 mb-3 text-center">판매하기</h3>
            {sellableInventory.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-grow">
                {sellableInventory.map(item => (
                  <ShopItemCard 
                    key={`sell-${item.id}`} 
                    item={item} 
                    actionType="sell" 
                    onAction={onSellItem}
                    currentQuantityInInventory={item.quantity}
                  />
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-4 flex-grow flex items-center justify-center">판매할 수 있는 아이템이 없습니다.</p>
            )}
          </section>
        </div>
        
        <button 
          onClick={onClose} 
          className="mt-6 w-full px-4 py-2.5 bg-sky-700 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md transition duration-150"
        >
          상점 나가기
        </button>
      </div>
    </div>
  );
};
