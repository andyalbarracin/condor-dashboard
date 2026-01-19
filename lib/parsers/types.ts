/**
 * File: types.ts
 * Path: /lib/parsers/types.ts
 * Last Modified: 2025-12-22
 * Description: Types con ID único para evitar duplicados y alias DataPoint
 */

export interface NormalizedDataPoint {
  id?: string // ID único para evitar duplicados por fecha
  date: string
  source: "linkedin" | "twitter" | "instagram" | "tiktok" | "google-analytics"
  metrics: Record<string, number | string>
  metadata?: Record<string, any> // ✅ NUEVO: Para guardar title, content, link
}

// ✅ NUEVO: Alias para simplificar imports
export type DataPoint = NormalizedDataPoint

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