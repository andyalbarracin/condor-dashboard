// Data types for normalized analytics

export interface NormalizedDataPoint {
  date: string // ISO 8601 format: YYYY-MM-DD
  source: "linkedin" | "twitter" | "instagram" | "tiktok" | "google-analytics"
  metrics: Record<string, number | string>
}

export interface ParsedDataset {
  source: "linkedin" | "twitter" | "instagram" | "tiktok" | "google-analytics"
  subType?: "followers" | "content" | "account_overview" // For LinkedIn which has multiple sheets
  dataPoints: NormalizedDataPoint[]
  rawHeaders: string[]
  normalizedHeaders: Record<string, string> // Maps raw header to normalized key
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
