import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';
    
    const variants = {
      default: 'bg-blue-600 text-white',
      destructive: 'bg-red-600 text-white',
      outline: 'border-2 border-gray-700 text-gray-900 bg-white',
      secondary: 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
    };

    return (
      <span
        role="status"
        aria-live="polite"
        className={`${baseStyles} ${variants[variant]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
