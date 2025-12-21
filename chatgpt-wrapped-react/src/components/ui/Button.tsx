import { cn } from '../../utils/helpers';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const baseStyles = 'font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 active:scale-95',
    secondary: 'bg-transparent text-white border border-white/30 px-6 py-3 rounded-full hover:bg-white/10 active:scale-95',
    text: 'text-text-grey hover:text-white px-4 py-2',
  };
  
  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
