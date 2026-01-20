/**
 * Composant Dialog pour les modales
 */

import * as React from 'react';

const Dialog = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ className = '', open, onOpenChange, children, ...props }, ref) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={() => onOpenChange?.(false)}
    >
      <div
        ref={ref}
        className={`bg-white rounded-lg shadow-lg max-w-md w-full mx-4 ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});
Dialog.displayName = 'Dialog';

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 ${className}`} {...props} />
));
DialogContent.displayName = 'DialogContent';

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 text-center sm:text-left mb-4 ${className}`}
    {...props}
  />
));
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = '', ...props }, ref) => (
  <h2
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

export { Dialog, DialogContent, DialogHeader, DialogTitle };
