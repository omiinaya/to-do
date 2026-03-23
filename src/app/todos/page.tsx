"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddTodoForm } from "@/components/todos/AddTodoForm";
import { ThingSection } from "@/components/todos/ThingSection";
import { useTodoStore } from "@/lib/store";
import { Plus, Filter } from "lucide-react";

export default function TodosPage() {
  const { things, todos } = useTodoStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const filteredThings = things.map((thing) => {
    const thingTodos = todos.filter((t) => t.thingId === thing.id);
    const filteredTodos = thingTodos.filter((todo) => {
      if (filter === "pending") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true;
    });
    return { thing, hasTodos: filteredTodos.length > 0 };
  }).filter(({ hasTodos }) => hasTodos || filter === "all");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Todos</h1>
          <p className="text-muted-foreground">Manage all your todos in one place.</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Todo
        </Button>
      </div>

      {/* Quick Add Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Todo</CardTitle>
          </CardHeader>
          <CardContent>
            <AddTodoForm onComplete={() => setShowAddForm(false)} />
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter:</span>
        {(["all", "pending", "completed"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Things with Todos */}
      <div className="space-y-4">
        {filteredThings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "No todos yet. Add one above!"
                  : `No ${filter} todos.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredThings.map(({ thing }) => (
            <ThingSection key={thing.id} thing={thing} />
          ))
        )}
      </div>
    </div>
  );
}
