import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import type { Stats } from '../../types';

interface JourneySlideProps {
  isActive: boolean;
  stats: Stats;
}

export function JourneySlide({ isActive, stats }: JourneySlideProps) {
  const { allTime } = stats;
  
  let daysSinceText = `${allTime.daysSinceFirst} days ago`;
  if (allTime.daysSinceFirst === 0) daysSinceText = 'Today';
  else if (allTime.daysSinceFirst === 1) daysSinceText = 'Yesterday';

  return (
    <SlideWrapper isActive={isActive} background="dark">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[3.5cqw] uppercase tracking-[0.15em] text-accent-1 mb-4"
      >
        The Beginning
      </motion.p>
      
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-[7cqw] font-semibold mb-8"
      >
        Your AI journey began
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="text-[11cqw] font-bold text-accent-1 leading-tight uppercase tracking-tight">
          {allTime.firstDate}
        </div>
        <p className="text-[5.5cqw] text-text-grey mt-4 font-medium">
          {daysSinceText}
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 border border-white/20 rounded-2xl p-5 max-w-[90%]"
      >
        <p className="text-[3cqw] text-text-grey uppercase mb-2">First conversation:</p>
        <p className="text-[4cqw] leading-relaxed break-words">{allTime.firstConvoTitle}</p>
      </motion.div>
    </SlideWrapper>
  );
}
