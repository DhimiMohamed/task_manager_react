import { useEffect, useRef } from "react";

export default function TaskOverview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle window resize
    const handleResize = () => {
      drawChart(canvas, ctx);
    };

    window.addEventListener('resize', handleResize);
    
    // Initial draw
    drawChart(canvas, ctx);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const drawChart = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Adjust for high DPI displays
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Sample data for the last 7 days
    const data = [12, 19, 15, 8, 22, 14, 18];
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Chart configuration
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    const barWidth = chartWidth / data.length / 2;
    const maxValue = Math.max(...data);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, rect.height - padding);
    ctx.lineTo(rect.width - padding, rect.height - padding);
    ctx.strokeStyle = "#94a3b8";
    ctx.stroke();

    // Draw bars
    data.forEach((value, index) => {
      const x = padding + (index * chartWidth) / data.length + barWidth / 2;
      const barHeight = (value / maxValue) * chartHeight;
      const y = rect.height - padding - barHeight;

      // Draw bar
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw label
      ctx.fillStyle = "#64748b";
      ctx.font = "12px Inter";
      ctx.textAlign = "center";
      ctx.fillText(labels[index], x + barWidth / 2, rect.height - padding + 20);

      // Draw value
      ctx.fillStyle = "#64748b";
      ctx.fillText(value.toString(), x + barWidth / 2, y - 10);
    });

    // Draw title
    ctx.fillStyle = "#1e293b";
    ctx.font = "14px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Tasks Completed", rect.width / 2, 20);
  };

  return (
    <div className="w-full h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
}