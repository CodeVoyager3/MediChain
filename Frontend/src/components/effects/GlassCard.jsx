import React from 'react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function GlassCard({ children, className, interactive = true }) {
    return (
        <div className={cn(
            // Dynamic glassmorphism using theme variables
            "relative h-full w-full rounded-xl border border-border/50 bg-background/60 backdrop-blur-md shadow-sm transition-all duration-300",
            interactive && "hover:bg-background/80 hover:shadow-md hover:border-border",
            className
        )}>
            {children}
        </div>
    );
}
