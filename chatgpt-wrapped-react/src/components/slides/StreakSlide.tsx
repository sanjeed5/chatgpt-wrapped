import { motion } from 'framer-motion';
import { SlideWrapper } from './SlideWrapper';
import type { Stats } from '../../types';
import { getMonthName, formatLocalDateKey } from '../../utils/helpers';

interface StreakSlideProps {
  isActive: boolean;
  stats: Stats;
}

export function StreakSlide({ isActive, stats }: StreakSlideProps) {
  const { longestStreak, dailyActivityAllTime, year } = stats;

  return (
    <SlideWrapper isActive={isActive} background="gradient-1">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[3.5cqw] uppercase tracking-[0.15em] text-accent-1 mb-4"
      >
        Consistency
      </motion.p>
      
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[22cqw] font-bold leading-[0.9] tracking-tight mb-2"
      >
        {longestStreak}
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[4cqw] text-text-grey mb-6"
      >
        {longestStreak === 1 ? 'day' : 'days straight'}
      </motion.p>
      
      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full my-4"
      >
        <Heatmap dailyActivity={dailyActivityAllTime} year={year} />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-serif italic text-[6cqw] text-text-grey mt-4"
      >
        Your longest streak. You showed up.
      </motion.p>
    </SlideWrapper>
  );
}

function Heatmap({ dailyActivity, year }: { dailyActivity: Record<string, number>; year: number }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate max count for coloring
  let maxCount = 0;
  Object.entries(dailyActivity).forEach(([key, count]) => {
    if (key.startsWith(String(year))) maxCount = Math.max(maxCount, count);
  });
  
  const halves = [
    { startMonth: 0, endMonth: 5, label: 'Jan–Jun' },
    { startMonth: 6, endMonth: 11, label: 'Jul–Dec' },
  ];
  
  return (
    <div className="flex flex-col gap-3">
      {halves.map(({ startMonth, endMonth }) => {
        const halfStart = new Date(year, startMonth, 1);
        const halfEnd = new Date(year, endMonth + 1, 0);
        
        // Snap to week boundaries
        const startDate = new Date(halfStart);
        startDate.setDate(halfStart.getDate() - halfStart.getDay());
        const endDate = new Date(halfEnd);
        endDate.setDate(halfEnd.getDate() + (6 - halfEnd.getDay()));
        
        const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const weeksCount = Math.ceil(totalDays / 7);
        
        // Generate month labels
        const monthLabels: { month: string; col: number }[] = [];
        let lastMonth = -1;
        for (let w = 0; w < weeksCount; w++) {
          const weekStart = new Date(startDate);
          weekStart.setDate(startDate.getDate() + w * 7);
          const month = weekStart.getMonth();
          if (month >= startMonth && month <= endMonth && month !== lastMonth) {
            monthLabels.push({ month: getMonthName(month), col: w + 1 });
            lastMonth = month;
          }
        }
        
        // Generate cells
        const cells: { key: string; col: number; row: number; level: number; isFuture: boolean; isOutside: boolean }[] = [];
        for (let w = 0; w < weeksCount; w++) {
          for (let d = 0; d < 7; d++) {
            const current = new Date(startDate);
            current.setDate(startDate.getDate() + w * 7 + d);
            const dateKey = formatLocalDateKey(current);
            const count = dailyActivity[dateKey] || 0;
            const isFuture = current > today;
            const isOutside = current < halfStart || current > halfEnd;
            
            let level = 0;
            if (count > 0 && !isOutside && !isFuture) {
              level = Math.min(4, Math.ceil((count / maxCount) * 4));
            }
            
            cells.push({ key: dateKey, col: w + 1, row: d + 1, level, isFuture, isOutside });
          }
        }
        
        return (
          <div key={startMonth} className="flex flex-col gap-1">
            {/* Month labels */}
            <div
              className="grid text-[8px] text-text-grey uppercase"
              style={{ gridTemplateColumns: `repeat(${weeksCount}, 1fr)` }}
            >
              {monthLabels.map(({ month, col }) => (
                <span key={month} style={{ gridColumn: col }}>{month}</span>
              ))}
            </div>
            
            {/* Grid */}
            <div
              className="grid gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${weeksCount}, 1fr)`, gridTemplateRows: 'repeat(7, 1fr)' }}
            >
              {cells.map(({ key, col, row, level, isFuture, isOutside }) => (
                <div
                  key={key}
                  className={`aspect-square rounded-[1px] ${
                    isOutside ? 'opacity-0' :
                    isFuture ? 'bg-white/10 opacity-15' :
                    level === 0 ? 'bg-white/10' :
                    level === 1 ? 'bg-accent-1/35' :
                    level === 2 ? 'bg-accent-1/55' :
                    level === 3 ? 'bg-accent-1/75' :
                    'bg-accent-1 shadow-[0_0_4px_rgba(16,185,129,0.4)]'
                  }`}
                  style={{ gridColumn: col, gridRow: row }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
