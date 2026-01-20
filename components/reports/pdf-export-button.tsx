/**
 * File: pdf-export-button.tsx
 * Path: /components/reports/pdf-export-button.tsx
 * Last Modified: 2026-01-20
 * Description: Botón para exportar reporte a PDF - ACTUALIZADO para recomendaciones inteligentes
 */

"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { generatePDF } from "@/lib/reports/pdf-generator"
import type { ParsedDataset } from "@/lib/parsers/types"
import type { BenchmarkComparison, IntelligentRecommendation } from "@/lib/reports/benchmark-calculator"

interface PDFExportButtonProps {
  data: ParsedDataset
  linkedinComparisons: BenchmarkComparison[]
  twitterComparisons: BenchmarkComparison[]
  recommendations: IntelligentRecommendation[]  // ← CAMBIO: de string[] a IntelligentRecommendation[]
  topContent: any[]
}

export function PDFExportButton({ 
  data, 
  linkedinComparisons, 
  twitterComparisons, 
  recommendations,
  topContent 
}: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  
  const handleExport = async () => {
    setIsGenerating(true)
    
    try {
      // Pequeño delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 500))
      
      generatePDF(data, {
        linkedinComparisons,
        twitterComparisons,
        recommendations,
        topContent,
        dateRange: data.dateRange,
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <button
      onClick={handleExport}
      disabled={isGenerating}
      className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          Export PDF Report
        </>
      )}
    </button>
  )
}
