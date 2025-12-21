import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { SlideWrapper } from './SlideWrapper';
import { Button } from '../ui/Button';
import { useApp } from '../../store/AppContext';
import type { Stats } from '../../types';

interface SummarySlideProps {
  isActive: boolean;
  stats: Stats;
}

export function SummarySlide({ isActive, stats }: SummarySlideProps) {
  const { state, dispatch } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloadState, setDownloadState] = useState<'idle' | 'generating' | 'done'>('idle');
  
  const personaTitle = (stats.personality.archetype || stats.personality.type || '').replace(/^[^\w]+\s*/, '').trim();

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    
    setDownloadState('generating');
    
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null });
      const link = document.createElement('a');
      link.download = `chatgpt-wrapped-${stats.year}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      setDownloadState('done');
      setTimeout(() => setDownloadState('idle'), 2000);
    } catch (err) {
      console.error('Failed to generate image:', err);
      setDownloadState('idle');
    }
  }, [stats.year]);

  const handleShareX = useCallback(() => {
    const text = encodeURIComponent(
      `My ChatGPT Wrapped ${stats.year}: ${stats.conversations} conversations this year! 🤖✨\n\nCheck out yours at gptwrapped.sanjeed.in`
    );
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank', 'width=550,height=420');
  }, [stats.year, stats.conversations]);

  const handleReplay = useCallback(() => {
    dispatch({ type: 'GO_TO_SLIDE', payload: 3 });
  }, [dispatch]);

  const handleGetWrapped = useCallback(() => {
    dispatch({ type: 'GO_TO_SLIDE', payload: 0 });
  }, [dispatch]);

  return (
    <SlideWrapper isActive={isActive} background="screenshot">
      {/* Summary Card */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full aspect-[4/5] bg-black border-4 border-white p-6 flex flex-col justify-between mb-6 shadow-[10px_10px_0px_rgba(255,255,255,0.2)]"
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-700 pb-4">
          <span className="text-[5cqw] font-black uppercase tracking-tight">ChatGPT Wrapped</span>
          <span className="text-[6cqw] font-black bg-black text-white px-2 py-0.5 border border-white">
            {stats.year}
          </span>
        </div>
        
        {/* Body */}
        <div className="flex-1 flex flex-col items-center justify-center py-4 gap-4">
          <div className="text-center">
            <div className="text-[24cqw] font-black leading-[0.9] text-accent-1" style={{ textShadow: '2px 2px 0px #fff' }}>
              {stats.conversations}
            </div>
            <div className="text-[4cqw] text-white uppercase font-bold tracking-widest mt-2 bg-gray-700 px-3 py-1 inline-block">
              Conversations
            </div>
          </div>
          
          <div className="bg-white text-black border-2 border-white px-5 py-2 rounded-full font-bold -rotate-2">
            <span className="text-[5cqw]">{personaTitle}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="text-center border border-gray-700 p-2.5 bg-gray-900">
              <span className="block text-[6cqw] font-bold">{stats.activeDays}</span>
              <span className="block text-[2.5cqw] text-gray-400 uppercase mt-1">Active Days</span>
            </div>
            <div className="text-center border border-gray-700 p-2.5 bg-gray-900">
              <span className="block text-[6cqw] font-bold">{stats.totalHours}</span>
              <span className="block text-[2.5cqw] text-gray-400 uppercase mt-1">Hours</span>
            </div>
            <div className="text-center border border-gray-700 p-2.5 bg-gray-900">
              <span className="block text-[6cqw] font-bold">{stats.wordsTypedFormatted}</span>
              <span className="block text-[2.5cqw] text-gray-400 uppercase mt-1">Words</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-right text-[3cqw] text-gray-500 font-mono border-t-2 border-gray-700 pt-4">
          gptwrapped.sanjeed.in
        </div>
      </motion.div>

      {/* Actions */}
      {state.isDemo ? (
        <>
          <Button onClick={handleGetWrapped} className="w-full">
            Get Your Wrapped
          </Button>
        </>
      ) : (
        <>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[4cqw] text-text-grey font-serif italic mb-4"
          >
            Save it and share with friends
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3 w-full"
          >
            <Button onClick={handleDownload} disabled={downloadState === 'generating'}>
              {downloadState === 'generating' ? 'Generating...' : downloadState === 'done' ? '✓ Downloaded!' : 'Download Image'}
            </Button>
            <Button variant="secondary" onClick={handleShareX}>
              Share on X
            </Button>
          </motion.div>
        </>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleReplay}
        className="text-text-grey hover:text-white transition-colors mt-4 text-sm"
      >
        ↻ Replay
      </motion.button>
    </SlideWrapper>
  );
}
