"use client"

import { useEffect, useRef } from "react"

interface ProductivityHeatmapProps {
  data?: number[][]
}

export default function ProductivityHeatmap({ data }: ProductivityHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Use real data or fallback to empty data
    const heatmapData = data || Array(7).fill(Array(24).fill(0))
    const maxValue = Math.max(1, ...heatmapData.flat()) // Ensure at least 1

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const hoursOfDay = [
      "12am", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am",
      "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"
    ]

    // Chart configuration
    const padding = 60
    const cellWidth = (rect.width - padding * 2) / 24 // 24 hours
    const cellHeight = (rect.height - padding * 2) / 7 // 7 days

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw heatmap cells
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const value = heatmapData[day][hour]
        const intensity = value / maxValue

        const x = padding + hour * cellWidth
        const y = padding + day * cellHeight

        // Draw cell
        ctx.fillStyle = getHeatmapColor(intensity)
        ctx.fillRect(x, y, cellWidth, cellHeight)

        // Draw cell border
        ctx.strokeStyle = "#e2e8f0"
        ctx.strokeRect(x, y, cellWidth, cellHeight)

        // Draw value if greater than 0
        if (value > 0) {
          ctx.fillStyle = value > maxValue / 2 ? "#ffffff" : "#1e293b"
          ctx.font = "10px Inter"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(value.toString(), x + cellWidth / 2, y + cellHeight / 2)
        }
      }

      // Draw day labels
      ctx.fillStyle = "#64748b"
      ctx.font = "12px Inter"
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillText(daysOfWeek[day], padding - 10, padding + day * cellHeight + cellHeight / 2)
    }

    // Draw hour labels (every 3 hours for readability)
    for (let hour = 0; hour < 24; hour += 3) {
      ctx.fillStyle = "#64748b"
      ctx.font = "12px Inter"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(hoursOfDay[hour], padding + hour * cellWidth + cellWidth / 2, padding + 7 * cellHeight + 10)
    }

    // Draw title
    ctx.fillStyle = "#1e293b"
    ctx.font = "14px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("Productivity by Day and Hour", rect.width / 2, 20)

    // Draw legend
    const legendWidth = 150
    const legendHeight = 20
    const legendX = rect.width - legendWidth - 20
    const legendY = 20

    const gradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0)
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)")
    gradient.addColorStop(0.2, "rgba(198, 246, 213, 1)")
    gradient.addColorStop(0.4, "rgba(154, 230, 180, 1)")
    gradient.addColorStop(0.6, "rgba(104, 211, 145, 1)")
    gradient.addColorStop(0.8, "rgba(72, 187, 120, 1)")
    gradient.addColorStop(1, "rgba(47, 133, 90, 1)")

    ctx.fillStyle = gradient
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight)

    ctx.strokeStyle = "#e2e8f0"
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight)

    ctx.fillStyle = "#64748b"
    ctx.font = "10px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("Low", legendX, legendY + legendHeight + 5)
    ctx.fillText("High", legendX + legendWidth, legendY + legendHeight + 5)
  }, [data])

  // Function to get color based on intensity (0-1)
  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return "#ffffff"
    if (intensity < 0.2) return "#c6f6d5"
    if (intensity < 0.4) return "#9ae6b4"
    if (intensity < 0.6) return "#68d391"
    if (intensity < 0.8) return "#48bb78"
    return "#2f855a"
  }

  return (
    <div className="w-full h-[400px]">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  )
}