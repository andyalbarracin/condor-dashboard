import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface KPICardProps {
  label: string
  value: string | number
  change?: number
  subText?: string
}

export function KPICard({ label, value, change, subText }: KPICardProps) {
  const isPositive = change ? change >= 0 : false

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-neutral-500">{label}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {subText && <p className="text-xs text-neutral-600 mt-1">{subText}</p>}
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                isPositive ? "bg-success/10 text-success" : "bg-error/10 text-error"
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
