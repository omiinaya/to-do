"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddTodoForm } from "@/components/todos/AddTodoForm";
import { TodoItem } from "@/components/todos/TodoItem";
import { useTodoStore } from "@/lib/store";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ThingDetailPage() {
  const params = useParams();
  const thingId = params.id as string;
  const { things, todos, deleteThing } = useTodoStore();
  const [showAddForm, setShowAddForm] = useState(false);

  const thing = things.find((t) => t.id === thingId);
  const thingTodos = todos.filter((t) => t.thingId === thingId);
  const completedCount = thingTodos.filter((t) => t.completed).length;
  const progress = thingTodos.length > 0 ? (completedCount / thingTodos.length) * 100 : 0;

  if (!thing) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Thing not found.</p>
            <Link href="/">
              <Button variant="link">Go back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: thing.color }}
            />
            <h1 className="text-2xl font-bold">{thing.name}</h1>
          </div>
          <p className="text-muted-foreground">
            {completedCount} of {thingTodos.length} completed
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Todo
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => {
            if (confirm(`Delete "${thing.name}" and all its todos?`)) {
              deleteThing(thing.id);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Todo</CardTitle>
          </CardHeader>
          <CardContent>
            <AddTodoForm
              defaultThing={thing.name}
              onComplete={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Todos */}
      <div className="space-y-3">
        {thingTodos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No todos yet. Add one above!
              </p>
            </CardContent>
          </Card>
        ) : (
          thingTodos
            .sort((a, b) => {
              if (a.completed !== b.completed) return a.completed ? 1 : -1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .map((todo) => <TodoItem key={todo.id} todo={todo} />)
        )}
      </div>
    </div>
  );
}
