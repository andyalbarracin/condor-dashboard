/**
 * File: pdf-generator.ts
 * Path: /lib/reports/pdf-generator.ts
 * Last Modified: 2025-12-08
 * Description: PDF Generator - CORREGIDO
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ParsedDataset } from '@/lib/parsers/types'
import type { BenchmarkComparison } from './benchmark-calculator'

interface ReportData {
  linkedinComparisons: BenchmarkComparison[]
  twitterComparisons: BenchmarkComparison[]
  recommendations: string[]
  topContent: any[]
  dateRange: { start: string; end: string }
}

function cleanText(text: string): string {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F700}-\u{1F77F}]/gu, '')
    .replace(/[\u{1F780}-\u{1F7FF}]/gu, '')
    .replace(/[\u{1F800}-\u{1F8FF}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[^\x00-\x7F]/g, '')
    .trim()
}

export function generatePDF(data: ParsedDataset, reportData: ReportData): void {
  const doc = new jsPDF()
  let yPos = 30
  
  // HEADER
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  const pageWidth = doc.internal.pageSize.width
  doc.text('Analytics Report', pageWidth / 2, yPos, { align: 'center' })
  
  yPos += 15
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  doc.text(`${reportData.dateRange.start} to ${reportData.dateRange.end}`, pageWidth / 2, yPos, { align: 'center' })
  
  yPos += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' })
  
  yPos += 20
  doc.setTextColor(0, 0, 0)
  
  // LinkedIn Section
  if (reportData.linkedinComparisons.length > 0) {
    doc.setFillColor(10, 102, 194)
    doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('LinkedIn Performance', 25, yPos + 2)
    yPos += 12
    doc.setTextColor(0, 0, 0)
    
    reportData.linkedinComparisons.forEach(comp => {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(comp.kpi, 25, yPos)
      yPos += 6
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Your Performance: ${(comp.actual * 100).toFixed(2)}%`, 30, yPos)
      yPos += 5
      doc.text(`Industry Average: ${(comp.benchmark * 100).toFixed(2)}%`, 30, yPos)
      yPos += 5
      
      doc.setFont('helvetica', 'bold')
      if (comp.status === 'excellent') doc.setTextColor(34, 197, 94)
      else if (comp.status === 'good') doc.setTextColor(59, 130, 246)
      else if (comp.status === 'average') doc.setTextColor(234, 179, 8)
      else doc.setTextColor(239, 68, 68)
      
      doc.text(`Status: ${comp.status.toUpperCase()}`, 30, yPos)
      doc.setTextColor(0, 0, 0)
      yPos += 8
      
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
    })
    
    yPos += 5
  }
  
  // Twitter Section
  if (reportData.twitterComparisons.length > 0) {
    if (yPos > 200) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFillColor(29, 161, 242)
    doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('X/Twitter Performance', 25, yPos + 2)
    yPos += 12
    doc.setTextColor(0, 0, 0)
    
    reportData.twitterComparisons.forEach(comp => {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(comp.kpi, 25, yPos)
      yPos += 6
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Your Performance: ${(comp.actual * 100).toFixed(2)}%`, 30, yPos)
      yPos += 5
      doc.text(`Industry Average: ${(comp.benchmark * 100).toFixed(2)}%`, 30, yPos)
      yPos += 5
      
      doc.setFont('helvetica', 'bold')
      if (comp.status === 'excellent') doc.setTextColor(34, 197, 94)
      else if (comp.status === 'good') doc.setTextColor(59, 130, 246)
      else if (comp.status === 'average') doc.setTextColor(234, 179, 8)
      else doc.setTextColor(239, 68, 68)
      
      doc.text(`Status: ${comp.status.toUpperCase()}`, 30, yPos)
      doc.setTextColor(0, 0, 0)
      yPos += 8
      
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
    })
    
    yPos += 5
  }
  
  // Recommendations
  if (reportData.recommendations.length > 0) {
    if (yPos > 220) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFillColor(42, 95, 74)
    doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Recommendations', 25, yPos + 2)
    yPos += 12
    doc.setTextColor(0, 0, 0)
    
    reportData.recommendations.forEach((rec, idx) => {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const cleanRec = cleanText(rec)
      const lines = doc.splitTextToSize(`${idx + 1}. ${cleanRec}`, 160)
      doc.text(lines, 25, yPos)
      yPos += lines.length * 5 + 3
      
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
    })
  }
  
  // Top Content Table
  if (reportData.topContent.length > 0) {
    doc.addPage()
    yPos = 20
    
    doc.setFillColor(42, 95, 74)
    doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Top Content Performance', 25, yPos + 2)
    yPos += 15
    doc.setTextColor(0, 0, 0)
    
    const tableData = reportData.topContent.map(post => {
      const cleanTitle = cleanText(String(post.title))
      return [
        cleanTitle.substring(0, 50),
        post.source === 'linkedin' ? 'LinkedIn' : 'X',
        post.date,
        post.impressions.toLocaleString(),
        post.engagements.toLocaleString(),
        post.clicks.toLocaleString(),
        post.reactions.toLocaleString(),
        post.comments.toLocaleString(),
        post.shares.toLocaleString(),
        post.engagement_rate.toFixed(2) + '%',
      ]
    })
    
    autoTable(doc, {
      startY: yPos,
      head: [['Title', 'Platform', 'Date', 'Impr.', 'Eng.', 'Clicks', 'React.', 'Comm.', 'Shares', 'Rate']],
      body: tableData,
      styles: { 
        fontSize: 7, 
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap',
      },
      headStyles: { 
        fillColor: [42, 95, 74], 
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 50, halign: 'left' },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 16, halign: 'right' },
        4: { cellWidth: 16, halign: 'right' },
        5: { cellWidth: 14, halign: 'right' },
        6: { cellWidth: 14, halign: 'right' },
        7: { cellWidth: 14, halign: 'right' },
        8: { cellWidth: 14, halign: 'right' },
        9: { cellWidth: 14, halign: 'right' },
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 10, right: 10 },
      didDrawPage: (data: any) => {
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Page ${data.pageNumber} | CONDOR Analytics Hub`, 
          pageWidth / 2, 
          doc.internal.pageSize.height - 10, 
          { align: 'center' }
        )
      }
    })
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i < pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} | Analytics Hub`, 
      pageWidth / 2, 
      doc.internal.pageSize.height - 10, 
      { align: 'center' }
    )
  }
  
  doc.save(`condor-report-${new Date().toISOString().split('T')[0]}.pdf`)
}