import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import { Button } from '../ui/Button';
import { useApp } from '../../store/AppContext';
import { parseFile } from '../../utils/parser';
import { computeStats } from '../../utils/stats';
import { generateDemoData } from '../../utils/demo-data';
import { cn } from '../../utils/helpers';

interface UploadSlideProps {
  isActive: boolean;
}

export function UploadSlide({ isActive }: UploadSlideProps) {
  const { dispatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'GO_TO_SLIDE', payload: 1 }); // Loading slide

    try {
      // Add minimum loading time for UX
      const [conversations] = await Promise.all([
        parseFile(file),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);

      const stats = computeStats(conversations);
      dispatch({ type: 'SET_STATS', payload: { stats, isDemo: false } });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to process file' });
    }
  }, [dispatch]);

  const handleDemo = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'GO_TO_SLIDE', payload: 1 }); // Loading slide

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const conversations = generateDemoData();
      const stats = computeStats(conversations);
      dispatch({ type: 'SET_STATS', payload: { stats, isDemo: true } });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Demo failed: ' + (err instanceof Error ? err.message : 'Unknown error') });
    }
  }, [dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <SlideWrapper isActive={isActive} background="dark">
      <div className="flex flex-col h-full justify-between w-full">
        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 text-center"
          >
            <div className="font-bold uppercase text-[12cqw] tracking-tight text-white leading-[0.9] mb-2">
              ChatGPT Wrapped
            </div>
            <h1 className="text-[10cqw] font-bold leading-none bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent tracking-tighter">
              2025
            </h1>
            <p className="text-[5cqw] text-text-grey font-serif italic mt-2">
              Discover how you really use ChatGPT.
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              'w-full max-w-sm p-4 rounded-2xl border border-white/10 bg-white/5 cursor-pointer transition-all',
              isDragOver && 'border-accent-1 bg-accent-1/10'
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">1</span>
                <a
                  href="https://chatgpt.com/#settings/DataControls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-accent-1 transition-colors underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Export your data
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">2</span>
                <a
                  href="https://mail.google.com/mail/u/0/#advanced-search/from=noreply%40tm.openai.com&subject=ChatGPT+-+Your+data+export+is+ready"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-accent-1 transition-colors underline underline-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Check your email for the .zip
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">3</span>
                <Button
                  variant="primary"
                  className="flex-1 text-sm py-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Upload it here
                </Button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.zip"
              onChange={handleFileChange}
              className="hidden"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-text-grey text-sm mt-4"
          >
            🔒 100% private · runs in your browser
          </motion.p>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-2 text-sm text-text-grey"
        >
          <p>
            <button
              onClick={handleDemo}
              className="text-accent-1 hover:underline"
            >
              Try with sample data
            </button>
          </p>
          <p>
            Made by{' '}
            <a href="https://x.com/sanjeed_i" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Sanjeed
            </a>{' '}
            · Not affiliated with OpenAI
          </p>
        </motion.div>
      </div>
    </SlideWrapper>
  );
}
