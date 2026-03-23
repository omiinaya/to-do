"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTodoStore } from "@/lib/store";
import { 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit2,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LogsPage() {
  const { logs, things, fetchAll } = useTodoStore();
  const [filter, setFilter] = useState<"all" | "created" | "completed" | "deleted">("all");

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredLogs = filter === "all" 
    ? logs 
    : logs.filter((log) => log.action === filter);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "uncompleted":
        return <XCircle className="h-4 w-4 text-yellow-500" />;
      case "deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "updated":
        return <Edit2 className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-blue-500/20 text-blue-400";
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "uncompleted":
        return "bg-yellow-500/20 text-yellow-400";
      case "deleted":
        return "bg-red-500/20 text-red-400";
      case "updated":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "created":
        return "Created";
      case "completed":
        return "Completed";
      case "uncompleted":
        return "Uncompleted";
      case "deleted":
        return "Deleted";
      case "updated":
        return "Updated";
      default:
        return action;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground">View your activity history.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filter:</span>
        {(["all", "created", "completed", "deleted"] as const).map((f) => (
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

      {/* Logs List */}
      <Card>
        <CardContent className="pt-6">
          {filteredLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No activity logs yet.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const thing = log.thingId 
                  ? things.find((t) => t.id === log.thingId) 
                  : null;

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    {/* Icon */}
                    <div className="mt-0.5">
                      {getActionIcon(log.action)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn("text-xs", getActionColor(log.action))}>
                          {getActionText(log.action)}
                        </Badge>
                        <span className="text-sm font-medium">
                          {log.entityType === "todo" ? "Todo" : "Thing"}
                        </span>
                        {thing && (
                          <Badge variant="outline" className="text-xs">
                            <div
                              className="w-2 h-2 rounded-full mr-1.5"
                              style={{ backgroundColor: thing.color }}
                            />
                            {thing.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {log.entityName}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.timestamp), "MMM d, h:mm a")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
