/**
 * File: theme-provider.tsx
 * Path: /components/theme-provider.tsx
 * Last Modified: 2025-12-06
 * Description: Theme provider wrapper para next-themes con soporte dark/light mode
 */

"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps as NextThemesProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: NextThemesProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}