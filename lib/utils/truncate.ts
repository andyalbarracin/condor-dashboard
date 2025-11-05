export function truncate(text: string | null | undefined, maxLen = 200): string {
  if (!text) return ""
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 3) + "..."
}
