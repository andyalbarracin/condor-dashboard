/**
 * File: export-table-button.tsx
 * Path: /components/reports/export-table-button.tsx
 * Last Modified: 2025-12-09
 * Description: Export tabla Top Content a PDF con hipervínculos clickeables (sin duplicación)
 */

"use client"

import { Download } from "lucide-react"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ExportTableButtonProps {
  data: any[]
  filename: string
  disabled?: boolean
  dateRange?: string
  platform?: string
}

/**
 * Remueve emojis y caracteres especiales que jsPDF no puede renderizar
 */
function cleanText(text: string): string {
  if (!text) return ''
  
  return text
    // Remover emojis (todos los rangos Unicode)
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
    // Remover caracteres de control y especiales problemáticos
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    // Remover zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Limpiar espacios múltiples
    .replace(/\s+/g, ' ')
    .trim()
}

export function ExportTableButton({ 
  data, 
  filename, 
  disabled = false,
  dateRange = "3 months",
  platform = "All"
}: ExportTableButtonProps) {
  
  const handleExport = () => {
    if (data.length === 0) return
    
    const doc = new jsPDF('landscape', 'mm', 'a4')
    
    // ✅ HEADER
    doc.setFontSize(20)
    doc.setTextColor(42, 95, 74) // Primary color
    doc.text('Top Content Performance', 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Platform: ${platform} | Period: ${dateRange}`, 14, 27)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32)
    
    // ✅ TABLE HEADERS
    const headers = [
      '#',
      'Title',
      'Platform',
      'Date',
      'Impressions',
      'Engagements',
      'Clicks',
      'Reactions',
      'Comments',
      'Shares',
      'Eng. Rate',
      'Followers'
    ]
    
    // ✅ TABLE DATA - IMPORTANTE: columna Title vacía, la dibujaremos manualmente
    const tableData = data.map((row, idx) => {
      return [
        (idx + 1).toString(),
        '', // ← VACÍO para evitar duplicación
        row.source === 'twitter' ? 'X' : row.source.charAt(0).toUpperCase() + row.source.slice(1),
        row.date,
        row.impressions.toLocaleString(),
        row.engagements.toLocaleString(),
        row.clicks.toLocaleString(),
        row.reactions.toLocaleString(),
        row.comments.toLocaleString(),
        row.shares.toLocaleString(),
        `${row.engagement_rate.toFixed(2)}%`,
        row.followers_gained > 0 ? `+${row.followers_gained}` : '-'
      ]
    })
    
    // ✅ GENERATE TABLE
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 38,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [42, 95, 74], // Primary color
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 }, // #
        1: { halign: 'left', cellWidth: 70 }, // Title (clickeable)
        2: { halign: 'center', cellWidth: 15 }, // Platform
        3: { halign: 'center', cellWidth: 22 }, // Date
        4: { halign: 'right', cellWidth: 20 }, // Impressions
        5: { halign: 'right', cellWidth: 20 }, // Engagements
        6: { halign: 'right', cellWidth: 15 }, // Clicks
        7: { halign: 'right', cellWidth: 15 }, // Reactions
        8: { halign: 'right', cellWidth: 15 }, // Comments
        9: { halign: 'right', cellWidth: 12 }, // Shares
        10: { halign: 'right', cellWidth: 18 }, // Eng. Rate
        11: { halign: 'right', cellWidth: 15 }, // Followers
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 14, right: 14 },
      // ✅ DIBUJAR LINKS MANUALMENTE (sin duplicación)
      didDrawCell: (hookData) => {
        // Solo en la columna de "Title" (índice 1) y en el body (no header)
        if (hookData.column.index === 1 && hookData.section === 'body') {
          const rowIndex = hookData.row.index
          const rowData = data[rowIndex]
          const cell = hookData.cell
          
          const cleanedTitle = cleanText(rowData.title)
          const truncatedTitle = cleanedTitle.substring(0, 60) + (cleanedTitle.length > 60 ? '...' : '')
          
          // Si tiene link, agregarlo como hipervínculo
          if (rowData.link && rowData.link !== '') {
            // ✅ Agregar área clickeable
            doc.link(
              cell.x,
              cell.y,
              cell.width,
              cell.height,
              { url: rowData.link }
            )
            
            // ✅ Dibujar texto en color primary (indica link)
            doc.setTextColor(42, 95, 74)
            doc.setFontSize(8)
            doc.text(
              truncatedTitle,
              cell.x + 2,
              cell.y + cell.height / 2 + 1
            )
          } else {
            // Sin link, texto normal en gris
            doc.setTextColor(60, 60, 60)
            doc.setFontSize(8)
            doc.text(
              truncatedTitle,
              cell.x + 2,
              cell.y + cell.height / 2 + 1
            )
          }
        }
      }
    })
    
    // ✅ FOOTER
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }
    
    // ✅ SAVE PDF
    doc.save(`${filename}.pdf`)
  }
  
  return (
    <button
      onClick={handleExport}
      disabled={disabled}
      className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg bg-card text-foreground text-sm hover:bg-card-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Export table to PDF"
    >
      <Download className="w-4 h-4" />
      <span>Export PDF</span>
    </button>
  )
}