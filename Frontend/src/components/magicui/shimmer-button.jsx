import React, { forwardRef } from 'react';
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export const ShimmerButton = forwardRef(
    (
        {
            shimmerColor = 'hsl(var(--background) / 0.8)',
            shimmerSize = '0.05em',
            shimmerDuration = '3s',
            borderRadius = '12px', // Modernized from 100px to match your standard rounded-xl
            background = 'hsl(var(--accent))',
            className,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                style={{
                    '--spread': '90deg',
                    '--shimmer-color': shimmerColor,
                    '--radius': borderRadius,
                    '--speed': shimmerDuration,
                    '--cut': shimmerSize,
                    '--bg': background,
                }}
                className={cn(
                    'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden px-6 py-2.5 font-medium tracking-wide',
                    '[border-radius:var(--radius)] [background:var(--bg)]',
                    'transform-gpu transition-all duration-300 ease-in-out active:scale-[0.98]',
                    className
                )}
                ref={ref}
                {...props}
            >
                {/* spark container */}
                <div className="-z-30 blur-[2px] absolute inset-0 overflow-visible pointer-events-none">
                    <div className="animate-shimmer-slide absolute inset-0 aspect-square h-full rounded-none">
                        <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
                    </div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center">
                    {children}
                </div>

                {/* Highlight inner shadow */}
                <div className="absolute inset-0 size-full rounded-[inherit] px-4 py-1.5 shadow-[inset_0_-4px_10px_rgba(255,255,255,0.1)] transform-gpu transition-all duration-300 ease-in-out group-hover:shadow-[inset_0_-2px_10px_rgba(255,255,255,0.2)] group-active:shadow-[inset_0_-6px_10px_rgba(255,255,255,0.1)] pointer-events-none" />

                {/* backdrop */}
                <div className="absolute [inset:var(--cut)] -z-20 [border-radius:var(--radius)] [background:var(--bg)] pointer-events-none" />
            </button>
        );
    }
);
ShimmerButton.displayName = 'ShimmerButton';
