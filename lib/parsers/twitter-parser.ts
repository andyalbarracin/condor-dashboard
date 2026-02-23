
/**
 * File: twitter-parser.ts
 * Path: /lib/parsers/twitter-parser.ts
 * Last Modified: 2025-12-22
 * Description: Parser para X/Twitter que soporta "Post text" Y "Tweet text"
 */

import type { ParserResult, NormalizedDataPoint } from './types'

function parseTwitterDate(dateStr: string): string {
  if (!dateStr) throw new Error('Empty date string')
  
  const trimmed = dateStr.trim().replace(/^"|"$/g, '')
  
  // Formato: "Wed, Jul 23, 2025"
  const twitterMatch = trimmed.match(/^[A-Za-z]+,\s+([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/)
  if (twitterMatch) {
    const [, monthStr, day, year] = twitterMatch
    const date = new Date(`${monthStr} ${day}, ${year}`)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const dayPadded = day.padStart(2, '0')
    return `${year}-${month}-${dayPadded}`
  }
  
  // Formato ISO: 2025-07-23
  if (trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return trimmed
  }
  
  throw new Error(`Unable to parse Twitter date: ${dateStr}`)
}

function cleanNumber(value: any): number {
  if (typeof value === 'number') return value
  if (!value) return 0
  
  const str = String(value).replace(/[,%]/g, '').trim()
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

export async function parseTwitterCSV(csvContent: string): Promise<ParserResult> {
  try {
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return {
        success: false,
        error: 'CSV file is empty or has insufficient data',
      }
    }
    
    // Parsear header
    const headerLine = lines[0]
    const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    
    // Buscar índices de columnas
    const dateIdx = headers.findIndex(h => h.toLowerCase() === 'date')
    
    // ✅ BUSCAR "post" O "tweet" en id/text/link
    const idIdx = headers.findIndex(h => {
      const lower = h.toLowerCase()
      return lower.includes('post id') || lower.includes('tweet id')
    })
    
    const textIdx = headers.findIndex(h => {
      const lower = h.toLowerCase()
      return lower.includes('post text') || lower.includes('tweet text')
    })
    
    const linkIdx = headers.findIndex(h => {
      const lower = h.toLowerCase()
      return lower.includes('post link') || lower.includes('tweet link')
    })
    
    if (dateIdx === -1) {
      return {
        success: false,
        error: 'No Date column found in CSV',
      }
    }
    
    const dataPoints: NormalizedDataPoint[] = []
    let parsedCount = 0
    let skippedCount = 0
    
    // Procesar cada línea
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue
      
      // Parsear CSV (considerando comillas)
      const fields: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim().replace(/^"|"$/g, ''))
          current = ''
        } else {
          current += char
        }
      }
      fields.push(current.trim().replace(/^"|"$/g, ''))
      
      const dateStr = fields[dateIdx]
      if (!dateStr || !dateStr.trim()) {
        skippedCount++
        continue
      }
      
      try {
        const normalizedDate = parseTwitterDate(dateStr)
        
        // Capturar todas las métricas
        const impressions = cleanNumber(fields[headers.findIndex(h => h.toLowerCase() === 'impressions')])
        const likes = cleanNumber(fields[headers.findIndex(h => h.toLowerCase() === 'likes')])
        const engagements = cleanNumber(fields[headers.findIndex(h => h.toLowerCase() === 'engagements')])
        const bookmarks = cleanNumber(fields[headers.findIndex(h => h.toLowerCase() === 'bookmarks')])
        const shares = cleanNumber(fields[headers.findIndex(h => h.toLowerCase() === 'shares')])
        const new_follows = cleanNumber(fields[headers.findIndex(h => h.toLowerCase() === 'new follows')])
        const replies = cleanNumber(fields[headers.findIndex(h => h.toLowerCase() === 'replies')])
        const reposts = cleanNumber(fields[headers.findIndex(h => h.toLowerCase() === 'reposts')])
        const profile_visits = cleanNumber(fields[headers.findIndex(h => h.toLowerCase() === 'profile visits')])
        const detail_expands = cleanNumber(fields[headers.findIndex(h => h.toLowerCase() === 'detail expands')])
        const url_clicks = cleanNumber(fields[headers.findIndex(h => h.toLowerCase() === 'url clicks')])
        const hashtag_clicks = cleanNumber(fields[headers.findIndex(h => h.toLowerCase() === 'hashtag clicks')])
        const permalink_clicks = cleanNumber(fields[headers.findIndex(h => h.toLowerCase() === 'permalink clicks')])
        
        const metrics: Record<string, number | string> = {
          post_id: idIdx !== -1 ? fields[idIdx] : '',
          title: textIdx !== -1 ? fields[textIdx] : '',
          link: linkIdx !== -1 ? fields[linkIdx] : '',
          impressions,
          likes,
          reactions: likes,
          engagements,
          bookmarks,
          shares,
          new_follows,
          replies,
          comments: replies,
          reposts,
          profile_visits,
          detail_expands,
          url_clicks,
          hashtag_clicks,
          permalink_clicks,
        }
        
        const clicks = url_clicks + hashtag_clicks + permalink_clicks
        metrics.clicks = clicks
        
        if (impressions > 0) {
          metrics.engagement_rate = (engagements / impressions) * 100
        } else {
          metrics.engagement_rate = 0
        }
        
        dataPoints.push({
            id: `twitter-${normalizedDate}-${fields[idIdx] || parsedCount}`,
          date: normalizedDate,
          source: 'twitter',
          metrics,
        })
        
        parsedCount++
        
      } catch (error) {
        skippedCount++
        continue
      }
    }
    
    if (dataPoints.length === 0) {
      return {
        success: false,
        error: 'No valid data points found after parsing',
      }
    }
    
    dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    return {
      success: true,
      data: {
        source: 'twitter',
        subType: 'content',
        dataPoints,
        rawHeaders: headers,
        normalizedHeaders: {},
        dateRange: {
          start: dataPoints[0].date,
          end: dataPoints[dataPoints.length - 1].date,
        },
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error parsing Twitter CSV',
    }
  }
}