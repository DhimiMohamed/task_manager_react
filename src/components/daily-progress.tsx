import { useEffect, useRef } from "react";

export default function DailyProgress() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const drawChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Get container dimensions instead of canvas
      const container = containerRef.current;
      if (!container) return;
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Handle high DPI displays
      const dpr = window.devicePixelRatio || 1;
      
      // Set display size (CSS pixels)
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;
      
      // Set actual size in memory (scaled for high DPI)
      canvas.width = Math.round(containerWidth * dpr);
      canvas.height = Math.round(containerHeight * dpr);
      
      // Normalize coordinate system
      ctx.scale(dpr, dpr);

      // Sample data for hours in a day (0-23)
      const data = [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 3, 2, 3, 4, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0];
      const maxValue = Math.max(...data) || 1; // Prevent division by zero

      // Responsive design adjustments
      const isMobile = containerWidth < 640;
      const padding = isMobile ? 20 : 40;
      const fontSize = isMobile ? 10 : 12;
      const titleFontSize = isMobile ? 12 : 14;

      // Chart dimensions
      const chartWidth = containerWidth - padding * 2;
      const chartHeight = containerHeight - padding * 2;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw axes
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, containerHeight - padding);
      ctx.lineTo(containerWidth - padding, containerHeight - padding);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw area chart
      ctx.beginPath();
      ctx.moveTo(padding, containerHeight - padding);

      data.forEach((value, index) => {
        const x = padding + (index * chartWidth) / (data.length - 1);
        const y = containerHeight - padding - (value / maxValue) * chartHeight;
        ctx.lineTo(x, y);
      });

      ctx.lineTo(containerWidth - padding, containerHeight - padding);
      ctx.closePath();

      // Fill area with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, containerHeight - padding);
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.5)");
      gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)");
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw line
      ctx.beginPath();
      data.forEach((value, index) => {
        const x = padding + (index * chartWidth) / (data.length - 1);
        const y = containerHeight - padding - (value / maxValue) * chartHeight;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw x-axis labels (hours)
      const hourLabels = ["12am", "6am", "12pm", "6pm", "12am"];
      hourLabels.forEach((label, index) => {
        const x = padding + (index * chartWidth) / (hourLabels.length - 1);
        ctx.fillStyle = "#64748b";
        ctx.font = `${fontSize}px Inter`;
        ctx.textAlign = "center";
        ctx.fillText(label, x, containerHeight - padding + (isMobile ? 15 : 20));
      });

      // Draw title
      ctx.fillStyle = "#1e293b";
      ctx.font = `bold ${titleFontSize}px Inter`;
      ctx.textAlign = "center";
      ctx.fillText("Productivity by Hour", containerWidth / 2, padding - 10);
    };

    const handleResize = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(drawChart);
    };

    // Initial draw
    drawChart();

    // Add event listeners
    window.addEventListener("resize", handleResize);

    // Use ResizeObserver for better container size tracking
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px]"
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        aria-label="Daily productivity chart"
        role="img"
      />
    </div>
  );
}