import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import type { Stats } from '../../types';

interface WordsSlideProps {
  isActive: boolean;
  stats: Stats;
}

export function WordsSlide({ isActive, stats }: WordsSlideProps) {
  const { wordsTypedFormatted, wordsTyped, booksWritten } = stats;
  
  let comparison: React.ReactNode;
  if (booksWritten >= 5) {
    comparison = <>That's <span className="text-accent-1 font-bold">{booksWritten}</span> books worth.</>;
  } else if (booksWritten >= 1) {
    comparison = <>That's <span className="text-accent-1 font-bold">{booksWritten}</span> book{booksWritten === 1 ? '' : 's'} worth.</>;
  } else if (wordsTyped >= 1000) {
    const essays = Math.max(1, Math.floor(wordsTyped / 500));
    comparison = <>That's <span className="text-accent-1 font-bold">{essays}</span> essays worth.</>;
  } else {
    const tweets = Math.max(1, Math.floor(wordsTyped / 40));
    comparison = <>That's about <span className="text-accent-1 font-bold">{tweets}</span> tweets worth.</>;
  }

  return (
    <SlideWrapper isActive={isActive} background="dark">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[3.5cqw] uppercase tracking-[0.15em] text-accent-1 mb-4"
      >
        The Conversation
      </motion.p>
      
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[22cqw] font-bold leading-[0.9] tracking-tight text-gradient mb-2"
      >
        {wordsTypedFormatted}
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[4cqw] text-text-grey mb-8"
      >
        Words typed by you
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-[5cqw] bg-white/10 px-6 py-4 rounded-full mt-8"
      >
        {comparison}
      </motion.div>
    </SlideWrapper>
  );
}
