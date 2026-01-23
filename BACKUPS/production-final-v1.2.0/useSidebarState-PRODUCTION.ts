/**
 * File: useSidebarState.ts
 * Path: /lib/hooks/useSidebarState.ts
 * Last Modified: 2026-01-20
 * Description: Hook sin flicker - lectura SINCRÓNICA de localStorage
 */

import { useState, useEffect } from 'react'

const SIDEBAR_STORAGE_KEY = 'condor_sidebar_open'

export function useSidebarState(): [boolean, (value: boolean) => void] {
  // ✅ Leer localStorage SINCRÓNICAMENTE durante inicialización
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    // En servidor, siempre true
    if (typeof window === 'undefined') return true
    
    // En cliente, leer localStorage INMEDIATAMENTE
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    return stored !== null ? stored === 'true' : true
  })

  // ✅ Guardar en localStorage cuando cambia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isOpen))
    }
  }, [isOpen])

  return [isOpen, setIsOpen]
}