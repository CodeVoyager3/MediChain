import React from "react"
import { ArrowRight } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

const BentoGrid = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // theme styles
      "bg-background/50 border border-border backdrop-blur-sm [box-shadow:0_-20px_80px_-20px_rgba(255,255,255,0.05)_inset]",
      className
    )}
    {...props}
  >
    <div className="absolute inset-0 opacity-20 pointer-events-none">{background}</div>
    <div className="p-4 relative z-10">
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 transition-all duration-300 lg:group-hover:-translate-y-10">
        <Icon className="h-12 w-12 origin-left transform-gpu text-foreground/80 transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-semibold text-foreground font-display">
          {name}
        </h3>
        <p className="max-w-lg text-muted-foreground font-body text-sm mt-2">{description}</p>
      </div>

      <div
        className={cn(
          "pointer-events-none flex w-full translate-y-0 transform-gpu flex-row items-center transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:hidden mt-4"
        )}
      >
        <Button
          variant="link"
          className="pointer-events-auto p-0 font-body text-foreground h-auto"
        >
          <a href={href} className="flex items-center">
            {cta}
            <ArrowRight className="ms-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>

    <div
      className={cn(
        "pointer-events-none absolute bottom-0 hidden w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex"
      )}
    >
      <Button
        variant="link"
        className="pointer-events-auto p-0 font-body text-foreground h-auto"
      >
        <a href={href} className="flex items-center z-20 relative">
          {cta}
          <ArrowRight className="ms-2 h-4 w-4" />
        </a>
      </Button>
    </div>

    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-foreground/5" />
  </div>
)

export { BentoCard, BentoGrid }
