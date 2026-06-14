'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBookStore } from '@/store/useBookStore';
import type { Theme } from '@/types';

export default function ThemeToggle() {
  const { theme, setTheme } = useBookStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const themes: { id: Theme; label: string; icon: string }[] = [
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'dark', label: 'Dark', icon: '🌙' },
    { id: 'vintage', label: 'Vintage', icon: '📜' },
  ];

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-xl border select-none transition-all duration-300"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
    >
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer select-none outline-none focus:outline-none"
            style={{
              color: isActive ? 'var(--bg-panel)' : 'var(--text-secondary)',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="active-theme-pill"
                className="absolute inset-0 rounded-lg z-0"
                style={{
                  background: 'var(--text-primary)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
