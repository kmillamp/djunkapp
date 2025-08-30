import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "accent"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const variants = {
      primary: "bg-white/5 border-white/10",
      secondary: "bg-purple-500/5 border-purple-500/20", 
      accent: "bg-cyan-500/5 border-cyan-500/20"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "glass-card backdrop-blur-xl transition-all duration-300 hover:bg-white/10",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }