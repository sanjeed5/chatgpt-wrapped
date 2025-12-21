import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import type { Stats } from '../../types';

interface ModelSlideProps {
  isActive: boolean;
  stats: Stats;
}

export function ModelSlide({ isActive, stats }: ModelSlideProps) {
  return (
    <SlideWrapper isActive={isActive} background="dark">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[3.5cqw] uppercase tracking-[0.15em] text-accent-1 mb-4"
      >
        The Tool
      </motion.p>
      
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[6cqw] font-semibold mb-6"
      >
        Your Go-To Model
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="flex flex-col items-center gap-4"
      >
        <div className="text-[15cqw] mb-4">🤖</div>
        <h1 className="text-[22cqw] font-bold leading-[0.9] tracking-tight text-gradient">
          {stats.topModel}
        </h1>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-serif italic text-[6cqw] text-text-grey mt-8"
      >
        Your steady pick.
      </motion.p>
    </SlideWrapper>
  );
}
