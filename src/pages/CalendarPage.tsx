// src/pages/CalendarPage.tsx
import { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import CalendarSidebar from "@/components/calendar/calendar-sidebar";
import MonthView from "@/components/calendar/month-view";
import WeekView from "@/components/calendar/week-view";
import { Task } from "@/api/models/task";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [tab, setTab] = useState<"month" | "week">("month");

  // Use the custom hooks
  const { 
    data: tasks = [], 
    isLoading: tasksLoading, 
    error: tasksError,
    refetch: refetchTasks 
  } = useTasks();

  const { 
    data: categories = [], 
    isLoading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories 
  } = useCategories();

  // Set default selected categories when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories(categories.map(c => c.id!));
    }
  }, [categories]);

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handlePreviousWeek = () => {
    setCurrentDate((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCategoryToggle = (category: number) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleTaskCreated = (task: Task) => {
    if (Object.keys(task).length === 1 && task.id) {
      refetchTasks();
      return;
    }
    refetchTasks();
  };

  const formatWeekRange = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const end = endOfWeek(date, { weekStartsOn: 0 });
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  };

  // Show loading state
  const isLoading = tasksLoading || categoriesLoading;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (tasksError || categoriesError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">
            {tasksError ? "Error loading tasks" : "Error loading categories"}
          </p>
          <Button 
            onClick={() => {
              if (tasksError) refetchTasks();
              if (categoriesError) refetchCategories();
            }} 
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:h-[calc(100vh-4rem)] h-auto">
      <div className="flex-none">
        <h1 className="text-xl sm:text-2xl font-bold">Calendar</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your schedule and tasks</p>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-4 pt-4 lg:overflow-hidden">
        <CalendarSidebar
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onPrevMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          categories={categories}
        />

        <Card className="flex-1 overflow-hidden w-full max-w-full">
          <Tabs 
            value={tab} 
            onValueChange={(value) => setTab(value as "month" | "week")} 
            className="h-full flex flex-col"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 pt-0 gap-2">
              <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={tab === "week" ? handlePreviousWeek : handlePreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous</span>
                </Button>

                <h2 className="text-sm sm:text-lg font-semibold whitespace-nowrap mx-1">
                  {tab === "week"
                    ? formatWeekRange(currentDate)
                    : format(currentDate, "MMMM yyyy")}
                </h2>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={tab === "week" ? handleNextWeek : handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next</span>
                </Button>
              </div>

              <div className="w-full sm:w-auto">
                <TabsList className="w-full">
                  <TabsTrigger value="month" className="flex-1 sm:flex-none">Month</TabsTrigger>
                  <TabsTrigger value="week" className="flex-1 sm:flex-none">Week</TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="month" className="flex-1 overflow-auto m-0 p-0 overflow-x-auto">
              <MonthView
                currentDate={currentDate}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                selectedCategories={selectedCategories}
                tasks={tasks}
                categories={categories}
                onTaskCreated={handleTaskCreated}
              />
            </TabsContent>

            <TabsContent value="week" className="flex-1 overflow-auto m-0 p-0 overflow-x-auto">
              <WeekView
                currentDate={currentDate}
                selectedCategories={selectedCategories}
                tasks={tasks}
                categories={categories}
                onTaskCreated={handleTaskCreated}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}