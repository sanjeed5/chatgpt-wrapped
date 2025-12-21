import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import type { Stats } from '../../types';

interface PeakSlideProps {
  isActive: boolean;
  stats: Stats;
}

export function PeakSlide({ isActive, stats }: PeakSlideProps) {
  const { peakDay, peakHour, peakDayDistribution } = stats;
  
  const days = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  const counts = days.map(day => peakDayDistribution[day] || 0);
  const maxCount = Math.max(...counts);

  return (
    <SlideWrapper isActive={isActive} background="dark">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[3.5cqw] uppercase tracking-[0.15em] text-accent-1 mb-4"
      >
        Your Rhythm
      </motion.p>
      
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[6cqw] font-semibold mb-6"
      >
        You were most active on
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <div className="text-[15cqw] font-bold text-accent-2 leading-none">
          {peakDay}
        </div>
        <div className="text-[6cqw] text-text-grey mt-2">
          at <span className="text-white">{peakHour}</span>
        </div>
      </motion.div>
      
      {/* Day chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-end gap-2 h-[20vh] opacity-70"
      >
        {days.map((day, idx) => {
          const height = maxCount > 0 ? (counts[idx] / maxCount) * 100 : 0;
          const isActive = day === peakDay;
          
          return (
            <motion.div
              key={day}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.5 + idx * 0.05, duration: 0.4 }}
              className={`w-4 rounded origin-bottom ${
                isActive 
                  ? 'bg-accent-2 shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                  : 'bg-gray-700'
              }`}
              style={{ height: `${Math.max(height, 5)}%` }}
              title={`${day}: ${counts[idx]} conversations`}
            />
          );
        })}
      </motion.div>
    </SlideWrapper>
  );
}
