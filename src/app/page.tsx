"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddTodoForm } from "@/components/todos/AddTodoForm";
import { ThingSection } from "@/components/todos/ThingSection";
import { useTodoStore, useHasHydrated } from "@/lib/store";
import { 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  FolderOpen 
} from "lucide-react";

export default function Dashboard() {
  const { things, getStats } = useTodoStore();
  const hasHydrated = useHasHydrated();
  const stats = getStats();

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Things</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalThings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Todos</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTodos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completedTodos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pendingTodos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Add Todo</CardTitle>
        </CardHeader>
        <CardContent>
          <AddTodoForm />
        </CardContent>
      </Card>

      {/* Things with Todos */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Things</h2>
        {things.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No things yet. Add a todo above to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          things.map((thing) => (
            <ThingSection key={thing.id} thing={thing} />
          ))
        )}
      </div>
    </div>
  );
}
