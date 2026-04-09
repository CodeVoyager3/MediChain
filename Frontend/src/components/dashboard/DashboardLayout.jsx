import React, { useMemo, useState } from "react"
import { LogOut, Menu, Link2, Sun, Moon, Wallet, ChevronRight } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import WalletAddress from "@/components/common/WalletAddress"
import { cn } from "@/lib/utils"
import "@/dashboard.css"

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function DashboardLayout({
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const roleLabel = useMemo(() => (role || "USER").toUpperCase(), [role])

  const SidebarContent = (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card text-foreground shadow-sm">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-2 px-2">
          <img src="/logo.png" alt="MediChain Logo" className="h-8 w-8 object-contain" />
          <p className="text-xl font-bold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-logo, "Ahsing", sans-serif)' }}>
            MediChain
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = activeNav === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavChange(item.id)
                setMobileOpen(false)
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition",
                active
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {active ? <ChevronRight className="ml-auto h-3.5 w-3.5" /> : null}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        {sidebarActions}
        <button
          type="button"
          onClick={toggleTheme}
          className="mb-3 mt-2 flex w-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <span>Theme</span>
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
        <div className="mb-3 rounded-lg border border-border bg-muted/40 p-2">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            <Wallet className="h-3 w-3" />
            Wallet
          </div>
          <WalletAddress address={walletAddress} className="text-foreground" />
          <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{roleLabel}</div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="watermelon-theme flex gap-3 h-screen overflow-hidden bg-muted/30 p-3 lg:p-4">
      <aside className="hidden h-full w-[260px] shrink-0 lg:block">{SidebarContent}</aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} aria-label="Close sidebar" />
          <aside className="relative h-full w-[260px] p-2">{SidebarContent}</aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-border bg-card p-2 text-foreground lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground sm:flex">
              <span className={cn("h-2 w-2 rounded-full", walletConnected ? "bg-emerald-500" : "bg-rose-500")} />
              {walletConnected ? "Wallet Connected" : "Wallet Disconnected"}
            </div>
            {topRight}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background/40 p-4 lg:p-6">
          {!walletConnected && (
            <Alert variant="destructive" className="mb-6 rounded-xl border-dashed">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>
                We lost connection to your wallet, or Thirdweb services are experiencing an issue. Blockchain operations may fail until the connection is restored.
              </AlertDescription>
            </Alert>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
