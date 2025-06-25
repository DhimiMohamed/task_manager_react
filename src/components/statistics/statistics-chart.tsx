"use client"

import { useEffect, useRef } from "react"

export default function StatisticsChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Sample data for the last 6 months
    const data = [65, 59, 80, 81, 56, 78]
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

    // Chart configuration
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2
    const maxValue = Math.max(...data) * 1.2 // Add 20% padding

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.strokeStyle = "#94a3b8"
    ctx.stroke()

    // Draw line chart
    ctx.beginPath()
    data.forEach((value, index) => {
      const x = padding + (index * chartWidth) / (data.length - 1)
      const y = canvas.height - padding - (value / maxValue) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // Draw point
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()

      // Draw label
      ctx.fillStyle = "#64748b"
      ctx.font = "12px Inter"
      ctx.textAlign = "center"
      ctx.fillText(labels[index], x, canvas.height - padding + 20)

      // Draw value
      ctx.fillStyle = "#64748b"
      ctx.fillText(value.toString(), x, y - 10)
    })

    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw title
    ctx.fillStyle = "#1e293b"
    ctx.font = "14px Inter"
    ctx.textAlign = "center"
    ctx.fillText("Task Completion Over Time", canvas.width / 2, 20)
  }, [])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  )
}
