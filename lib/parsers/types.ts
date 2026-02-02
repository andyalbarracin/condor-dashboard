/**
 * File: types.ts
 * Path: /lib/parsers/types.ts
 * Last Modified: 2026-02-02
 * Description: Types con MultiDataset support para followers/visitors/content
 */

export interface NormalizedDataPoint {
  id?: string // ID único para evitar duplicados por fecha
  date: string
  source: "linkedin" | "twitter" | "instagram" | "tiktok" | "google-analytics"
  metrics: Record<string, number | string>
  metadata?: Record<string, any> // ✅ Para guardar title, content, link
}

// ✅ Alias para simplificar imports
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

// ⭐ NUEVO: MultiDataset interface para guardar múltiples tipos de datos
export interface MultiDataset {
  content?: ParsedDataset      // Posts de LinkedIn/Twitter
  followers?: ParsedDataset    // LinkedIn followers
  visitors?: ParsedDataset     // LinkedIn visitors
  
  // Metadatos agregados
  lastUpdated?: string
  platforms?: string[]
}

// ⭐ NUEVO: Helper function para detectar formato
export function isMultiDataset(data: any): data is MultiDataset {
  if (!data || typeof data !== 'object') return false
  
  // Si tiene alguna de estas keys, es MultiDataset
  return 'content' in data || 'followers' in data || 'visitors' in data
}

export interface ParserResult {
  success: boolean
  data?: ParsedDataset
  error?: string
  warnings?: string[]
}