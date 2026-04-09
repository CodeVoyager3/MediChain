import { useState } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export function FluidTabs({ tabs = [], defaultActive, onChange }) {
  const initialActive = defaultActive || tabs[0]?.id || ""
  const [active, setActive] = useState(initialActive)

  const handleChange = (id) => {
    setActive(id)
    onChange?.(id)
  }

  return (
    <div className="relative flex items-center gap-1 rounded-lg border border-border bg-background px-1 py-1 sm:gap-2">
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className="group relative rounded-lg px-3 py-2.5 outline-none sm:px-4 sm:py-3"
            type="button"
          >
            {isActive ? (
              <motion.div
                layoutId="active-pill"
                transition={{ type: "spring", stiffness: 280, damping: 25, mass: 0.8 }}
                className="absolute inset-0 rounded-lg border border-border bg-foreground shadow-xs"
              />
            ) : null}
            <motion.div
              transition={{ duration: 0.3, ease: "easeOut" }}
              animate={{ filter: isActive ? ["blur(0px)", "blur(4px)", "blur(0px)"] : "blur(0px)" }}
              className={cn(
                "relative z-10 flex items-center gap-1.5 transition-colors duration-200 sm:gap-3",
                isActive
                  ? "font-bold text-background"
                  : "font-semibold text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon ? <span className="flex shrink-0 items-center justify-center">{tab.icon}</span> : null}
              <span className="whitespace-nowrap text-sm tracking-tight sm:text-base">{tab.label}</span>
            </motion.div>
          </button>
        )
      })}
    </div>
  )
}
