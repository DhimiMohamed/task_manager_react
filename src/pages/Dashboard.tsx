import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TaskOverview from "@/components/task-overview";
import UpcomingTasks from "@/components/upcoming-tasks";
import DailyProgress from "@/components/daily-progress";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your tasks.</p>
        </div>
        <Link to="/tasks/new">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Task
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">50% completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">33% of total tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Due in the next 24h</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Task Overview</CardTitle>
            <CardDescription>Your task completion rate over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskOverview />
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks scheduled for the next few days</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingTasks />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Progress</CardTitle>
            <CardDescription>Your productivity throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <DailyProgress />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Report</CardTitle>
            <CardDescription>Summary of your week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tasks Completed</span>
                <span className="text-sm">32/40</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Productivity Score</span>
                <span className="text-sm">85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Most Productive Day</span>
                <span className="text-sm">Tuesday</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Categories Covered</span>
                <span className="text-sm">5/6</span>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Full Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}