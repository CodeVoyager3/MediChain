import React, { useEffect, useState } from 'react';

export function AmbientParticles() {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (query.matches) return;

        const generated = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // %
            y: Math.random() * 100, // %
            size: Math.random() * 16 + 8, // 8px to 24px
            delay: Math.random() * 5, // s
            duration: Math.random() * 5 + 5, // 5s to 10s
        }));
        setParticles(generated);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden mix-blend-screen opacity-50 dark:opacity-40">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute bg-[hsl(var(--particle-color)_/_0.15)] rounded-full blur-[3px]"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`
                    }}
                />
            ))}
        </div>
    );
}
