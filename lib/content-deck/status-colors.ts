import type { BoardItemStatus, BoardPlatform, BuyerStage } from "./types"

export const BOARD_STATUS_CONFIG: Record<
  BoardItemStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  idea_only:   { label: "Idea only",   bg: "bg-neutral-200 dark:bg-neutral-700",  text: "text-neutral-600 dark:text-neutral-300", dot: "bg-neutral-400" },
  not_started: { label: "Not Started", bg: "bg-neutral-100 dark:bg-neutral-800",  text: "text-neutral-400",                       dot: "bg-neutral-300" },
  in_progress: { label: "In Progress", bg: "bg-orange-500",                       text: "text-white",                             dot: "bg-orange-500" },
  in_review:   { label: "In Review",   bg: "bg-yellow-500",                       text: "text-white",                             dot: "bg-yellow-500" },
  dependent:   { label: "Dependent",   bg: "bg-slate-700",                        text: "text-white",                             dot: "bg-slate-600" },
  approved:    { label: "Approved",    bg: "bg-purple-600",                       text: "text-white",                             dot: "bg-purple-500" },
  scheduled:   { label: "Scheduled",   bg: "bg-blue-500",                         text: "text-white",                             dot: "bg-blue-500" },
  published:   { label: "Published",   bg: "bg-emerald-600",                      text: "text-white",                             dot: "bg-emerald-500" },
  done:        { label: "Done",        bg: "bg-green-600",                        text: "text-white",                             dot: "bg-green-500" },
  blocked:     { label: "Blocked",     bg: "bg-red-600",                          text: "text-white",                             dot: "bg-red-500" },
}

export const BOARD_PLATFORM_CONFIG: Record<
  BoardPlatform,
  { label: string; bg: string; text: string }
> = {
  social_media:  { label: "Social Media",   bg: "bg-blue-500",     text: "text-white" },
  blog:          { label: "Blog",           bg: "bg-orange-500",   text: "text-white" },
  email:         { label: "Email",          bg: "bg-teal-600",     text: "text-white" },
  video:         { label: "Video",          bg: "bg-red-500",      text: "text-white" },
  landing_page:  { label: "Landing Page",   bg: "bg-violet-500",   text: "text-white" },
  webinar_event: { label: "Webinar/Event",  bg: "bg-indigo-500",   text: "text-white" },
  internal:      { label: "Internal",       bg: "bg-neutral-500",  text: "text-white" },
  other:         { label: "Other",          bg: "bg-neutral-300",  text: "text-neutral-700" },
}

export const BUYER_STAGE_CONFIG: Record<
  BuyerStage,
  { label: string; bg: string; text: string }
> = {
  awareness:     { label: "Awareness",     bg: "bg-green-500",   text: "text-white" },
  consideration: { label: "Consideration", bg: "bg-yellow-500",  text: "text-white" },
  decision:      { label: "Decision",      bg: "bg-orange-500",  text: "text-white" },
  retention:     { label: "Retention",     bg: "bg-blue-500",    text: "text-white" },
  internal:      { label: "Internal",      bg: "bg-neutral-400", text: "text-white" },
}
