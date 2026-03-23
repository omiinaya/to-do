"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTodoStore } from "@/lib/store";
import { Download, Upload, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { things, todos, logs } = useTodoStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      things,
      todos,
      logs,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todo-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (!data.things || !data.todos) {
          alert("Invalid backup file format.");
          return;
        }

        if (!confirm(`Import ${data.things.length} things and ${data.todos.length} todos? This will replace your current data.`)) {
          return;
        }

        // Clear and reload localStorage
        localStorage.setItem("todo-tracker-storage", JSON.stringify({
          state: {
            things: data.things,
            todos: data.todos,
            logs: data.logs || [],
          },
          version: 0,
        }));

        window.location.reload();
      } catch {
        alert("Failed to parse backup file. Make sure it's a valid JSON file.");
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleClearData = () => {
    if (!confirm("Are you sure you want to delete ALL your data? This cannot be undone.")) return;
    if (!confirm("Really? Everything will be gone forever.")) return;

    localStorage.removeItem("todo-tracker-storage");
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your data and preferences.</p>
      </div>

      {/* Import / Export */}
      <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>
            Export your data as a JSON file or import from a previous backup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleExport} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Data Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Current Data</CardTitle>
          <CardDescription>
            Overview of what&apos;s stored locally in your browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{things.length}</div>
              <div className="text-xs text-muted-foreground">Things</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{todos.length}</div>
              <div className="text-xs text-muted-foreground">Todos</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{logs.length}</div>
              <div className="text-xs text-muted-foreground">Logs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions. Be careful.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleClearData} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
