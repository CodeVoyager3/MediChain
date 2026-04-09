import React, { useMemo, useState } from 'react';
import { LogOut, Menu, Link2, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import WalletAddress from '@/components/common/WalletAddress';
import { cn } from '@/lib/utils';

export default function AppLayout({
  title,
  role,
  navItems,
  activeNav,
  onNavChange,
  onLogout,
  walletAddress,
  walletConnected = true,
  topRight = null,
  sidebarActions = null,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const roleLabel = useMemo(() => (role || 'USER').toUpperCase(), [role]);

  const SidebarContent = (
    <div className="flex h-full flex-col rounded-2xl border border-neutral-200 dark:border-white/10 bg-card dark:bg-card text-foreground dark:text-foreground shadow-sm">
      <div className="border-b border-neutral-200 dark:border-white/10 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-indigo-50 dark:bg-indigo-500/10 p-1.5 text-indigo-600 dark:text-indigo-400">
            <Link2 className="h-4 w-4" />
          </div>
          <p className="text-base font-bold tracking-tight dark:text-white">MediChain</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavChange(item.id);
                setMobileOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition',
                active
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300'
                  : 'border-transparent text-neutral-500 hover:border-neutral-200 hover:bg-neutral-50 hover:text-foreground dark:text-neutral-400 dark:hover:border-white/10 dark:hover:bg-card/5 dark:hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-neutral-200 dark:border-white/10 p-3">
        {sidebarActions}
        <div className="mb-3 mt-2 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 p-2">
          <WalletAddress address={walletAddress} className="text-foreground dark:text-white" />
          <div className="mt-1 text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{roleLabel}</div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100 dark:bg-background p-3 lg:p-4">
      <aside className="hidden h-full w-[250px] shrink-0 lg:block">{SidebarContent}</aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          />
          <aside className="relative h-full w-[250px] p-2">{SidebarContent}</aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10 bg-card dark:bg-card shadow-sm">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 dark:border-white/10 bg-card dark:bg-card px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-neutral-200 bg-card p-2 text-neutral-700 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-card text-neutral-500 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-indigo-500/30 dark:hover:text-indigo-400"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 px-2 py-1 text-xs text-neutral-500 dark:text-neutral-400">
              <span className={cn('h-2 w-2 rounded-full', walletConnected ? 'bg-emerald-500' : 'bg-rose-500')} />
              {walletConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
            </div>
            {topRight}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-background/50 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
