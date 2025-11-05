"use client"

import { AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function WebTab() {
  return (
    <Card className="border-yellow-500/50 bg-yellow-500/5">
      <CardContent className="pt-6">
        <div className="flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-500">Coming Soon</p>
            <p className="text-sm text-yellow-400 mt-1">
              Google Analytics 4 integration is under development. Connect your GA4 account to visualize web analytics
              here.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
