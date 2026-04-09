import React, { useEffect, useState } from "react"
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
} from "motion/react"
import { ArrowUp, ArrowUpRight } from "lucide-react"

const DRAG_BUFFER = 60
const VELOCITY_THRESHOLD = 500

function WigglingCard({ card, i, x, cardWidth, gap }) {
  const center = -(i * (cardWidth + gap))
  const distance = useTransform(x, (v) => v - center)

  const rotate = useTransform(
    distance,
    [-cardWidth, -cardWidth * 0.1, 0, cardWidth * 0.1, cardWidth],
    [10, 10, 0, -10, -10]
  )
  const blur = useTransform(
    distance,
    [-cardWidth, -cardWidth * 0.2, 0, cardWidth * 0.2, cardWidth],
    [4, 2, 0, 2, 4]
  )
  const opacity = useTransform(
    distance,
    [-cardWidth, -cardWidth * 0.2, 0, cardWidth * 0.2, cardWidth],
    [0, 0.8, 1, 0.8, 0]
  )

  const filter = useMotionTemplate`blur(${blur}px)`

  return (
    <motion.div
      style={{ opacity, rotate, filter, minWidth: cardWidth }}
      className="relative flex h-72 flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm sm:h-80"
    >
      <div className="flex flex-col gap-10">
        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-muted">
          {card.icon ? <card.icon className="h-10 w-10 text-card-foreground" strokeWidth={1.5} /> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex w-fit items-center rounded-lg bg-muted px-3 py-0.5 text-base font-medium text-muted-foreground">
            <ArrowUp className="mr-1 h-3 w-3" />
            {card.percentage}
          </div>
          <h2 className="text-3xl font-bold text-card-foreground sm:text-[42px]">{card.value}</h2>
          <p className="text-lg font-medium text-muted-foreground sm:text-[20px]">{card.label}</p>
        </div>
      </div>
      <div className="absolute bottom-9 right-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
          <ArrowUpRight className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  )
}

export function WigglingCards({ cards = [] }) {
  const [index, setIndex] = useState(0)
  const [dimensions, setDimensions] = useState({ cardWidth: 320, gap: 200 })

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth
      if (width < 640) {
        setDimensions({
          cardWidth: Math.min(width - 64, 300),
          gap: 40,
        })
      } else {
        setDimensions({
          cardWidth: 320,
          gap: 120,
        })
      }
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const { cardWidth, gap } = dimensions
  const x = useMotionValue(-(index * (cardWidth + gap)))

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x
    const velocity = info.velocity.x
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      setIndex((prev) => Math.min(prev + 1, cards.length - 1))
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      setIndex((prev) => Math.max(prev - 1, 0))
    }
  }

  return (
    <div className="flex flex-col items-center py-4">
      <div style={{ width: cardWidth + 40 }} className="relative mt-2">
        <motion.div
          className="flex touch-pan-y"
          drag="x"
          dragConstraints={{
            left: -(Math.max(cards.length - 1, 0)) * (cardWidth + gap),
            right: 0,
          }}
          style={{
            x,
            gap: `${gap}px`,
            perspective: 1000,
          }}
          animate={{
            x: -(index * (cardWidth + gap)),
          }}
          transition={{ type: "spring", stiffness: 300, damping: 40 }}
          onDragEnd={handleDragEnd}
        >
          {cards.map((card, i) => (
            <WigglingCard key={card.id ?? i} card={card} i={i} x={x} cardWidth={cardWidth} gap={gap} />
          ))}
        </motion.div>
      </div>
      <div className="mt-8 flex gap-3">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-3 w-3 rounded-lg transition-colors duration-200 ease-out ${
              i === index ? "bg-muted-foreground" : "bg-muted"
            }`}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}
