/**
 * File: linkedin-parser.ts
 * Path: /lib/parsers/linkedin-parser.ts
 * Last Modified: 2025-12-08
 * Description: Parser con IDs únicos para evitar duplicados
 */

import * as XLSX from 'xlsx'
import type { ParserResult, NormalizedDataPoint } from './types'

function parseLinkedInDate(dateStr: any): string {
  if (!dateStr) throw new Error('Empty date')
  
  if (dateStr instanceof Date) {
    const year = dateStr.getFullYear()
    const month = String(dateStr.getMonth() + 1).padStart(2, '0')
    const day = String(dateStr.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const trimmed = String(dateStr).trim()
  
  if (trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return trimmed
  }
  
  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slash) {
    const [, m, d, y] = slash
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  
  const num = Number(trimmed)
  if (!isNaN(num) && num > 0) {
    const date = new Date((num - 25569) * 86400 * 1000)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  throw new Error(`Cannot parse: ${dateStr}`)
}

function cleanNumber(value: any): number {
  if (typeof value === 'number') return value
  if (!value) return 0
  const str = String(value).replace(/[,%]/g, '').trim()
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

function findColumn(row: any, names: string[]): any {
  for (const name of names) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name]
    }
  }
  return undefined
}

function generateUniqueId(date: string, title: string, index: number): string {
  // Limpia el título para usarlo en el ID
  const cleanTitle = title
    .substring(0, 30)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  return `linkedin-${date}-${cleanTitle}-${index}`
}

function detectLinkedInType(sheetNames: string[]): 'content' | 'followers' | 'visitors' | 'unknown' {
  const lower = sheetNames.map(s => s.toLowerCase())
  
  if (lower.some(s => s.includes('metrics')) || lower.some(s => s.includes('all post'))) {
    return 'content'
  }
  
  if (lower.some(s => s.includes('new follower'))) {
    return 'followers'
  }
  
  if (lower.some(s => s.includes('visitor'))) {
    return 'visitors'
  }
  
  return 'unknown'
}

function parseContentAnalytics(workbook: XLSX.WorkBook): { dataPoints: NormalizedDataPoint[]; headers: string[] } {
  let mainSheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('metrics')) || workbook.SheetNames[0]
  const mainSheet = workbook.Sheets[mainSheetName]
  
  let allRows: any[] = XLSX.utils.sheet_to_json(mainSheet, { 
    defval: '', 
    raw: false,
    header: 1
  })
  
  if (allRows.length < 2) throw new Error('Archivo muy corto')
  
  let headerRowIdx = -1
  for (let i = 0; i < Math.min(5, allRows.length); i++) {
    const row = allRows[i] as any[]
    const hasDateColumn = row.some(cell => {
      const cellStr = String(cell).trim()
      return cellStr.length < 20 && cellStr.toLowerCase().includes('date')
    })
    if (hasDateColumn) {
      headerRowIdx = i
      break
    }
  }
  
  if (headerRowIdx === -1) throw new Error('No se encontraron headers')
  
  const headers = allRows[headerRowIdx] as string[]
  const dataRows = allRows.slice(headerRowIdx + 1)
  
  const mainRows = dataRows.map(row => {
    const obj: any = {}
    headers.forEach((h, idx) => {
      obj[String(h)] = (row as any[])[idx]
    })
    return obj
  })
  
  const allPostSheet = workbook.Sheets['All posts'] || workbook.Sheets['All Posts']
  let postMap = new Map<string, Array<{ title: string; link: string }>>()
  
  if (allPostSheet) {
    let allPostRaw: any[] = XLSX.utils.sheet_to_json(allPostSheet, { defval: '', raw: false, header: 1 })
    
    let postHeaderIdx = -1
    for (let i = 0; i < Math.min(5, allPostRaw.length); i++) {
      const row = allPostRaw[i] as any[]
      if (row.some(cell => String(cell).trim().length < 30 && String(cell).toLowerCase().includes('post title'))) {
        postHeaderIdx = i
        break
      }
    }
    
    if (postHeaderIdx === -1) postHeaderIdx = 0
    
    const postHeaders = allPostRaw[postHeaderIdx] as string[]
    const postDataRows = allPostRaw.slice(postHeaderIdx + 1)
    
    postDataRows.forEach(row => {
      const obj: any = {}
      postHeaders.forEach((h, idx) => {
        obj[String(h)] = (row as any[])[idx]
      })
      
      try {
        const date = findColumn(obj, ['Created date', 'Date'])
        if (date) {
          const normalized = parseLinkedInDate(date)
          const title = String(findColumn(obj, ['Post title', 'Title']) || '')
          const link = String(findColumn(obj, ['Post link', 'Link']) || '')
          
          if (!postMap.has(normalized)) {
            postMap.set(normalized, [])
          }
          postMap.get(normalized)!.push({ title, link })
        }
      } catch (e) {}
    })
  }
  
  const dataPoints: NormalizedDataPoint[] = []
  const dateCounter = new Map<string, number>()
  
  for (const row of mainRows) {
    const dateStr = findColumn(row, ['Date', 'date'])
    if (!dateStr || !String(dateStr).trim()) continue
    
    try {
      const normalizedDate = parseLinkedInDate(dateStr)
      
      // Contador para manejar múltiples posts en la misma fecha
      const currentIndex = dateCounter.get(normalizedDate) || 0
      dateCounter.set(normalizedDate, currentIndex + 1)
      
      const postsOnDate = postMap.get(normalizedDate) || []
      const postInfo = postsOnDate[currentIndex] || { title: '', link: '' }
      
      const impressions = cleanNumber(findColumn(row, ['Impressions (total)', 'Impressions']))
      const impressions_organic = cleanNumber(findColumn(row, ['Impressions (organic)']))
      const clicks = cleanNumber(findColumn(row, ['Clicks (total)', 'Clicks']))
      const reactions = cleanNumber(findColumn(row, ['Reactions (total)', 'Reactions']))
      const comments = cleanNumber(findColumn(row, ['Comments (total)', 'Comments']))
      const reposts = cleanNumber(findColumn(row, ['Reposts (total)', 'Reposts']))
      const engagement_rate = cleanNumber(findColumn(row, ['Engagement rate (total)', 'Engagement rate']))
      
      const engagements = reactions + comments + reposts
      
      dataPoints.push({
        id: generateUniqueId(normalizedDate, postInfo.title, currentIndex),
        date: normalizedDate,
        source: 'linkedin',
        metrics: {
          post_id: normalizedDate,
          title: postInfo.title,
          link: postInfo.link,
          impressions,
          impressions_organic,
          clicks,
          reactions,
          comments,
          reposts,
          engagements,
          engagement_rate: engagement_rate || (impressions > 0 ? (engagements / impressions) * 100 : 0),
        },
      })
    } catch (error) {}
  }
  
  return { dataPoints, headers: headers.map(h => String(h)) }
}

function parseFollowersAnalytics(workbook: XLSX.WorkBook): { dataPoints: NormalizedDataPoint[]; headers: string[] } {
  let sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('new follower')) || workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  
  let allRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, header: 1 })
  if (allRows.length < 2) throw new Error('Archivo muy corto')
  
  const headers = allRows[0] as string[]
  const dataRows = allRows.slice(1)
  
  const rows = dataRows.map(row => {
    const obj: any = {}
    headers.forEach((h, idx) => {
      obj[String(h)] = (row as any[])[idx]
    })
    return obj
  })
  
  const dataPoints: NormalizedDataPoint[] = []
  
  for (const row of rows) {
    const dateStr = findColumn(row, ['Date', 'date'])
    if (!dateStr || !String(dateStr).trim()) continue
    
    try {
      const normalizedDate = parseLinkedInDate(dateStr)
      
      const total_followers = cleanNumber(findColumn(row, ['Total followers']))
      const organic_followers = cleanNumber(findColumn(row, ['Organic followers']))
      const sponsored_followers = cleanNumber(findColumn(row, ['Sponsored followers']))
      const auto_invited = cleanNumber(findColumn(row, ['Auto-invited followers']))
      
      dataPoints.push({
        id: `linkedin-followers-${normalizedDate}`,
        date: normalizedDate,
        source: 'linkedin',
        metrics: {
          total_followers,
          organic_followers,
          sponsored_followers,
          auto_invited_followers: auto_invited,
          new_followers: total_followers,
        },
      })
    } catch (error) {}
  }
  
  return { dataPoints, headers: headers.map(h => String(h)) }
}

function parseVisitorsAnalytics(workbook: XLSX.WorkBook): { dataPoints: NormalizedDataPoint[]; headers: string[] } {
  let sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('visitor')) || workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  
  let allRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, header: 1 })
  if (allRows.length < 2) throw new Error('Archivo muy corto')
  
  const headers = allRows[0] as string[]
  const dataRows = allRows.slice(1)
  
  const rows = dataRows.map(row => {
    const obj: any = {}
    headers.forEach((h, idx) => {
      obj[String(h)] = (row as any[])[idx]
    })
    return obj
  })
  
  const dataPoints: NormalizedDataPoint[] = []
  
  for (const row of rows) {
    const dateStr = findColumn(row, ['Date', 'date'])
    if (!dateStr || !String(dateStr).trim()) continue
    
    try {
      const normalizedDate = parseLinkedInDate(dateStr)
      
      const page_views_total = cleanNumber(findColumn(row, ['Overview page views (total)']))
      const page_views_desktop = cleanNumber(findColumn(row, ['Overview page views (desktop)']))
      const page_views_mobile = cleanNumber(findColumn(row, ['Overview page views (mobile)']))
      
      const unique_visitors_total = cleanNumber(findColumn(row, ['Overview unique visitors (total)']))
      const unique_visitors_desktop = cleanNumber(findColumn(row, ['Overview unique visitors (desktop)']))
      const unique_visitors_mobile = cleanNumber(findColumn(row, ['Overview unique visitors (mobile)']))
      
      const custom_button_clicks = cleanNumber(findColumn(row, ['Custom button clicks (total)', 'Custom button clicks']))
      
      dataPoints.push({
        id: `linkedin-visitors-${normalizedDate}`,
        date: normalizedDate,
        source: 'linkedin',
        metrics: {
          page_views: page_views_total,
          page_views_desktop,
          page_views_mobile,
          unique_visitors: unique_visitors_total,
          unique_visitors_desktop,
          unique_visitors_mobile,
          custom_button_clicks,
        },
      })
    } catch (error) {}
  }
  
  return { dataPoints, headers: headers.map(h => String(h)) }
}

export async function parseLinkedInXLS(file: File): Promise<ParserResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    const workbook = XLSX.read(data, { type: 'array' })
    
    if (workbook.SheetNames.length === 0) {
      return { success: false, error: 'Sin hojas' }
    }
    
    const fileType = detectLinkedInType(workbook.SheetNames)
    
    if (fileType === 'unknown') {
      return { success: false, error: 'Tipo no reconocido' }
    }
    
    let result: { dataPoints: NormalizedDataPoint[]; headers: string[] }
    let subType: 'content' | 'followers' | 'visitors'
    
    switch (fileType) {
      case 'content':
        result = parseContentAnalytics(workbook)
        subType = 'content'
        break
      case 'followers':
        result = parseFollowersAnalytics(workbook)
        subType = 'followers'
        break
      case 'visitors':
        result = parseVisitorsAnalytics(workbook)
        subType = 'visitors'
        break
    }
    
    if (result.dataPoints.length === 0) {
      return { success: false, error: 'Sin datos válidos' }
    }
    
    result.dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    return {
      success: true,
      data: {
        source: 'linkedin',
        subType,
        dataPoints: result.dataPoints,
        rawHeaders: result.headers,
        normalizedHeaders: {},
        dateRange: {
          start: result.dataPoints[0].date,
          end: result.dataPoints[result.dataPoints.length - 1].date,
        },
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}