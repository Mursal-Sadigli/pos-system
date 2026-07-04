'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function Switch({ className, checked, onCheckedChange, onChange, ...props }: SwitchProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.target.checked);
  };

  return (
    <label className={cn('relative inline-flex h-6 w-11 cursor-pointer items-center', className)}>
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={handleChange}
        {...props}
      />
      <span className="pointer-events-none absolute inset-0 rounded-full border border-border bg-muted transition-colors peer-checked:border-primary peer-checked:bg-primary" />
      <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform duration-200 peer-checked:translate-x-5 peer-checked:bg-primary-foreground" />
    </label>
  );
}

export { Switch };
