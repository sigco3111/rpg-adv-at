
import React, { useState, useCallback } from 'react';

interface ScriptImporterProps {
  onScriptLoad: (scriptJson: string) => void;
  error?: string | null;
}

export const ScriptImporter: React.FC<ScriptImporterProps> = ({ onScriptLoad, error }) => {
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result;
          if (typeof text === 'string') {
            onScriptLoad(text);
          } else {
            setFileError("파일 내용을 읽는데 실패했습니다.");
          }
        };
        reader.onerror = () => {
          setFileError("파일 읽기 오류.");
        };
        reader.readAsText(file);
      } else {
        setFileError("잘못된 파일 형식입니다. JSON 파일을 업로드해주세요.");
      }
    }
  }, [onScriptLoad]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-md mx-auto my-10">
      <h2 className="text-2xl font-bold text-sky-400 mb-6">JRPG 스크립트 가져오기</h2>
      <p className="text-gray-300 mb-4 text-center">
        모험을 시작하려면 게임 시나리오를 JSON 파일로 업로드하세요.
      </p>
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-400
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-sky-600 file:text-white
                   hover:file:bg-sky-700
                   mb-4 cursor-pointer"
      />
      {fileError && <p className="text-red-400 text-sm mt-2">{fileError}</p>}
      {error && <p className="text-red-400 text-sm mt-2">스크립트 오류: {error}</p>}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>JSON 스크립트가 지정된 형식을 따르는지 확인하세요.</p>
        <p>샘플 스크립트 구조는 프로젝트 문서에서 찾을 수 있습니다.</p>
      </div>
    </div>
  );
};