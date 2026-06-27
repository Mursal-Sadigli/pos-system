import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-border/40">
        {children}
      </div>
    </div>
  );
}