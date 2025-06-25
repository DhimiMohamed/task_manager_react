"use client"

import { useEffect, useRef } from "react"
import { TasksStatsList200ResponseCategoriesInner } from "@/api/models"

interface CategoryBreakdownProps {
  data?: TasksStatsList200ResponseCategoriesInner[]
}

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const chartData = data?.map(item => ({
      category: item.name || "Uncategorized",
      count: item.total || 0,
      color: item.color || getDefaultCategoryColor(item.name || "Uncategorized")
    })) || [{ category: "No Data", count: 1, color: "#e2e8f0" }]

    const total = chartData.reduce((sum, item) => sum + item.count, 0)
    const centerX = rect.width * 0.65
    const centerY = rect.height / 2
    const radius = Math.min(centerX, centerY) - 40

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let startAngle = 0
    chartData.forEach((item) => {
      const sliceAngle = (2 * Math.PI * item.count) / total

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()

      ctx.fillStyle = item.color
      ctx.fill()

      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      const midAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + labelRadius * Math.cos(midAngle)
      const labelY = centerY + labelRadius * Math.sin(midAngle)

      const percentage = Math.round((item.count / total) * 100)
      if (percentage > 5) {
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 14px Inter"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${percentage}%`, labelX, labelY)
      }

      startAngle += sliceAngle
    })

    // Draw legend
    const legendX = 20
    let legendY = 60

    chartData.forEach((item) => {
      ctx.fillStyle = item.color
      ctx.fillRect(legendX, legendY, 20, 20)

      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 1
      ctx.strokeRect(legendX, legendY, 20, 20)

      ctx.fillStyle = "#1e293b"
      ctx.font = "14px Inter"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(`${item.category} (${item.count})`, legendX + 30, legendY + 10)

      legendY += 30
    })

    // Draw title
    ctx.fillStyle = "#1e293b"
    ctx.font = "16px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("Tasks by Category", centerX, 20)

  }, [data])

  const getDefaultCategoryColor = (category: string) => {
    const colors = [
      "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
      "#6366f1", "#ec4899", "#14b8a6", "#f97316", "#64748b"
    ]
    const index = Math.abs(category.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length
    return colors[index]
  }

  return (
    <div className="w-full h-[500px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
