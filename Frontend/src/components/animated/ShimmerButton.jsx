import { cn } from "@/lib/utils"

export function ShimmerButton({ children, className, ...props }) {
  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-lg px-6 py-3 font-medium",
        "bg-primary text-primary-foreground",
        "hover:shadow-lg transition-shadow duration-300",
        "group",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div
        className={cn(
          "absolute inset-0 -translate-x-full",
          "bg-gradient-to-r from-transparent via-white/20 to-transparent",
          "group-hover:translate-x-full transition-transform duration-700"
        )}
      />
    </button>
  )
}
