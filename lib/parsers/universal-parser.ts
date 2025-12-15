/**
 * File: universal-parser.ts
 * Path: /lib/parsers/universal-parser.ts
 * Last Modified: 2025-12-09
 * Description: Parser universal con detección mejorada
 */

import { parseLinkedInXLS } from './linkedin-parser'
import { parseTwitterCSV } from './twitter-parser'
import { parseCSV } from './csv-parser'
import { parseGoogleAnalyticsCSV } from './google-analytics-parser'
import type { ParserResult } from './types'

function detectFileType(file: File): 'xls' | 'xlsx' | 'csv' {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  
  if (['xls', 'xlsx'].includes(extension)) {
    return extension as 'xls' | 'xlsx'
  }
  
  return 'csv'
}

/**
 * Detecta si es un archivo de Google Analytics
 * DEBE SER MUY ESPECÍFICO para no confundir con Twitter
 */
function isGoogleAnalytics(content: string, fileName: string): boolean {
  const lowerContent = content.toLowerCase()
  
  // Marcadores ESPECÍFICOS de Google Analytics 4
  const gaSpecificMarkers = [
    'traffic acquisition:',
    'session primary channel',
    '# account:',
    '# property:',
    'session campaign,sessions,engaged sessions',
  ]
  
  // Si tiene alguno de estos marcadores específicos, ES GA4
  for (const marker of gaSpecificMarkers) {
    if (lowerContent.includes(marker)) {
      return true
    }
  }
  
  return false
}

/**
 * Detecta si es Twitter/X por sus columnas específicas
 */
function isTwitter(content: string): boolean {
  const lowerContent = content.toLowerCase()
  
  // Twitter tiene estas columnas específicas
  const twitterMarkers = [
    'post id',
    'post text',
    'post link',
  ]
  
  let markerCount = 0
  for (const marker of twitterMarkers) {
    if (lowerContent.includes(marker)) {
      markerCount++
    }
  }
  
  // Si tiene al menos 2 de los 3 marcadores, es Twitter
  return markerCount >= 2
}

async function detectPlatform(file: File, content: string): Promise<'linkedin' | 'twitter' | 'google-analytics' | 'unknown'> {
  const lowerContent = content.toLowerCase()
  const fileName = file.name.toLowerCase()
  
  // 1. PRIMERO verificar Twitter (más específico)
  if (isTwitter(content)) {
    return 'twitter'
  }
  
  // 2. SEGUNDO verificar Google Analytics (también específico)
  if (isGoogleAnalytics(content, fileName)) {
    return 'google-analytics'
  }
  
  // 3. Detectar por nombre de archivo
  if (fileName.includes('linkedin')) return 'linkedin'
  
  // 4. Detectar por contenido LinkedIn
  if (lowerContent.includes('impressions (organic)') || lowerContent.includes('engagement rate (organic)')) {
    return 'linkedin'
  }
  
  return 'unknown'
}

export async function parseFile(file: File): Promise<ParserResult> {
  try {
    const fileType = detectFileType(file)
    
    // Para archivos Excel (LinkedIn)
    if (fileType === 'xls' || fileType === 'xlsx') {
      return await parseLinkedInXLS(file)
    }
    
    // Para archivos CSV
    const text = await file.text()
    const platform = await detectPlatform(file, text)
    
    // Twitter/X
    if (platform === 'twitter') {
      return await parseTwitterCSV(text)
    }
    
    // Google Analytics
    if (platform === 'google-analytics') {
      try {
        const parsed = parseGoogleAnalyticsCSV(text, file.name)
        return {
          success: true,
          data: parsed,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to parse Google Analytics CSV',
        }
      }
    }
    
    // Fallback al parser CSV genérico
    return await parseCSV(text)
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse file',
    }
  }
}