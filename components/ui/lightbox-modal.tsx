/**
 * File: lightbox-modal.tsx
 * Path: /components/ui/lightbox-modal.tsx
 * Last Modified: 2026-02-02
 * Description: Lightbox modal con navegación expuesta
 */

"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface LightboxModalProps {
  isOpen: boolean
  onClose: () => void
  slides: React.ReactNode[]
  initialSlide?: number
}

// Context para que los slides puedan navegar
const NavigationContext = createContext<{
  goToNext: () => void
  goToPrevious: () => void
  currentSlide: number
}>({
  goToNext: () => {},
  goToPrevious: () => {},
  currentSlide: 0,
})

export const useSlideNavigation = () => useContext(NavigationContext)

export function LightboxModal({ isOpen, onClose, slides, initialSlide = 0 }: LightboxModalProps) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide)

  useEffect(() => {
    setCurrentSlide(initialSlide)
  }, [initialSlide])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentSlide])

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  if (!isOpen) return null

  return (
    <NavigationContext.Provider value={{ goToNext: handleNext, goToPrevious: handlePrevious, currentSlide }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {currentSlide > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevious()
                }}
                className="absolute left-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors hidden md:block"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {currentSlide < slides.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors hidden md:block"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}

            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl mx-4 my-8 max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
            >
              {slides[currentSlide]}
            </motion.div>

            {slides.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentSlide(index)
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? "w-8 bg-white"
                        : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </NavigationContext.Provider>
  )
}