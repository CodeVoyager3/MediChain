'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';
import { cn } from '../../lib/utils';

export const AnimatedThemeToggler = ({ className, duration = 400, ...props }) => {
  const [isDark, setIsDark] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Read persisted preference on first load
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }

    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    );

    const applyTheme = () => {
      const newTheme = !isDark;
      setIsDark(newTheme);
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    if (typeof document.startViewTransition !== 'function') {
      applyTheme();
      return;
    }

    const transition = document.startViewTransition(() => {
      flushSync(applyTheme);
    });

    const ready = transition?.ready;
    if (ready && typeof ready.then === 'function') {
      ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    }
  }, [isDark, duration]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200',
        'border-border bg-muted/50 text-foreground hover:bg-muted hover:scale-110',
        className
      )}
      {...props}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
