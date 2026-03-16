/**
 * File: google-analytics-parser.ts
 * Path: /lib/parsers/google-analytics-parser.ts
 * Last Modified: 2026-03-05
 * Description: Parser para archivos CSV de Google Analytics 4 (múltiples formatos)
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

export interface GAUTMCampaign {
  source: string
  medium: string
  campaign: string
  campaign_id: string
  source_medium: string
  sessions: number
}

function detectCSVFormat(lines: string[]): 'traffic_sources' | 'utm_campaigns' | 'unknown' {
  for (const line of lines) {
    // Formato 1: Traffic Sources (Session campaign como primera columna)
    if (line.includes('Session campaign') && line.includes('Engaged sessions') && !line.includes('Session source')) {
      return 'traffic_sources'
    }
    
    // Formato 2: UTM Campaigns (tiene Session source / medium)
    if (line.includes('Session source / medium') || line.includes('Session source/medium')) {
      return 'utm_campaigns'
    }
  }
  return 'unknown'
}

function parseTrafficSourcesFormat(lines: string[]): ParsedDataset {
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
  
  const normalizedHeaders: Record<string, string> = {}
  headers.forEach((header) => {
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

function parseUTMCampaignsFormat(lines: string[]): ParsedDataset {
  let startDate = ''
  let endDate = ''
  
  // Buscar fechas en comentarios
  for (const line of lines) {
    if (line.includes('Start date:')) {
      const match = line.match(/(\d{8})/)
      if (match) startDate = match[1]
    }
    if (line.includes('End date:')) {
      const match = line.match(/(\d{8})/)
      if (match) endDate = match[1]
    }
  }
  
  // Buscar el header
  let headerIndex = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Session source / medium')) {
      headerIndex = i
      break
    }
  }
  
  if (headerIndex === -1) {
    throw new Error('No se encontró el header con Session source / medium')
  }
  
  const headerLine = lines[headerIndex]
  const headers = headerLine.split(',').map(h => h.trim())
  
  // Índices de columnas
  const colIndexes = {
    sourceMedium: headers.findIndex(h => h.toLowerCase().includes('session source')),
    campaign: headers.findIndex(h => h.toLowerCase().includes('session campaign')),
    sessions: headers.findIndex(h => h.toLowerCase() === 'sessions')
  }
  
  if (colIndexes.sourceMedium === -1 || colIndexes.sessions === -1) {
    throw new Error('Faltan columnas requeridas (Session source/medium o Sessions)')
  }
  
  const campaigns: GAUTMCampaign[] = []
  const dataPoints: NormalizedDataPoint[] = []
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith('#')) continue
    
    const fields = line.split(',')
    if (fields.length < 3) continue
    
    const sourceMediumRaw = fields[colIndexes.sourceMedium]?.trim() || ''
    const campaignRaw = colIndexes.campaign !== -1 ? fields[colIndexes.campaign]?.trim() : ''
    const sessionsStr = fields[colIndexes.sessions]?.trim()
    const sessions = parseInt(sessionsStr) || 0
    
    if (sessions === 0) continue
    
    // Parsear "source / medium"
    let source = '(not set)'
    let medium = '(not set)'
    
    if (sourceMediumRaw.includes(' / ')) {
      const parts = sourceMediumRaw.split(' / ')
      source = parts[0]?.trim() || '(not set)'
      medium = parts[1]?.trim() || '(not set)'
    } else {
      source = sourceMediumRaw || '(not set)'
    }
    
    const campaign = campaignRaw || '(not set)'
    
    campaigns.push({
      source,
      medium,
      campaign,
      campaign_id: '(not set)', // Este formato no tiene campaign_id
      source_medium: sourceMediumRaw,
      sessions
    })
    
    dataPoints.push({
      id: `ga4-utm-${i}`,
      date: endDate || new Date().toISOString().split('T')[0],
      source: 'google-analytics',
      metrics: { 
        sessions,
        source,
        medium,
        campaign
      }
    })
  }
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return new Date().toISOString().split('T')[0]
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
    normalizedHeaders: {},
    metadata: {
      utmCampaigns: campaigns,
      totalSessions: campaigns.reduce((sum, c) => sum + c.sessions, 0)
    }
  }
}

export function parseGoogleAnalyticsCSV(fileContent: string, filename: string): ParsedDataset {
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  const format = detectCSVFormat(lines)
  
  if (format === 'traffic_sources') {
    return parseTrafficSourcesFormat(lines)
  } else if (format === 'utm_campaigns') {
    return parseUTMCampaignsFormat(lines)
  } else {
    throw new Error('Formato de CSV de Google Analytics no reconocido')
  }
}