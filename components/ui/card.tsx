import type React from "react"
import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
}

export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-6",
        interactive && "hover:border-primary/30 hover:bg-card-hover cursor-pointer",
        "transition-all duration-300",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("mb-4", className)}>{children}</div>
}

export function CardTitle({ children, className }: CardProps) {
  return <h3 className={cn("text-lg font-semibold text-foreground", className)}>{children}</h3>
}

export function CardDescription({ children, className }: CardProps) {
  return <p className={cn("text-sm text-neutral-500 mt-1", className)}>{children}</p>
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("", className)}>{children}</div>
}
