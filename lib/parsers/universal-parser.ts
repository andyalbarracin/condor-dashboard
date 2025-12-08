/**
 * File: universal-parser.ts
 * Path: /lib/parsers/universal-parser.ts
 * Last Modified: 2025-12-06
 * Description: Parser universal que detecta automáticamente el tipo de archivo y usa el parser apropiado
 */

import { parseLinkedInXLS } from './linkedin-parser'
import { parseTwitterCSV } from './twitter-parser'
import { parseCSV } from './csv-parser'
import type { ParserResult } from './types'

/**
 * Detecta el tipo de archivo por extensión y contenido
 */
function detectFileType(file: File): 'xls' | 'xlsx' | 'csv' {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  
  if (['xls', 'xlsx'].includes(extension)) {
    return extension as 'xls' | 'xlsx'
  }
  
  return 'csv'
}

/**
 * Detecta la plataforma por el contenido del archivo
 */
async function detectPlatform(file: File, content: string): Promise<'linkedin' | 'twitter' | 'unknown'> {
  const lowerContent = content.toLowerCase()
  const fileName = file.name.toLowerCase()
  
  // Detectar por nombre de archivo
  if (fileName.includes('linkedin')) return 'linkedin'
  if (fileName.includes('twitter') || fileName.includes('x_') || fileName.includes('asentria_content')) return 'twitter'
  
  // Detectar por contenido
  if (lowerContent.includes('post id') && lowerContent.includes('post text') && lowerContent.includes('post link')) {
    return 'twitter'
  }
  
  if (lowerContent.includes('impressions (organic)') || lowerContent.includes('engagement rate (organic)')) {
    return 'linkedin'
  }
  
  return 'unknown'
}

/**
 * Parser universal que maneja todos los tipos de archivo
 */
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
    
    if (platform === 'twitter') {
      return await parseTwitterCSV(text)
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