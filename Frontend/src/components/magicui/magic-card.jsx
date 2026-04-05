"use client"

import React, { useCallback, useEffect, useRef } from "react"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function MagicCard({
                              children,
                              className,
                              gradientSize = 250,
                              gradientOpacity = 0.15, // Lowered opacity so text remains readable
                          }) {
    const mouseX = useMotionValue(-gradientSize)
    const mouseY = useMotionValue(-gradientSize)

    const handlePointerMove = useCallback(
        (e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            mouseX.set(e.clientX - rect.left)
            mouseY.set(e.clientY - rect.top)
        },
        [mouseX, mouseY]
    )

    const handlePointerLeave = useCallback(() => {
        mouseX.set(-gradientSize)
        mouseY.set(-gradientSize)
    }, [mouseX, mouseY, gradientSize])

    return (
        <motion.div
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className={cn(
                "group relative flex h-full w-full overflow-hidden rounded-xl bg-transparent",
                className
            )}
        >
            <div className="relative z-10 w-full h-full">{children}</div>

            {/* The interactive glowing background */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
                style={{
                    background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, 
            hsl(var(--secondary) / ${gradientOpacity}), 
            transparent 100%)
          `,
                }}
            />

            {/* The interactive glowing border */}
            <motion.div
                className="pointer-events-none absolute inset-0 rounded-xl border border-border transition-colors duration-300 z-0 group-hover:border-transparent"
                style={{
                    maskImage: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, 
            black, 
            transparent 100%)
          `,
                    borderImageSource: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, 
            hsl(var(--secondary)), 
            hsl(var(--accent)), 
            transparent 100%)
          `,
                    borderImageSlice: 1,
                }}
            />
        </motion.div>
    )
}
