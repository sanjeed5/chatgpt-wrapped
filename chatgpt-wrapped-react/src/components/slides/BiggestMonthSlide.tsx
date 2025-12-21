import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import type { Stats } from '../../types';

interface BiggestMonthSlideProps {
  isActive: boolean;
  stats: Stats;
}

export function BiggestMonthSlide({ isActive, stats }: BiggestMonthSlideProps) {
  const { biggestMonth } = stats;
  
  let monthDesc = 'That month was your hot streak.';
  if (biggestMonth.count < 5) monthDesc = 'Quality time.';
  else if (biggestMonth.count < 20) monthDesc = 'A productive month.';
  else if (biggestMonth.count > 100) monthDesc = 'A ridiculous amount of chats.';

  return (
    <SlideWrapper isActive={isActive} background="gradient-1">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[3.5cqw] uppercase tracking-[0.15em] text-accent-1 mb-4"
      >
        Peak Performance
      </motion.p>
      
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[6cqw] font-semibold mb-6"
      >
        Your busiest month
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="mb-6"
      >
        <div className="text-[20cqw] font-bold leading-none text-gradient-accent">
          {biggestMonth.month}
        </div>
        <div className="text-[6cqw] text-text-grey mt-4">
          <span className="text-white font-bold">{biggestMonth.count}</span> conversations
        </div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-serif italic text-[6cqw] text-text-grey mt-8"
      >
        {monthDesc}
      </motion.p>
    </SlideWrapper>
  );
}
