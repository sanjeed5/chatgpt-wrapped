import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import type { Stats } from '../../types';

interface GrowthSlideProps {
  isActive: boolean;
  stats: Stats;
}

export function GrowthSlide({ isActive, stats }: GrowthSlideProps) {
  const { yoyGrowth, previousYearConversations, conversations, year } = stats;
  
  if (!yoyGrowth || previousYearConversations === 0) return null;
  
  const growthMultiple = yoyGrowth >= 1 
    ? `${yoyGrowth.toFixed(1)}x`
    : `${Math.round(yoyGrowth * 100)}%`;
  
  let message = 'Steady compared to last year.';
  if (yoyGrowth >= 3) message = 'Huge jump from last year.';
  else if (yoyGrowth >= 2) message = 'You leaned on it a lot more.';
  else if (yoyGrowth >= 1.5) message = 'You reached for it more often.';
  else if (yoyGrowth < 1) message = 'A lighter year—still showed up.';
  
  const growthLabel = yoyGrowth >= 1 ? 'more than last year' : "of last year's volume";
  
  const maxVal = Math.max(previousYearConversations, conversations);
  const prevHeight = (previousYearConversations / maxVal) * 100;
  const currHeight = (conversations / maxVal) * 100;

  return (
    <SlideWrapper isActive={isActive} background="gradient-2">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[3.5cqw] uppercase tracking-[0.15em] text-accent-1 mb-4"
      >
        Year Over Year
      </motion.p>
      
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[22cqw] font-bold leading-[0.9] tracking-tight text-gradient-accent mb-2"
      >
        {growthMultiple}
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[4cqw] text-text-grey mb-4"
      >
        {growthLabel}
      </motion.p>
      
      {/* Graph */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-end justify-center gap-5 h-[14vh] w-full my-4"
      >
        <div className="flex flex-col items-center gap-2 h-full justify-end w-10">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-full bg-gray-600 rounded-t origin-bottom"
            style={{ height: `${prevHeight}%` }}
          />
          <span className="text-[3cqw] text-text-grey">{year - 1}</span>
        </div>
        <div className="flex flex-col items-center gap-2 h-full justify-end w-10">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full bg-accent-1 rounded-t origin-bottom shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            style={{ height: `${currHeight}%` }}
          />
          <span className="text-[3cqw] text-text-grey">{year}</span>
        </div>
      </motion.div>
      
      {/* Stats boxes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex gap-4 w-full max-w-[360px] mt-4"
      >
        <div className="flex-1 bg-white/5 rounded-2xl p-4 text-center">
          <span className="block text-[8cqw] font-bold text-gray-300">{previousYearConversations}</span>
          <span className="text-[3cqw] text-text-grey">{year - 1}</span>
        </div>
        <div className="flex-1 bg-accent-1/10 rounded-2xl p-4 text-center shadow-[0_8px_30px_rgba(16,185,129,0.15)]">
          <span className="block text-[8cqw] font-bold text-accent-1">{conversations}</span>
          <span className="text-[3cqw] text-text-grey">{year}</span>
        </div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="font-serif italic text-[6cqw] text-text-grey mt-4"
      >
        {message}
      </motion.p>
    </SlideWrapper>
  );
}
