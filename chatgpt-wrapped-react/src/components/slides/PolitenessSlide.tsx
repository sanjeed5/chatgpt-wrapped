import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import type { Stats } from '../../types';

interface PolitenessSlideProps {
  isActive: boolean;
  stats: Stats;
}

export function PolitenessSlide({ isActive, stats }: PolitenessSlideProps) {
  const { politeness } = stats;
  const meterPercent = Math.min(100, Math.max(6, politeness.percentage));

  return (
    <SlideWrapper isActive={isActive} background="gradient-2">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[3.5cqw] uppercase tracking-[0.15em] text-accent-1 mb-4"
      >
        Manners Audit
      </motion.p>
      
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[22cqw] font-bold leading-[0.9] tracking-tight mb-2"
      >
        {politeness.count.toLocaleString()}
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[4cqw] text-text-grey mb-4"
      >
        {politeness.count === 1 ? 'please/thanks spotted' : 'pleases & thanks spotted'}
      </motion.p>
      
      {/* Meter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-[min(90%,320px)] h-2.5 bg-white/10 rounded-full overflow-hidden my-4"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${meterPercent}%` }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="h-full bg-gradient-to-r from-accent-1 to-accent-2 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"
        />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-serif italic text-[6cqw] text-text-grey mt-2 max-w-[90%]"
      >
        {politeness.description}
      </motion.p>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-[3cqw] text-text-grey mt-2"
      >
        {politeness.percentage}% of your messages
      </motion.p>
    </SlideWrapper>
  );
}
