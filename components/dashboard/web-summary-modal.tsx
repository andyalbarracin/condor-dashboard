/**
 * File: web-summary-modal.tsx
 * Path: /components/dashboard/web-summary-modal.tsx
 * Last Modified: 2026-03-21
 * Description: Modal with 4 slides for web analytics summary
 */

"use client"

import { useMemo } from "react"
import { LightboxModal } from "@/components/ui/lightbox-modal"
import { WebIntroSlide } from "./web-summary/intro-slide"
import { TrafficSlide } from "./web-summary/traffic-slide"
import { CampaignsSlide } from "./web-summary/campaigns-slide"
import { WebConclusionSlide } from "./web-summary/conclusion-slide"
import { calculateWebSummary } from "@/lib/analytics/web-summary-calculator"
import type { ParsedDataset } from "@/lib/parsers/types"

interface WebSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  data: ParsedDataset
}

export function WebSummaryModal({ isOpen, onClose, data }: WebSummaryModalProps) {
  const summary = useMemo(() => {
    if (!data) return null
    return calculateWebSummary(data)
  }, [data])

  if (!summary) return null

  const slides = [
    <WebIntroSlide key="intro" />,
    <TrafficSlide key="traffic" summary={summary} />,
    <CampaignsSlide key="campaigns" summary={summary} />,
    <WebConclusionSlide key="conclusion" summary={summary} onClose={onClose} />,
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