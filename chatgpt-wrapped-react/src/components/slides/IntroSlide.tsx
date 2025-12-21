import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import type { Stats } from '../../types';
import { formatNumberWithCommas } from '../../utils/helpers';

interface IntroSlideProps {
  isActive: boolean;
  stats: Stats;
}

export function IntroSlide({ isActive, stats }: IntroSlideProps) {
  let introDesc = 'ChatGPT became part of your routine.';
  if (stats.conversations < 10) introDesc = 'A few curious check-ins.';
  else if (stats.conversations < 50) introDesc = 'You stopped by when you needed a nudge.';
  else if (stats.activeDays >= 250) introDesc = 'Practically every day.';
  else if (stats.totalHours >= 120) introDesc = 'This was a full-on collaboration.';
  else if (stats.conversations >= 500) introDesc = 'This became your go-to sidekick.';
  else if (stats.activeDays >= 150) introDesc = 'A steady weekly rhythm.';
  else if (stats.totalHours >= 50) introDesc = 'Plenty of hours together.';

  return (
    <SlideWrapper isActive={isActive} background="gradient-1">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[3.5cqw] uppercase tracking-[0.15em] text-accent-1 mb-4"
      >
        Pulse Check
      </motion.p>
      
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="text-[22cqw] font-bold leading-[0.9] tracking-tight mb-2"
      >
        {stats.year}
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-serif italic text-[6cqw] text-text-grey mb-2"
      >
        {introDesc}
      </motion.p>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-[4cqw] text-gray-500 mb-6"
      >
        In {stats.year}, you logged {formatNumberWithCommas(stats.conversations)} chats across {formatNumberWithCommas(stats.activeDays)} days.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4 w-full max-w-[360px]"
      >
        <div className="flex-1 bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[100px]">
          <span className="text-[6cqw]">💬</span>
          <span className="text-[8cqw] font-bold">{stats.conversations}</span>
          <span className="text-[3cqw] text-text-grey uppercase">Conversations</span>
        </div>
        <div className="flex-1 bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[100px]">
          <span className="text-[6cqw]">📅</span>
          <span className="text-[8cqw] font-bold">{stats.activeDays}</span>
          <span className="text-[3cqw] text-text-grey uppercase">Active Days</span>
        </div>
      </motion.div>
    </SlideWrapper>
  );
}
