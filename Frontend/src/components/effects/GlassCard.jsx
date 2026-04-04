import React from 'react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function GlassCard({ children, className, interactive = true }) {
    return (
        <div className={cn(
            "glass-card bg-[#141415] relative h-full rounded-xl w-full",
            interactive && "glass-card-hover",
            className
        )}>
            {children}
        </div>
    );
}
