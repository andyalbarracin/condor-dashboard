/**
 * File: types.ts
 * Path: /lib/parsers/types.ts
 * Last Modified: 2025-12-08
 * Description: Types con ID único para evitar duplicados
 */

export interface NormalizedDataPoint {
  id?: string // NUEVO: ID único para evitar duplicados por fecha
  date: string
  source: "linkedin" | "twitter" | "instagram" | "tiktok" | "google-analytics"
  metrics: Record<string, number | string>
}

export interface ParsedDataset {
  source: "linkedin" | "twitter" | "instagram" | "tiktok" | "google-analytics"
  subType?: "content" | "followers" | "visitors" | "account_overview"
  dataPoints: NormalizedDataPoint[]
  rawHeaders: string[]
  metadata?: Record<string, any> 
  normalizedHeaders: Record<string, string>
  dateRange: {
    start: string
    end: string
  }
}

export interface ParserResult {
  success: boolean
  data?: ParsedDataset
  error?: string
  warnings?: string[]
}