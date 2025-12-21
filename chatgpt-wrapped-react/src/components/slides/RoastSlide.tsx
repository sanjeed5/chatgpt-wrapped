import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import type { Stats } from '../../types';

interface RoastSlideProps {
  isActive: boolean;
  stats: Stats;
}

export function RoastSlide({ isActive, stats }: RoastSlideProps) {
  const { roast } = stats;

  return (
    <SlideWrapper isActive={isActive} background="dark">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[3.5cqw] uppercase tracking-[0.15em] text-accent-1 mb-6"
      >
        The Reality Check
      </motion.p>
      
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[7cqw] font-semibold leading-[1.5] max-w-[90%]"
      >
        {roast.text}
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-[3.5cqw] text-gray-500 italic mt-6 max-w-[90%] leading-relaxed"
      >
        ({roast.reason})
      </motion.p>
    </SlideWrapper>
  );
}
