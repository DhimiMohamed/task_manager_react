import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import TaskList from "@/components/task-list";
import { useCategories } from "@/hooks/useCategories";

export default function TasksPage() {
  const { data: categories } = useCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage and organize all your tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Link to="/tasks/new">
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-4 w-4" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Tasks</CardTitle>
            </CardHeader>
            <CardContent className="overflow-visible">
              <TaskList filter="all" categories={categories || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="today" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList filter="today" categories={categories || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upcoming" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList filter="upcoming" categories={categories || []} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList filter="completed" categories={categories || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}