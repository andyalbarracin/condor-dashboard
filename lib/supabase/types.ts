/**
 * File: types.ts
 * Path: /lib/supabase/types.ts
 * Last Modified: 2026-04-16
 * Description: Type definitions for all Supabase database tables, enums, and helpers.
 *              Matches schema v2.1 (CONDOR-SCHEMA-MIGRATION-V2.0.sql + 003_onboarding_and_roles.sql).
 *              Used throughout the app for type safety in all Supabase queries.
 */

// ================================================================
// ENUMS — Match database CHECK constraints exactly
// ================================================================

export type UserRole = "user" | "admin" | "super_admin"

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"

export type BillingCycle = "monthly" | "annual"

export type WorkspaceMemberRole = "owner" | "admin" | "editor" | "viewer"

export type DatasetSource =
  | "linkedin"
  | "twitter"
  | "instagram"
  | "tiktok"
  | "google-analytics"
  | "facebook"
  | "youtube"
  | "custom"

export type DatasetSubType =
  | "content"
  | "followers"
  | "visitors"
  | "account_overview"
  | "utm_campaigns"
  | "traffic_sources"

export type ProcessingStatus = "pending" | "processing" | "processed" | "error"

export type PlatformProvider =
  | "google_analytics"
  | "linkedin"
  | "twitter_x"
  | "instagram"
  | "facebook"
  | "tiktok"

export type ConnectionStatus =
  | "disconnected"
  | "pending"
  | "connected"
  | "error"
  | "expired"

export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "500+"

export type PostingFrequency =
  | "daily"
  | "2-3x_week"
  | "1x_week"
  | "less_than_weekly"
  | "not_sure"

export type ReferralSource =
  | "linkedin"
  | "google_search"
  | "word_of_mouth"
  | "twitter_x"
  | "instagram"
  | "youtube"
  | "colleague"
  | "agency"
  | "other"

// ================================================================
// DATABASE TABLE TYPES — Row interfaces
// ================================================================

export interface SubscriptionPlan {
  id: string // 'starter' | 'professional' | 'agency' | 'enterprise'
  name: string
  description: string | null
  price_monthly: number
  price_annual: number
  max_workspaces: number
  max_users: number
  max_data_history_months: number
  has_linkedin: boolean
  has_twitter: boolean
  has_instagram: boolean
  has_tiktok: boolean
  has_ga4_csv: boolean
  has_ga4_oauth: boolean
  has_ai_insights: boolean
  has_ai_insights_limit: number // 0 = unlimited
  has_white_label: boolean
  has_scheduled_reports: boolean
  has_competitor_analysis: boolean
  has_api_access: boolean
  has_revenue_attribution: boolean
  stripe_product_id_monthly: string | null
  stripe_product_id_annual: string | null
  display_order: number
  is_active: boolean
  is_highlighted: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string // = auth.users.id
  email: string | null
  full_name: string | null
  avatar_url: string | null
  company_name: string | null
  job_title: string | null
  country: string | null
  timezone: string
  role: UserRole
  // Trial
  trial_started_at: string | null
  trial_ends_at: string | null
  trial_converted: boolean
  // Onboarding
  onboarding_step: number // 0 = not started, 1-5 = in progress, 6 = completed
  onboarding_completed: boolean
  // Company info from onboarding
  industry: string | null
  company_size: CompanySize | null
  website_url: string | null
  used_platforms: string[]
  posting_frequency: PostingFrequency | null
  referral_source: ReferralSource | null
  // UI preferences
  ui_theme: "light" | "dark"
  ui_language: "en" | "es"
  // Timestamps
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  billing_cycle: BillingCycle
  trial_start: string | null
  trial_end: string | null
  current_period_start: string | null
  current_period_end: string | null
  canceled_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_payment_intent_id: string | null
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  owner_id: string
  name: string
  slug: string | null
  industry: string | null
  logo_url: string | null
  website_url: string | null
  description: string | null
  white_label_logo_url: string | null
  white_label_name: string | null
  white_label_color: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AnalyticsDataset {
  id: string
  workspace_id: string
  user_id: string
  name: string
  source: DatasetSource
  sub_type: DatasetSubType | null
  data: Record<string, unknown>
  file_name: string | null
  file_size_bytes: number | null
  date_range_start: string | null
  date_range_end: string | null
  data_points_count: number
  processing_status: ProcessingStatus
  processing_error: string | null
  created_at: string
  updated_at: string
}

export interface AnalyticsMetric {
  id: string
  dataset_id: string
  workspace_id: string
  user_id: string
  date: string
  metric_name: string
  metric_value: number
  platform: string | null
  sub_type: string | null
  created_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceMemberRole
  invited_by: string | null
  invited_at: string
  accepted_at: string | null
}

export interface OnboardingResponse {
  id: string
  user_id: string
  goals: string[]
  acquisition_detail: string | null
  current_tools: string[]
  onboarding_started_at: string
  onboarding_finished_at: string | null
  device_type: string | null
  browser: string | null
}

export interface PlatformConnection {
  id: string
  user_id: string
  workspace_id: string
  provider: PlatformProvider
  status: ConnectionStatus
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  scope: string | null
  account_id: string | null
  account_name: string | null
  account_picture: string | null
  last_sync_at: string | null
  last_error: string | null
  connected_at: string | null
  disconnected_at: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  ip_address: string | null
  user_agent: string | null
  details: Record<string, unknown> | null
  created_at: string
}

// ================================================================
// COMPOSITE / VIEW TYPES — Used in app components
// ================================================================

/**
 * Profile enriched with active subscription and plan.
 * Use this as the main "current user" type throughout the app.
 */
export interface UserWithPlan {
  profile: Profile
  subscription: Subscription & { plan: SubscriptionPlan }
}

/**
 * Data needed to render the plan/role badge in the sidebar.
 */
export interface PlanBadgeData {
  planId: string
  planName: string
  status: SubscriptionStatus
  trialDaysLeft: number | null
  isTrialing: boolean
  isPaid: boolean
  role: UserRole
}

/**
 * Computed helper — calculates trial days left from subscription data.
 */
export function getTrialDaysLeft(subscription: Subscription | null): number | null {
  if (!subscription || subscription.status !== "trialing") return null
  if (!subscription.trial_end) return null

  const msLeft = new Date(subscription.trial_end).getTime() - Date.now()
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))
}

/**
 * Computed helper — returns true if user has access to a specific feature.
 * Used for feature gating throughout the app.
 */
export function hasFeatureAccess(
  plan: SubscriptionPlan | null,
  role: UserRole,
  feature: keyof Pick<
    SubscriptionPlan,
    | "has_instagram"
    | "has_tiktok"
    | "has_ga4_oauth"
    | "has_ai_insights"
    | "has_white_label"
    | "has_scheduled_reports"
    | "has_competitor_analysis"
    | "has_api_access"
    | "has_revenue_attribution"
  >
): boolean {
  // Super admins and admins always have access to everything
  if (role === "super_admin" || role === "admin") return true
  if (!plan) return false
  return plan[feature] === true
}