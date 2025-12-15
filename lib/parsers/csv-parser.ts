/**
 * File: csv-parser.ts
 * Path: /lib/parsers/csv-parser.ts
 * Last Modified: 2025-12-09
 * Description: CSV parser con tipos explícitos para TypeScript
 */

import type { ParserResult, NormalizedDataPoint } from "./types"

function detectDelimiter(firstLine: string): string {
  const semiCount = (firstLine.match(/;/g) || []).length
  const commaCount = (firstLine.match(/,/g) || []).length
  return semiCount > commaCount ? ";" : ","
}

function parseCSVContent(content: string): string[][] {
  const lines = content.split("\n")
  const delimiter = detectDelimiter(lines[0])

  return lines
    .filter((line) => line.trim())
    .map((line) => {
      const fields: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === delimiter && !inQuotes) {
          fields.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      fields.push(current.trim())
      return fields
    })
}

function normalizeNumber(value: string): number {
  const normalized = value.replace(",", ".")
  return Number.parseFloat(normalized)
}

function parseDate(dateStr: string): string {
  const trimmed = dateStr.replace(/^"|"$/g, "").trim()

  const linkedinMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (linkedinMatch) {
    const [, month, day, year] = linkedinMatch
    return `${year}-${month}-${day}`
  }

  const twitterMatch = trimmed.match(/^[A-Za-z]+,\s+([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/)
  if (twitterMatch) {
    const [, monthStr, day, year] = twitterMatch
    const monthNum = new Date(`${monthStr} 1, 2025`).getMonth() + 1
    return `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  if (trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return trimmed
  }

  throw new Error(`Unable to parse date: ${dateStr}`)
}

function detectSource(
  headers: string[],
  firstRow: string[],
): {
  source: "linkedin" | "twitter"
  subType?: "followers" | "content" | "account_overview"
} {
  const headerStr = headers.join(" ").toLowerCase()

  if (headerStr.includes("followers") || headerStr.includes("organic followers")) {
    return { source: "linkedin", subType: "followers" }
  }

  if (headerStr.includes("impressions") && headerStr.includes("engagement rate")) {
    return { source: "linkedin", subType: "content" }
  }

  if (headerStr.includes("bookmarks") || headerStr.includes("reposts")) {
    return { source: "twitter", subType: "account_overview" }
  }

  return { source: "linkedin", subType: "content" }
}

function normalizeHeaders(headers: string[], source: "linkedin" | "twitter"): Record<string, string> {
  const map: Record<string, string> = {}

  headers.forEach((header) => {
    const normalized = header.toLowerCase().trim()

    if (normalized.includes("date")) {
      map[header] = "date"
    } else if (normalized.includes("followers") && normalized.includes("sponsored")) {
      map[header] = "sponsored_followers"
    } else if (normalized.includes("followers") && normalized.includes("organic")) {
      map[header] = "organic_followers"
    } else if (normalized.includes("followers") && normalized.includes("auto")) {
      map[header] = "auto_invited_followers"
    } else if (
      normalized.includes("followers") &&
      !normalized.includes("sponsored") &&
      !normalized.includes("organic")
    ) {
      map[header] = "total_followers"
    } else if (normalized.includes("impressions") && normalized.includes("organic")) {
      map[header] = "impressions_organic"
    } else if (normalized.includes("impressions") && normalized.includes("sponsored")) {
      map[header] = "impressions_sponsored"
    } else if (normalized.includes("impressions") && normalized.includes("total")) {
      map[header] = "impressions_total"
    } else if (normalized.includes("impressions")) {
      map[header] = "impressions"
    } else if (normalized.includes("clicks") && normalized.includes("organic")) {
      map[header] = "clicks_organic"
    } else if (normalized.includes("clicks") && normalized.includes("sponsored")) {
      map[header] = "clicks_sponsored"
    } else if (normalized.includes("clicks")) {
      map[header] = "clicks"
    } else if (normalized.includes("reactions") && normalized.includes("organic")) {
      map[header] = "reactions_organic"
    } else if (normalized.includes("reactions")) {
      map[header] = "reactions"
    } else if (normalized.includes("comments") && normalized.includes("organic")) {
      map[header] = "comments_organic"
    } else if (normalized.includes("comments")) {
      map[header] = "comments"
    } else if (normalized.includes("reposts") && normalized.includes("organic")) {
      map[header] = "reposts_organic"
    } else if (normalized.includes("reposts")) {
      map[header] = "reposts"
    } else if (normalized.includes("engagement rate") && normalized.includes("organic")) {
      map[header] = "engagement_rate_organic"
    } else if (normalized.includes("engagement rate")) {
      map[header] = "engagement_rate"
    } else if (normalized.includes("likes")) {
      map[header] = "likes"
    } else if (normalized.includes("engagements")) {
      map[header] = "engagements"
    } else if (normalized.includes("bookmarks")) {
      map[header] = "bookmarks"
    } else if (normalized.includes("shares")) {
      map[header] = "shares"
    } else if (normalized.includes("new follows")) {
      map[header] = "new_follows"
    } else if (normalized.includes("unfollows")) {
      map[header] = "unfollows"
    } else if (normalized.includes("replies")) {
      map[header] = "replies"
    } else if (normalized.includes("profile visits")) {
      map[header] = "profile_visits"
    } else if (normalized.includes("video views")) {
      map[header] = "video_views"
    } else {
      map[header] = normalized.replace(/\s+/g, "_")
    }
  })

  return map
}

export async function parseCSV(csvContent: string): Promise<ParserResult> {
  try {
    const lines = csvContent.split("\n").filter((line) => line.trim() && !line.trim().startsWith("Aggregated"))

    if (lines.length < 2) {
      return {
        success: false,
        error: "CSV file is empty or has insufficient data",
      }
    }

    const rows = parseCSVContent(lines.join("\n"))

    if (rows.length < 2) {
      return {
        success: false,
        error: "No data rows found in CSV",
      }
    }

    const headers = rows[0]
    const dataRows = rows.slice(1)

    const { source, subType } = detectSource(headers, dataRows[0])
    const normalizedHeaderMap = normalizeHeaders(headers, source)

    const dateHeaderIndex = headers.findIndex((h) => normalizedHeaderMap[h] === "date")

    if (dateHeaderIndex === -1) {
      return {
        success: false,
        error: "No date column found",
      }
    }

    const dataPoints: NormalizedDataPoint[] = dataRows
      .map((row: string[]): NormalizedDataPoint | null => {
        const dateStr = row[dateHeaderIndex]
        if (!dateStr || !dateStr.trim()) return null

        const metrics: Record<string, number | string> = {}

        headers.forEach((header, index) => {
          const normalizedKey = normalizedHeaderMap[header]
          const value = row[index]?.trim()

          if (normalizedKey === "date") return

          if (!value) {
            metrics[normalizedKey] = 0
            return
          }

          if (!isNaN(Number.parseFloat(value))) {
            metrics[normalizedKey] = normalizeNumber(value)
          } else {
            metrics[normalizedKey] = value
          }
        })

        return {
          date: parseDate(dateStr),
          source,
          metrics,
        }
      })
      .filter((dp): dp is NormalizedDataPoint => dp !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (dataPoints.length === 0) {
      return {
        success: false,
        error: "No valid data points found after parsing",
      }
    }

    return {
      success: true,
      data: {
        source,
        subType,
        dataPoints,
        rawHeaders: headers,
        normalizedHeaders: normalizedHeaderMap,
        dateRange: {
          start: dataPoints[0].date,
          end: dataPoints[dataPoints.length - 1].date,
        },
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown parsing error",
    }
  }
}