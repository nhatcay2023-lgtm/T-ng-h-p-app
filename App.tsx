import React, { useState, useCallback, useRef } from 'react';
import { PoemOptions, SavedPoem } from './types';
import { generatePoem } from './services/geminiService';
import PoemForm from './components/PoemForm';
import PoemDisplay from './components/PoemDisplay';
import Header from './components/Header';
import { FONT_OPTIONS } from './constants';

const App: React.FC = () => {
  const getInitialPoemOptions = (): PoemOptions => ({
    type: 'Thơ Tự Do',
    lines: 8,
    style: 'Lãng mạn',
    context: 'Tình yêu đôi lứa',
    customContext: '',
    emotions: ['Vui tươi'],
    audience: 'Người lớn',
    inspiration: '',
  });

  const [poemOptions, setPoemOptions] = useState<PoemOptions>(getInitialPoemOptions());
  const [generatedPoem, setGeneratedPoem] = useState<string>('');
  const [poemTitle, setPoemTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState<string>(FONT_OPTIONS[0].family);
  const abortControllerRef = useRef<AbortController | null>(null);


  const handleGeneratePoem = useCallback(async () => {
    if (isLoading) return;

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    setGeneratedPoem('');
    setPoemTitle('');
    try {
      const { title, content } = await generatePoem(poemOptions, abortControllerRef.current.signal);
      setGeneratedPoem(content);
      setPoemTitle(title);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Poem generation was cancelled.');
        setError('Quá trình sáng tác đã bị huỷ.');
      } else {
        setError('Đã xảy ra lỗi khi sáng tác thơ. Vui lòng thử lại.');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [poemOptions, isLoading]);
  
  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
  };

  const handleReset = () => {
    setPoemOptions(getInitialPoemOptions());
    setGeneratedPoem('');
    setPoemTitle('');
    setError(null);
  };

  const handleLoadPoem = (poem: SavedPoem) => {
    setGeneratedPoem(poem.content);
    setPoemTitle(poem.title);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PoemForm
            options={poemOptions}
            setOptions={setPoemOptions}
            onSubmit={handleGeneratePoem}
            onCancel={handleCancelGeneration}
            isLoading={isLoading}
            selectedFont={selectedFont}
            setSelectedFont={setSelectedFont}
          />
          <PoemDisplay
            poem={generatedPoem}
            isLoading={isLoading}
            error={error}
            onReset={handleReset}
            onLoadPoem={handleLoadPoem}
            selectedFont={selectedFont}
            poemTitle={poemTitle}
            setPoemTitle={setPoemTitle}
          />
        </main>
      </div>
    </div>
  );
};

export default App;