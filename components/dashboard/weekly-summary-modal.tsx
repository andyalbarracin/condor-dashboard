/**
 * File: weekly-summary-modal.tsx
 * Path: /components/dashboard/weekly-summary-modal.tsx
 * Last Modified: 2026-02-02
 * Description: Modal con 6 slides + navegación completa
 */

"use client"

import { useMemo } from "react"
import { LightboxModal } from "@/components/ui/lightbox-modal"
import { IntroSlide } from "./weekly-summary/intro-slide"
import { OverviewSlide } from "./weekly-summary/overview-slide"
import { TopContentSlide } from "./weekly-summary/top-content-slide"
import { GrowthSlide } from "./weekly-summary/growth-slide"
import { PlatformSlide } from "./weekly-summary/platform-slide"
import { ConclusionSlide } from "./weekly-summary/conclusion-slide"
import { calculateWeeklySummary } from "@/lib/analytics/weekly-summary-calculator"
import type { ParsedDataset } from "@/lib/parsers/types"

interface WeeklySummaryModalProps {
  isOpen: boolean
  onClose: () => void
  data: ParsedDataset
}

export function WeeklySummaryModal({ isOpen, onClose, data }: WeeklySummaryModalProps) {
  const summary = useMemo(() => {
    if (!data) return null
    return calculateWeeklySummary(data)
  }, [data])

  if (!summary) return null

  const slides = [
    <IntroSlide key="intro" />,
    <OverviewSlide key="overview" summary={summary} />,
    <TopContentSlide key="top-content" summary={summary} />,
    <GrowthSlide key="growth" summary={summary} />,
    <PlatformSlide key="platform" summary={summary} onClose={onClose} />,
    <ConclusionSlide key="conclusion" summary={summary} onClose={onClose} />,
  ]

  return (
    <LightboxModal
      key={isOpen ? "open" : "closed"}
      isOpen={isOpen}
      onClose={onClose}
      slides={slides}
      initialSlide={0}
    />
  )
}