/**
 * File: google-analytics-parser.ts
 * Path: /lib/parsers/google-analytics-parser.ts
 * Last Modified: 2025-12-09
 * Description: Parser para archivos CSV de Google Analytics 4
 */

import type { ParsedDataset, NormalizedDataPoint } from "./types"

export interface GATrafficSource {
  campaign: string
  sessions: number
  engaged_sessions: number
  engagement_rate: number
  avg_engagement_time: number
  events_per_session: number
  event_count: number
  key_events: number
  session_key_event_rate: number
  total_revenue: number
}

export function parseGoogleAnalyticsCSV(fileContent: string, filename: string): ParsedDataset {
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  let startDate = ''
  let endDate = ''
  let account = ''
  let property = ''
  
  for (const line of lines) {
    if (line.includes('Start date:')) {
      startDate = line.split(':')[1].trim().replace('\r', '')
    }
    if (line.includes('End date:')) {
      endDate = line.split(':')[1].trim().replace('\r', '')
    }
    if (line.includes('Account:')) {
      account = line.split(':')[1].trim().replace('\r', '')
    }
    if (line.includes('Property:')) {
      property = line.split(':')[1].trim().replace('\r', '')
    }
  }
  
  const headerLineIndex = lines.findIndex(line => line.startsWith('Session campaign'))
  if (headerLineIndex === -1) {
    throw new Error('Could not find header line in Google Analytics CSV')
  }
  
  const headerLine = lines[headerLineIndex]
  const headers = headerLine.split(',').map(h => h.trim().replace('\r', ''))
  
  // Crear normalizedHeaders como objeto
  const normalizedHeaders: Record<string, string> = {}
  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().replace(/\s+/g, '_')
    normalizedHeaders[normalized] = header
  })
  
  const dataLines = lines.slice(headerLineIndex + 1)
  const trafficSources: GATrafficSource[] = []
  const dataPoints: NormalizedDataPoint[] = []
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i]
    if (!line || line.startsWith('#')) continue
    
    const values = line.split(',').map(v => v.trim().replace('\r', ''))
    
    if (values.length !== headers.length) continue
    
    const source: GATrafficSource = {
      campaign: values[0] || '(not set)',
      sessions: Number(values[1]) || 0,
      engaged_sessions: Number(values[2]) || 0,
      engagement_rate: Number(values[3]) || 0,
      avg_engagement_time: Number(values[4]) || 0,
      events_per_session: Number(values[5]) || 0,
      event_count: Number(values[6]) || 0,
      key_events: Number(values[7]) || 0,
      session_key_event_rate: Number(values[8]) || 0,
      total_revenue: Number(values[9]) || 0,
    }
    
    trafficSources.push(source)
    
    dataPoints.push({
      id: `ga-${i}`,
      date: endDate,
      source: 'google-analytics',
      metrics: {
        campaign: source.campaign,
        sessions: source.sessions,
        engaged_sessions: source.engaged_sessions,
        engagement_rate: source.engagement_rate * 100,
        avg_engagement_time: source.avg_engagement_time,
        events_per_session: source.events_per_session,
        event_count: source.event_count,
        key_events: source.key_events,
        session_key_event_rate: source.session_key_event_rate * 100,
        total_revenue: source.total_revenue,
      }
    })
  }
  
  const formatDate = (dateStr: string) => {
    if (dateStr.length === 8) {
      const year = dateStr.substring(0, 4)
      const month = dateStr.substring(4, 6)
      const day = dateStr.substring(6, 8)
      return `${year}-${month}-${day}`
    }
    return dateStr
  }
  
  return {
    source: 'google-analytics',
    dateRange: {
      start: formatDate(startDate),
      end: formatDate(endDate)
    },
    dataPoints,
    rawHeaders: headers,
    normalizedHeaders: normalizedHeaders,
    metadata: {
      account,
      property,
      trafficSources,
    }
  }
}