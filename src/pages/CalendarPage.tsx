import customAxios from "../lib/customAxios";
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
import { TasksApi } from "@/api/apis/tasks-api";
import { Task } from "@/api/models/task";
import { Category } from "@/api/models/category";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"month" | "week">("month");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksApi = new TasksApi(undefined, undefined, customAxios);
        const [categoriesRes, tasksRes] = await Promise.all([
          tasksApi.tasksCategoriesList(),
          tasksApi.tasksList(),
        ]);
        setCategories(categoriesRes.data);
        setSelectedCategories(categoriesRes.data.map((c) => c.id!));
        setTasks(tasksRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const formatWeekRange = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const end = endOfWeek(date, { weekStartsOn: 0 });
    return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col lg:h-[calc(100vh-4rem)] h-auto">
      <div className="flex-none ">
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
              {/* Left side: prev/date/next */}
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

              {/* Right side: Tabs */}
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