import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function BentoStats({ items = [] }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((item, index) => (
        <Card
          key={item.label}
          className={cn(
            "overflow-hidden rounded-2xl border bg-gradient-to-br shadow-sm",
            index === 0 && "from-card to-muted/40",
            index === 1 && "from-card to-indigo-500/10",
            index === 2 && "from-card to-emerald-500/10",
            index === 3 && "from-card to-orange-500/10"
          )}
        >
          <CardContent className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-foreground">{item.value}</p>
            {item.subtext ? <p className="mt-2 text-xs text-muted-foreground">{item.subtext}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
