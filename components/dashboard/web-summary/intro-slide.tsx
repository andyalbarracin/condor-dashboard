/**
 * File: intro-slide.tsx
 * Path: /components/dashboard/web-summary/intro-slide.tsx
 * Last Modified: 2026-03-21
 * Description: Web Summary Slide 1 - Intro
 */

"use client"

import { motion } from "framer-motion"
import { Globe } from "lucide-react"
import { useSlideNavigation } from "@/components/ui/lightbox-modal"

export function WebIntroSlide() {
  const { goToNext } = useSlideNavigation()

  return (
    <div className="bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-300 p-12 min-h-[600px] flex flex-col items-center justify-center text-center relative overflow-hidden">
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10, stiffness: 100 }}
        className="text-8xl mb-8"
      >
        🌐
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-5xl font-bold text-white mb-4"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        Web Performance
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl text-white/90 mb-12"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        Let's see how your website is doing
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={goToNext}
        className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-shadow flex items-center gap-2"
      >
        <Globe className="w-5 h-5" />
        Show Me My Traffic
      </motion.button>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 text-6xl opacity-30"
      >
        📊
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-20 left-20 text-6xl opacity-30"
      >
        🚀
      </motion.div>
    </div>
  )
}