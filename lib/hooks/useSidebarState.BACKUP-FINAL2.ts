/**
 * File: useSidebarState.ts
 * Path: /lib/hooks/useSidebarState.ts
 * Last Modified: 2026-01-20
 * Description: Custom hook sin flicker visual - usa useLayoutEffect
 */

import { useState, useEffect, useLayoutEffect } from 'react'

const SIDEBAR_STORAGE_KEY = 'condor_sidebar_open'

// Hook que detecta si estamos en el cliente
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function useSidebarState(): [boolean, (value: boolean) => void] {
  // ✅ Inicializar siempre con true (para consistencia SSR)
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // ✅ useLayoutEffect corre ANTES del paint → Sin flicker visual
  useIsomorphicLayoutEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (stored !== null) {
      setIsOpen(stored === 'true')
    }
    setIsInitialized(true)
  }, [])

  // ✅ Guardar cambios en localStorage (solo después de inicializar)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isOpen))
    }
  }, [isOpen, isInitialized])

  return [isOpen, setIsOpen]
}