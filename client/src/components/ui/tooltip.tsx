import * as React from 'react';

// Minimal tooltip stubs to satisfy imports during development.
// These are intentionally simple passthrough components —
// replace with a full tooltip implementation as needed.

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const Tooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const TooltipTrigger = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const TooltipContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Tooltip;
