import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import type { Stats } from '../../types';

interface PersonaSlideProps {
  isActive: boolean;
  stats: Stats;
}

export function PersonaSlide({ isActive, stats }: PersonaSlideProps) {
  const { personality } = stats;
  const personaTitle = personality.type.replace(/^[^\w]+\s*/, '').trim();

  return (
    <SlideWrapper isActive={isActive} background="gradient-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="text-[15cqw] mb-6"
      >
        {personality.emoji}
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-[3.5cqw] uppercase tracking-[0.15em] text-accent-1 mb-4"
      >
        Your Archetype
      </motion.p>
      
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[12cqw] font-bold leading-none text-gradient-accent mb-4"
      >
        {personaTitle}
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-[5cqw] text-text-grey leading-relaxed max-w-[85%] mb-6"
      >
        {personality.description}
      </motion.p>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[3.5cqw] text-gray-500 italic max-w-[90%] leading-relaxed"
      >
        {personality.reason}
      </motion.p>
    </SlideWrapper>
  );
}
