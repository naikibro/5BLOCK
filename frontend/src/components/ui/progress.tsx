/**
 * Composant Progress - Barre de progression
 * Utilisé pour afficher les statistiques des cartes Pokémon
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = max > 0 
      ? Math.min(100, Math.max(0, (value / max) * 100))
      : 0;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={props['aria-label'] || `Progress: ${Math.round(percentage)}%`}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        {...props}
      >
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
