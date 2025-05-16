// src/components/calendar/calendar-sidebar.tsx
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  getDay,
  subDays,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Category } from "@/api/models/category"

interface CalendarSidebarProps {
  currentDate: Date
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  selectedCategories: number[]
  onCategoryToggle: (category: number) => void
  categories: Category[]
}



export default function CalendarSidebar({
  currentDate,
  selectedDate,
  onDateSelect,
  onPrevMonth,
  onNextMonth,
  selectedCategories,
  onCategoryToggle,
  categories,
}: CalendarSidebarProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get the day of the week for the first day of the month (0 = Sunday, 6 = Saturday)
  const startDay = getDay(monthStart)

  // Create an array for the days of the week
  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  // Calculate the days to display before the first day of the month
  const daysBeforeMonth = Array.from({ length: startDay }, (_, i) => subDays(monthStart, startDay - i)).reverse()

  // Calculate the days to display after the last day of the month
  const daysAfterMonth = Array.from({ length: (7 - ((startDay + monthDays.length) % 7)) % 7 }, (_, i) =>
    addDays(monthEnd, i + 1),
  )

  // Combine all days
  const calendarDays = [...daysBeforeMonth, ...monthDays, ...daysAfterMonth]

  // Group days into weeks
  const weeks = []
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7))
  }

  return (
    <Card className="w-64 flex-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{format(currentDate, "MMMM yyyy")}</CardTitle>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous month</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNextMonth}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next month</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-7 text-center text-xs mb-1">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1 text-center">
              {week.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isSelected = isSameDay(day, selectedDate)

                return (
                  <Button
                    key={dayIndex}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7 p-0 text-xs font-normal",
                      !isCurrentMonth && "text-muted-foreground opacity-50",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    )}
                    onClick={() => onDateSelect(day)}
                  >
                    {format(day, "d")}
                  </Button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id!)}
                  onCheckedChange={() => onCategoryToggle(category.id!)}
                />
                <div className="flex items-center space-x-2">
                  <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: category.color || '#CCCCCC' }}
        />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}