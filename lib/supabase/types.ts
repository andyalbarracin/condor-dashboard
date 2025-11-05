export interface AnalyticsDataset {
  id: string
  user_id: string
  name: string
  source: "linkedin_followers" | "linkedin_content" | "x_account" | "custom"
  data: Record<string, unknown>[]
  created_at: string
  updated_at: string
}

export interface AnalyticsRecord {
  [key: string]: string | number | boolean | null
  date: string
}
