import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'pass' | 'fail' | 'warn' | 'skip' | 'pending';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  const variantClasses: Record<BadgeVariant, string> = {
    // Generic badges (from ucp-merchants)
    default: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100',
    secondary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    outline: 'border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300',

    // Status badges (for ucp-doctor)
    pass: 'bg-green-600 dark:bg-green-500 text-white',
    fail: 'bg-red-600 dark:bg-red-500 text-white',
    warn: 'bg-yellow-600 dark:bg-yellow-500 text-white',
    skip: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400',
    pending: 'bg-blue-500 dark:bg-blue-400 text-white',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
