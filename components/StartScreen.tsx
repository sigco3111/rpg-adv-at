
import React from 'react';

interface StartScreenProps {
  onStartNewGame: () => void;
  onShowScriptImporter: () => void;
  onLoadSavedGame: () => void;
  hasSavedGame: boolean;
  defaultGameTitle: string;
  fetchError: string | null;
}

export const StartScreen: React.FC<StartScreenProps> = ({ 
  onStartNewGame, 
  onShowScriptImporter, 
  onLoadSavedGame,
  hasSavedGame,
  defaultGameTitle,
  fetchError
}) => {
  const handleExportOriginalScript = async () => {
    try {
      const response = await fetch('/script.json');
      if (!response.ok) {
        throw new Error(`기본 시나리오 파일을 가져오는 데 실패했습니다: ${response.status} ${response.statusText}`);
      }
      const scriptJsonString = await response.text();
      const blob = new Blob([scriptJsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'script.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("오리지널 시나리오 내보내기 오류:", error);
      alert(error instanceof Error ? error.message : "시나리오 파일을 내보내는 중 알 수 없는 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-900 text-gray-100">
      <h1 className="text-4xl sm:text-5xl font-bold text-sky-400 mb-4 tracking-wider">
        {defaultGameTitle}
      </h1>
      <p className="text-lg text-slate-300 mb-12">
        모험을 시작할 준비가 되셨습니까?
      </p>
      {fetchError && (
        <p className="text-red-400 text-md mb-4 p-3 bg-red-900/30 rounded-md border border-red-700" role="alert">
          오류: {fetchError}
        </p>
      )}
      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={onStartNewGame}
          className="w-full px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-xl transition duration-150 ease-in-out transform hover:scale-105 text-lg"
          aria-label="새 게임 시작 (기본 시나리오)"
        >
          새 게임 시작 (기본)
        </button>
        {hasSavedGame && (
          <button
            onClick={onLoadSavedGame}
            className="w-full px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-xl transition duration-150 ease-in-out transform hover:scale-105 text-lg"
            aria-label="이어하기"
          >
            이어하기
          </button>
        )}
        <button
          onClick={onShowScriptImporter}
          className="w-full px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xl transition duration-150 ease-in-out transform hover:scale-105 text-lg"
          aria-label="커스텀 시나리오 파일 불러오기"
        >
          커스텀 시나리오 불러오기
        </button>
        <button
          onClick={handleExportOriginalScript}
          className="w-full px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xl transition duration-150 ease-in-out transform hover:scale-105 text-lg"
          aria-label="오리지널 시나리오 파일 내보내기"
        >
          오리지널 시나리오 내보내기
        </button>
      </div>
       <footer className="absolute bottom-4 text-xs text-slate-500 py-1">
        <p>&copy; {new Date().getFullYear()} JRPG 엔진. 모험이 당신을 기다립니다!</p>
      </footer>
    </div>
  );
};
