/**
 * File: useSidebarState.ts
 * Path: /lib/hooks/useSidebarState.ts
 * Last Modified: 2026-01-20
 * Description: Custom hook para persistir estado de sidebar entre páginas
 */

import { useState, useEffect } from 'react'

const SIDEBAR_STORAGE_KEY = 'condor_sidebar_open'

export function useSidebarState(): [boolean, (value: boolean) => void] {
  // Inicializar desde localStorage o default true
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true // SSR safe
    
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    return stored !== null ? stored === 'true' : true // Default: open
  })

  // Guardar en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isOpen))
  }, [isOpen])

  return [isOpen, setIsOpen]
}