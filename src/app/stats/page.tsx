"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTodoStore, useHasHydrated } from "@/lib/store";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { 
  TrendingUp, 
  Clock, 
  FolderOpen,
  Target,
  Flame
} from "lucide-react";

export default function StatsPage() {
  const { things, todos, logs, getStats } = useTodoStore();
  const hasHydrated = useHasHydrated();
  const stats = getStats();

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Calculate completion trend (last 7 days)
  const completionTrend = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const completed = logs.filter(
      (log) =>
        log.action === "completed" &&
        new Date(log.timestamp) >= dayStart &&
        new Date(log.timestamp) <= dayEnd
    ).length;

    const created = todos.filter(
      (todo) =>
        new Date(todo.createdAt) >= dayStart &&
        new Date(todo.createdAt) <= dayEnd
    ).length;

    return {
      date: format(date, "EEE"),
      completed,
      created,
    };
  });

  // Priority distribution
  const priorityData = [
    {
      name: "High",
      value: todos.filter((t) => t.priority === "high").length,
      color: "#ef4444",
    },
    {
      name: "Medium",
      value: todos.filter((t) => t.priority === "medium").length,
      color: "#f59e0b",
    },
    {
      name: "Low",
      value: todos.filter((t) => t.priority === "low").length,
      color: "#22c55e",
    },
  ].filter(d => d.value > 0);

  // Things stats for bar chart
  const thingsData = stats.thingsStats.map((s) => ({
    name: s.thing.name,
    completed: s.completed,
    pending: s.pending,
    total: s.total,
  }));

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);
      
      const hasCompletion = logs.some(
        (log) =>
          log.action === "completed" &&
          new Date(log.timestamp) >= dayStart &&
          new Date(log.timestamp) <= dayEnd
      );

      if (hasCompletion) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-muted-foreground">Track your productivity and progress.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.completionRate)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTodos} of {stats.totalTodos} todos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{streak}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Things</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalThings}</div>
            <p className="text-xs text-muted-foreground">categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {stats.pendingTodos}
            </div>
            <p className="text-xs text-muted-foreground">todos remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completion Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250}>
                <AreaChart data={completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                    name="Completed"
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stackId="2"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Created"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 250 }}>
              {priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <Card>
        <CardHeader>
          <CardTitle>Todos by Thing</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 300 }}>
            {thingsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                <BarChart data={thingsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" stroke="#71717a" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
                  <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Things Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Things Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.thingsStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No things yet. Add some todos to see stats!
              </p>
            ) : (
              stats.thingsStats.map((s) => (
                <div
                  key={s.thing.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: s.thing.color }}
                    />
                    <span className="font-medium">{s.thing.name}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">
                      {s.total} total
                    </span>
                    <span className="text-green-500">
                      {s.completed} completed
                    </span>
                    <span className="text-yellow-500">
                      {s.pending} pending
                    </span>
                    <span className="font-medium">
                      {Math.round(s.rate)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
