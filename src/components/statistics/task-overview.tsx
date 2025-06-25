import { useEffect, useRef } from "react";
import { TasksStatsList200ResponseDailyTasks } from "@/api/models";

interface TaskOverviewProps {
  data?: TasksStatsList200ResponseDailyTasks;
}

export default function TaskOverview({ data }: TaskOverviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      drawChart(canvas, ctx, data);
    };

    window.addEventListener('resize', handleResize);
    drawChart(canvas, ctx, data);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  const drawChart = (
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    data?: TasksStatsList200ResponseDailyTasks
  ) => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Default data if not provided
    const labels = data?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const chartData = data?.data || Array(labels.length).fill(0);

    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    const barWidth = chartWidth / chartData.length / 2;
    const maxValue = Math.max(...chartData, 1); // Ensure at least 1 to avoid division by zero

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, rect.height - padding);
    ctx.lineTo(rect.width - padding, rect.height - padding);
    ctx.strokeStyle = "#94a3b8";
    ctx.stroke();

    // Draw bars
    chartData.forEach((value, index) => {
      const x = padding + (index * chartWidth) / chartData.length + barWidth / 2;
      const barHeight = (value / maxValue) * chartHeight;
      const y = rect.height - padding - barHeight;

      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = "#64748b";
      ctx.font = "12px Inter";
      ctx.textAlign = "center";
      ctx.fillText(labels[index], x + barWidth / 2, rect.height - padding + 20);

      ctx.fillText(value.toString(), x + barWidth / 2, y - 10);
    });

    ctx.fillStyle = "#1e293b";
    ctx.font = "14px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Task Distribution", rect.width / 2, 20);
  };

  return (
    <div className="w-full h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  );
}