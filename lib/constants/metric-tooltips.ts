/**
 * File: metric-tooltips.ts
 * Path: /lib/constants/metric-tooltips.ts
 * Last Modified: 2026-02-02
 * Description: Definiciones de tooltips para todas las métricas
 */

export interface MetricTooltip {
  title: string
  description: string
  calculation?: string
  goodRange?: string
  platform?: "linkedin" | "twitter" | "all"
}

export const METRIC_TOOLTIPS: Record<string, MetricTooltip> = {
  // KPI Cards
  total_posts: {
    title: "Total Posts",
    description: "The number of posts published in the selected time period",
    goodRange: "3-7 posts per week for consistent growth",
    platform: "all",
  },
  
  total_impressions: {
    title: "Total Impressions",
    description: "How many times your content appeared on someone's screen",
    calculation: "Sum of all post impressions",
    goodRange: "Varies by audience size - focus on growth rate",
    platform: "all",
  },
  
  total_engagements: {
    title: "Total Engagements",
    description: "All interactions with your content: likes, comments, shares, and clicks",
    calculation: "Reactions + Comments + Shares + Clicks",
    platform: "all",
  },
  
  engagement_rate: {
    title: "Engagement Rate",
    description: "How attractive your content was to your audience",
    calculation: "(Engagements ÷ Impressions) × 100",
    goodRange: "LinkedIn: 2-5% | Twitter/X: 0.5-1%",
    platform: "all",
  },
  
  followers_gained: {
    title: "Followers Gained",
    description: "New followers acquired in this period",
    goodRange: "5-10% monthly growth is healthy",
    platform: "all",
  },
  
  // Content Metrics
  impressions: {
    title: "Impressions",
    description: "Number of times this content was displayed",
    goodRange: "Higher is better - shows reach",
    platform: "all",
  },
  
  engagements: {
    title: "Engagements",
    description: "Total interactions with this post",
    calculation: "Likes + Comments + Shares + Clicks",
    platform: "all",
  },
  
  clicks: {
    title: "Clicks",
    description: "How many people clicked on links in your post",
    goodRange: "LinkedIn: 1-2% CTR | Twitter: 0.5-1% CTR",
    platform: "all",
  },
  
  reactions: {
    title: "Reactions/Likes",
    description: "Positive responses to your content",
    goodRange: "Most common engagement type",
    platform: "all",
  },
  
  comments: {
    title: "Comments",
    description: "Replies and conversations started by your post",
    goodRange: "Most valuable engagement - shows deep interest",
    platform: "all",
  },
  
  shares: {
    title: "Shares/Reposts",
    description: "How many times people shared your content with their network",
    goodRange: "Best indicator of valuable content",
    platform: "all",
  },
  
  ctr: {
    title: "Click-Through Rate (CTR)",
    description: "Percentage of people who clicked after seeing your post",
    calculation: "(Clicks ÷ Impressions) × 100",
    goodRange: "LinkedIn: 1-2% | Twitter: 0.5-1%",
    platform: "all",
  },
  
  // Benchmark Metrics
  avg_engagements_per_post: {
    title: "Avg Engagements per Post",
    description: "Average number of interactions each post receives",
    calculation: "Total Engagements ÷ Total Posts",
    goodRange: "LinkedIn: 20-50 | Twitter: 5-15",
    platform: "all",
  },
  
  post_frequency: {
    title: "Post Frequency",
    description: "How often you publish content",
    calculation: "Posts per week",
    goodRange: "3-5 times per week for optimal growth",
    platform: "all",
  },
  
  reach_rate: {
    title: "Reach Rate",
    description: "What percentage of your followers see your content",
    calculation: "(Impressions ÷ Followers) × 100",
    goodRange: "LinkedIn: 10-20% | Twitter: 5-10%",
    platform: "all",
  },
}

export function getMetricTooltip(metricKey: string): MetricTooltip | null {
  return METRIC_TOOLTIPS[metricKey] || null
}