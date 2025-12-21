import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/helpers';

interface SlideWrapperProps {
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
  background?: 'dark' | 'gradient-1' | 'gradient-2' | 'error' | 'screenshot';
}

const backgrounds = {
  dark: 'bg-black',
  'gradient-1': 'slide-gradient-1',
  'gradient-2': 'slide-gradient-2',
  error: 'bg-gradient-to-b from-[#1a0000] to-black',
  screenshot: 'bg-gradient-to-br from-[#111] to-[#222]',
};

export function SlideWrapper({ isActive, children, className, background = 'dark' }: SlideWrapperProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'absolute inset-0 flex flex-col justify-center items-center p-0',
            backgrounds[background],
            className
          )}
        >
          <div className="w-full h-full flex flex-col justify-center items-center text-center max-w-[460px] mx-auto px-8 py-[8vh]">
            {children}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
