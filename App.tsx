import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameLogic, GameLogicState } from './hooks/useGameLogic';
import { ScriptImporter } from './components/ScriptImporter';
import { PlayerStatsPanel } from './components/PlayerStatsPanel';
import { GameLogPanel } from './components/GameLogPanel';
import { GameScreen } from './components/GameScreen';
import { BottomBar } from './components/BottomBar';
import { InventoryModal } from './components/InventoryModal';
import { StatsChartModal } from './components/StatsChartModal';
import { ShopModal } from './components/ShopModal';
import { SkillModal } from './components/SkillModal';
import { GameItem, GameScript } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { StartScreen } from './components/StartScreen';
import { LOCAL_STORAGE_SCRIPT_KEY, LOCAL_STORAGE_GAME_STATE_KEY } from './constants';
import { loadFromLocalStorage, removeFromLocalStorage } from './utils/localStorage';

const App: React.FC = () => {
  const gameLogicHookResult = useGameLogic();

  // Safeguard against gameLogicHookResult being undefined
  if (!gameLogicHookResult) {
    console.error("Critical Error: useGameLogic() returned undefined. This indicates a problem with the hook's module initialization or its dependencies.");
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Critical Error</h1>
        <p className="text-slate-300">
          The game logic could not be initialized. Please check the browser console for more details.
        </p>
        <p className="text-slate-400 mt-2 text-sm">
          This might be due to an issue in `useGameLogic.ts` or one of its imported files (e.g., `constants.ts`).
        </p>
      </div>
    );
  }

  const {
    script, currentScene, player, gameLog, isLoading, error, isGameOver,
    loadScript, advanceToScene, makeChoice, resetGame, useItem, toggleEquipment,
    addLogEntry, restPlayer, openShop, isShopOpen, currentShopItems, shopError,
    closeShop, buyItem, sellItem,
    isCombatActive, currentEnemies, combatTurn, playerTargetId, activeSkill, combatMessage,
    handlePlayerAttack, handlePlayerSkill, handlePlayerUseItemInCombat, handleFleeAttempt,
    setPlayerTarget, setActiveSkillForTargeting, restartCurrentCombat,
    isDelegationModeActive, toggleDelegationMode, performDelegatedAction,
    saveFullGameState, loadFullGameState, clearActiveGameSessionInMemory
  } = gameLogicHookResult;

  const [isInventoryOpen, setInventoryOpen] = useState(false);
  const [isStatsChartOpen, setStatsChartOpen] = useState(false);
  const [isSkillModalOpen, setSkillModalOpen] = useState(false);


  type UiMode = 'start' | 'importer' | 'game' | 'error_importer' | 'loading_init';
  const [uiMode, setUiMode] = useState<UiMode>('loading_init');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);

  const autoActionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const savedGameState = loadFromLocalStorage<GameLogicState>(LOCAL_STORAGE_GAME_STATE_KEY);
    setHasSavedGame(!!savedGameState);
    setUiMode('start'); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const memoizedSetHasSavedGame = useCallback(setHasSavedGame, []);

  useEffect(() => {
    // Path 1: We are in an explicit loading operation
    if (uiMode === 'loading_init') {
      if (isLoading) { // gameLogic.isLoading
        return; // Wait for loading to finish
      } else {
        // Loading has finished (isLoading is false)
        if (script && player && !error && !fetchError) {
          setUiMode('game'); // Success
        } else {
          // If loading failed (e.g. fetchError or script error from loadScript),
          // ensure we check for a persistent save to update hasSavedGame.
          const persistentSave = loadFromLocalStorage<GameLogicState>(LOCAL_STORAGE_GAME_STATE_KEY);
          memoizedSetHasSavedGame(!!persistentSave);
          setUiMode('start'); // Failure or reset, go to start
        }
        return; 
      }
    }

    // Path 2: Handle errors if not in loading_init
    if (fetchError) { 
      if (uiMode !== 'error_importer') setUiMode('error_importer');
      return;
    }
    // Error from gameLogic, but respect 'importer' mode if error is shown there
    if (error && uiMode !== 'importer' && uiMode !== 'error_importer') { 
      setUiMode('error_importer');
      return;
    }
    
    // Path 3: Game data is ready, and we are not in an error state.
    if (script && player && !isGameOver && !fetchError && !error) {
      if (uiMode === 'start') { 
        setUiMode('game');
      } else if (uiMode !== 'game' && uiMode !== 'importer' && uiMode !== 'error_importer' && uiMode !== 'loading_init') { 
        setUiMode('game');
      }
      return;
    }

    // Path 4: No game data, not loading, not in an error state.
    if (!isLoading && !script && !player && !fetchError && !error) {
      if (uiMode === 'game') { 
         setUiMode('start');
         const savedGameState = loadFromLocalStorage<GameLogicState>(LOCAL_STORAGE_GAME_STATE_KEY);
         memoizedSetHasSavedGame(!!savedGameState);
      }
      return;
    }

  }, [script, player, error, isLoading, fetchError, uiMode, isGameOver, memoizedSetHasSavedGame]);


  useEffect(() => {
    const clearAutoActionTimeout = () => {
      if (autoActionTimeoutRef.current) {
        clearTimeout(autoActionTimeoutRef.current);
        autoActionTimeoutRef.current = null;
      }
    };

    if (
      isDelegationModeActive &&
      isCombatActive &&
      !isInventoryOpen && !isSkillModalOpen && !isShopOpen && !isStatsChartOpen &&
      !isLoading && !isGameOver && player && player.hp > 0
    ) {
      clearAutoActionTimeout();
      autoActionTimeoutRef.current = setTimeout(() => {
        performDelegatedAction();
      }, 1500);
    } else {
      clearAutoActionTimeout();
    }

    return clearAutoActionTimeout;
  }, [
    isDelegationModeActive,
    isCombatActive,
    combatTurn,
    isInventoryOpen, isSkillModalOpen, isShopOpen, isStatsChartOpen,
    isLoading, isGameOver, player,
    performDelegatedAction,
    currentScene?.id,
  ]);


  const handleStartNewGame = async () => {
    const savedGameExists = !!loadFromLocalStorage<GameLogicState>(LOCAL_STORAGE_GAME_STATE_KEY);
    if (savedGameExists) {
      const confirmed = window.confirm(
        "기존에 저장된 게임 데이터가 있습니다. 새 게임을 시작하면 현재 저장된 진행 상황이 삭제됩니다. 계속하시겠습니까?"
      );
      if (!confirmed) {
        return; 
      }
    }
    resetGame(); 
    setHasSavedGame(false); 
    setFetchError(null);
    setUiMode('loading_init'); 

    try {
      addLogEntry('system', '새 게임 시작: 기본 시나리오를 불러옵니다...');
      
      // 여러 가능한 경로를 시도
      let response: Response | null = null;
      let scriptJsonString: string | null = null;
      
      // 가능한 경로 목록
      const possiblePaths = ['./script.json', '/script.json', 'script.json', '../script.json'];
      
      // 각 경로 시도
      for (const path of possiblePaths) {
        try {
          const tempResponse = await fetch(path);
          if (tempResponse.ok) {
            response = tempResponse;
            scriptJsonString = await response.text();
            console.log(`스크립트를 성공적으로 로드했습니다: ${path}`);
            break;
          }
        } catch (pathError) {
          console.warn(`경로 ${path}에서 스크립트 로드 실패:`, pathError);
        }
      }
      
      // 모든 경로 시도 후에도 실패한 경우
      if (!response || !scriptJsonString) {
        throw new Error(`모든 경로에서 기본 스크립트를 가져오는 데 실패했습니다.`);
      }
      
      loadScript(scriptJsonString);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "알 수 없는 오류로 기본 스크립트를 불러오지 못했습니다.";
      console.error("기본 스크립트 로딩 중 오류 발생:", errorMessage);
      setFetchError(errorMessage);
      addLogEntry('error', `오류: ${errorMessage}`);
    }
  };

  const handleShowScriptImporter = () => {
    const savedGameExists = !!loadFromLocalStorage<GameLogicState>(LOCAL_STORAGE_GAME_STATE_KEY);
    if (savedGameExists) {
      const confirmed = window.confirm(
        "기존에 저장된 게임 데이터가 있습니다. 새 시나리오를 불러오면 현재 저장된 진행 상황이 삭제됩니다. 계속하시겠습니까?"
      );
      if (!confirmed) {
        return; 
      }
    }
    resetGame();
    setHasSavedGame(false);
    setFetchError(null); 
    setUiMode('importer');
  };

  const handleScriptLoadedByImporter = (scriptJson: string) => {
    setFetchError(null);
    setUiMode('loading_init'); 
    loadScript(scriptJson);
  };

  const handleLoadSavedGame = () => {
    setFetchError(null); 
    setUiMode('loading_init');
    if (loadFullGameState()) { 
      setHasSavedGame(true);
    } else {
      addLogEntry('error', '저장된 게임을 불러오지 못했습니다. 새 게임을 시작해주세요.');
      setFetchError('저장된 게임을 불러오지 못했습니다.');
      setUiMode('start'); 
      setHasSavedGame(false);
    }
  };

  const handleSaveCurrentGame = () => {
    if (player && script) {
      saveFullGameState();
      setHasSavedGame(true); // Update hasSavedGame immediately after saving
    } else {
      addLogEntry('error', '저장할 활성 게임이 없습니다.');
    }
  };


  const handleGoToMainMenu = () => {
    setInventoryOpen(false);
    setStatsChartOpen(false);
    setSkillModalOpen(false);
    if (isShopOpen) closeShop();
    
    clearActiveGameSessionInMemory(); // Clear in-memory game state first

    const savedGameState = loadFromLocalStorage<GameLogicState>(LOCAL_STORAGE_GAME_STATE_KEY);
    setHasSavedGame(!!savedGameState);
    
    setFetchError(null);
    setUiMode('start');
  };


  const handleOpenInventory = () => setInventoryOpen(true);
  const handleCloseInventory = () => setInventoryOpen(false);
  const handleOpenStatsChart = () => setStatsChartOpen(true);
  const handleCloseStatsChart = () => setStatsChartOpen(false);
  const handleOpenSkillModal = () => setSkillModalOpen(true);
  const handleCloseSkillModal = () => {
    setSkillModalOpen(false);
    if (isCombatActive && activeSkill && activeSkill.targetType === 'enemy_single') {
        setActiveSkillForTargeting(null);
    }
  };


  const handleUseItemFromInventory = (item: GameItem) => {
    if (isCombatActive) {
      if (item.type === 'consumable' && item.effects) {
        if (item.effects.attack && item.effects.attack > 0) {
            addLogEntry('system', `${item.name} 사용: 전투 화면에서 대상을 선택하세요.`);
            setActiveSkillForTargeting({id: item.id, name: item.name, description: '아이템 대상 선택', mpCost: 0, effectType:'etc', targetType:'enemy_single', icon: item.icon});
        } else {
            handlePlayerUseItemInCombat(item.id);
        }
      } else {
        addLogEntry('system', `${item.name}은(는) 전투 중에 이런 방식으로 사용할 수 없습니다.`);
      }
      handleCloseInventory();
    } else {
      if (item.type === 'consumable') {
        useItem(item.id);
      }
    }
  };

  const handleToggleEquipmentFromInventory = (item: GameItem) => {
    if (item.equipSlot) {
        toggleEquipment(item);
    }
  };

  let content;

  switch (uiMode) {
    case 'loading_init':
      content = (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900">
          <LoadingSpinner />
          <p className="text-slate-400 mt-3">게임 데이터 초기화 및 로딩 중...</p>
        </div>
      );
      break;
    case 'start':
      content = (
        <div className="container mx-auto p-4 flex justify-center items-center h-full">
          <StartScreen
            onStartNewGame={handleStartNewGame}
            onShowScriptImporter={handleShowScriptImporter}
            onLoadSavedGame={handleLoadSavedGame} 
            hasSavedGame={hasSavedGame}
            defaultGameTitle={"RPG어드벤처"}
            fetchError={fetchError}
          />
        </div>
      );
      break;
    case 'importer':
      content = (
        <div className="container mx-auto p-4 flex flex-col justify-center items-center h-full">
          <ScriptImporter onScriptLoad={handleScriptLoadedByImporter} error={error} />
           <button
            onClick={handleGoToMainMenu}
            className="mt-8 px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md"
            aria-label="초기 화면으로 돌아가기"
          >
            초기 화면으로 돌아가기
          </button>
        </div>
      );
      break;
    case 'error_importer':
      const currentErrorToDisplay = fetchError || error;
      content = (
        <div className="container mx-auto p-4 flex flex-col justify-center items-center h-full">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-red-400 mb-3">오류 발생</h2>
            <p className="text-gray-300">
              {currentErrorToDisplay || "알 수 없는 오류가 발생했습니다."}
            </p>
            {uiMode === 'error_importer' && error && !fetchError && ( 
                 <ScriptImporter onScriptLoad={handleScriptLoadedByImporter} error={error} />
            )}
          </div>
          <button
            onClick={handleGoToMainMenu}
            className="mt-8 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md"
            aria-label="초기 화면으로 돌아가기"
          >
            초기 화면으로 돌아가기
          </button>
        </div>
      );
      break;
    case 'game':
      if (!player || !script || (isLoading && !currentScene && !isCombatActive)) { 
         content = (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900">
                <LoadingSpinner />
                <p className="text-slate-400 mt-3">게임 화면 준비 중...</p>
            </div>
        );
      } else {
        content = (
          <div className="flex flex-col h-screen p-1 sm:p-2 bg-slate-900">
            <header className="mb-1 sm:mb-2 text-center py-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-sky-400 tracking-wide">
                {script.worldSettings.title || '텍스트 JRPG'}
              </h1>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-1 sm:gap-2 overflow-hidden min-h-0">
              <aside className="lg:col-span-1 bg-slate-800/70 p-1 sm:p-2 rounded-lg shadow-lg overflow-hidden min-h-0">
                <PlayerStatsPanel player={player} />
              </aside>
              <div className="lg:col-span-2 flex flex-col gap-1 sm:gap-2 overflow-hidden min-h-0">
                <section className="flex-1 bg-slate-800/70 p-1 sm:p-2 rounded-lg shadow-lg overflow-hidden min-h-0">
                  <GameLogPanel logEntries={gameLog} />
                </section>
                <main className="flex-1 bg-slate-800/70 p-1 sm:p-2 rounded-lg shadow-lg overflow-hidden min-h-0">
                  <GameScreen
                    scene={currentScene}
                    player={player}
                    isLoading={isLoading} 
                    isGameOver={isGameOver}
                    onAdvance={advanceToScene}
                    onChoice={makeChoice}
                    onResetGame={handleGoToMainMenu} 
                    onRestPlayer={restPlayer}
                    onOpenShop={openShop}
                    isCombatActive={isCombatActive}
                    currentEnemies={currentEnemies}
                    combatTurn={combatTurn}
                    playerTargetId={playerTargetId}
                    activeSkill={activeSkill}
                    combatMessage={combatMessage}
                    onPlayerAttack={handlePlayerAttack}
                    onPlayerSkillAction={handlePlayerSkill}
                    onPlayerUseItemInCombat={handlePlayerUseItemInCombat}
                    onFleeAttempt={handleFleeAttempt}
                    onSetPlayerTarget={setPlayerTarget}
                    onSetActiveSkillForTargeting={setActiveSkillForTargeting}
                    onOpenSkillModal={handleOpenSkillModal}
                    onOpenInventoryModal={handleOpenInventory}
                    onRestartCurrentCombat={restartCurrentCombat}
                  />
                </main>
              </div>
            </div>

            <BottomBar
                playerGold={player?.gold ?? 0}
                onOpenInventory={handleOpenInventory}
                onOpenStatsChart={handleOpenStatsChart}
                onOpenSkills={handleOpenSkillModal}
                onGoToMainMenu={handleGoToMainMenu}
                onSaveGame={handleSaveCurrentGame}
                isGameActive={!!player && !!script && !isGameOver}
                isDelegationModeActive={isDelegationModeActive}
                onToggleDelegationMode={toggleDelegationMode}
            />

            {isInventoryOpen && player && (
              <InventoryModal
                player={player}
                onClose={handleCloseInventory}
                onUseItem={handleUseItemFromInventory}
                onToggleEquipment={handleToggleEquipmentFromInventory}
                isCombatActive={isCombatActive}
              />
            )}
            {isStatsChartOpen && player && (
              <StatsChartModal player={player} onClose={handleCloseStatsChart} />
            )}
            {isShopOpen && player && (
              <ShopModal
                player={player}
                shopItems={currentShopItems}
                isOpen={isShopOpen}
                onClose={closeShop}
                onBuyItem={buyItem}
                onSellItem={sellItem}
                shopError={shopError}
              />
            )}
            {isSkillModalOpen && player && (
              <SkillModal
                player={player}
                isOpen={isSkillModalOpen}
                onClose={handleCloseSkillModal}
                onUseSkill={handlePlayerSkill}
                isCombatMode={isCombatActive}
                onSetActiveSkillForTargeting={setActiveSkillForTargeting}
              />
            )}
            <footer className="mt-1 sm:mt-2 text-center text-xs text-slate-500 py-1">
              <p>&copy; {new Date().getFullYear()} JRPG 엔진. 모험이 당신을 기다립니다!</p>
            </footer>
          </div>
        );
      }
      break;
    default:
      content = (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900">
          <p className="text-red-400">알 수 없는 애플리케이션 상태입니다: {uiMode}</p>
           <button
            onClick={handleGoToMainMenu}
            className="mt-8 px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md"
            aria-label="초기 화면으로 돌아가기"
          >
            초기 화면으로 돌아가기
          </button>
        </div>
      );
  }

  return content;
};

export default App;
