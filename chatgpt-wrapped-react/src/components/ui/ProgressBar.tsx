import { useEffect, useRef } from 'react';
import { cn } from '../../utils/helpers';

interface ProgressBarProps {
  isActive: boolean;
  isCompleted: boolean;
  duration: number;
  isPaused: boolean;
  onComplete?: () => void;
}

export function ProgressBar({ isActive, isCompleted, duration, isPaused, onComplete }: ProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    if (!isActive) return;
    
    const fill = fillRef.current;
    if (!fill) return;
    
    if (isPaused) {
      // Freeze at current position
      const computedStyle = window.getComputedStyle(fill);
      const width = computedStyle.getPropertyValue('width');
      fill.style.transition = 'none';
      fill.style.width = width;
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    
    // Start animation
    fill.style.transition = 'none';
    fill.style.width = '0%';
    
    // Force reflow
    void fill.offsetWidth;
    
    fill.style.transition = `width ${duration}ms linear`;
    fill.style.width = '100%';
    
    timerRef.current = setTimeout(() => {
      onComplete?.();
    }, duration);
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, isPaused, duration, onComplete]);
  
  return (
    <div className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden">
      <div
        ref={fillRef}
        className={cn(
          'h-full bg-white rounded-full',
          isCompleted && 'w-full',
          !isActive && !isCompleted && 'w-0'
        )}
        style={isCompleted ? { width: '100%', transition: 'none' } : undefined}
      />
    </div>
  );
}
