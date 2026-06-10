
"use client"

import React from "react"
import { motion } from "framer-motion"

interface EarthVisualizationProps {
  health: number // 0 to 100
}

export function EarthVisualization({ health }: EarthVisualizationProps) {
  // Interpolate colors based on health
  // Healthy: vibrant blues/greens
  // Unhealthy: grays/browns
  const atmosphereColor = health > 70 ? "hsla(219, 100%, 75%, 0.3)" : health > 40 ? "hsla(30, 80%, 55%, 0.2)" : "hsla(0, 80%, 55%, 0.1)"
  const landColor = health > 70 ? "hsl(160, 60%, 45%)" : health > 40 ? "hsl(30, 60%, 45%)" : "hsl(0, 0%, 45%)"
  const waterColor = health > 70 ? "hsl(219, 100%, 65%)" : health > 40 ? "hsl(219, 40%, 45%)" : "hsl(219, 10%, 35%)"

  return (
    <div className="relative h-64 w-64 flex items-center justify-center">
      {/* Atmosphere Glow */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full blur-3xl"
        style={{ backgroundColor: atmosphereColor }}
      />
      
      {/* The Earth Sphere */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="relative h-48 w-48 rounded-full shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{ backgroundColor: waterColor }}
      >
        {/* Abstract Continent Shapes */}
        <motion.div className="absolute top-4 left-4 w-16 h-12 rounded-full blur-sm" style={{ backgroundColor: landColor }} />
        <motion.div className="absolute top-20 right-4 w-20 h-16 rounded-full blur-sm" style={{ backgroundColor: landColor }} />
        <motion.div className="absolute bottom-6 left-12 w-12 h-10 rounded-full blur-sm" style={{ backgroundColor: landColor }} />
        
        {/* Clouds */}
        <motion.div 
          animate={{ x: [0, 48, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-0 w-24 h-4 bg-white/20 rounded-full blur-md" 
        />
        <motion.div 
          animate={{ x: [0, -48, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-12 right-0 w-20 h-3 bg-white/15 rounded-full blur-md" 
        />
      </motion.div>
      
      {/* Health Indicator Ring */}
      <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
        <circle
          cx="128"
          cy="128"
          r="110"
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-muted/20"
        />
        <motion.circle
          cx="128"
          cy="128"
          r="110"
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray="690"
          initial={{ strokeDashoffset: 690 }}
          animate={{ strokeDashoffset: 690 - (690 * health) / 100 }}
          className="text-primary"
        />
      </svg>
    </div>
  )
}
