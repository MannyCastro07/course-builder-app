import { cn } from '@/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning';
}

export function Progress({ 
  value, 
  max = 100, 
  size = 'md',
  showLabel = false,
  variant = 'default',
  className,
  ...props 
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variants = {
    default: 'bg-blue-600',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="flex items-center gap-2">
        <div className={cn('flex-1 bg-gray-200 rounded-full overflow-hidden', sizes[size])}>
          <div
            className={cn('h-full rounded-full transition-all duration-300', variants[variant])}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
}
