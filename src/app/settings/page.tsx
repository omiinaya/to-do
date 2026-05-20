"use client";

import { useRef, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTodoStore } from "@/lib/store";
import {
  Download,
  Upload,
  Trash2,
  RefreshCw,
  RotateCcw,
  Database,
  HardDrive,
} from "lucide-react";

export default function SettingsPage() {
  const { things, todos, logs, fetchAll } = useTodoStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [backups, setBackups] = useState<string[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);

  useEffect(() => {
    fetchAll();
    loadBackups();
  }, [fetchAll]);

  const loadBackups = async () => {
    setLoadingBackups(true);
    try {
      const res = await fetch("/api/backup");
      const json = await res.json();
      if (json.success) setBackups(json.data);
    } catch (err) {
      console.error("Failed to load backups:", err);
    }
    setLoadingBackups(false);
  };

  const createBackup = async () => {
    setCreatingBackup(true);
    try {
      const res = await fetch("/api/backup", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        await loadBackups();
      } else {
        alert("Backup failed: " + json.error);
      }
    } catch (err) {
      alert("Backup failed");
    }
    setCreatingBackup(false);
  };

  const restoreBackup = async (filename: string) => {
    if (
      !confirm(
        `Restore from "${filename}"? This will replace all current data.`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/backup/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Restored successfully!");
        await fetchAll();
      } else {
        alert("Restore failed: " + json.error);
      }
    } catch (err) {
      alert("Restore failed");
    }
  };

  const handleExport = async () => {
    const res = await fetch("/api/export");
    const data = await res.json();

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (!data.things || !data.todos) {
          alert("Invalid backup file format.");
          setImporting(false);
          return;
        }

        const thingCount = data.things.length;
        const todoCount = data.todos.length;

        if (
          !confirm(
            `Import ${thingCount} things and ${todoCount} todos? This will replace all current data.`,
          )
        ) {
          setImporting(false);
          return;
        }

        const res = await fetch("/api/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (result.success) {
          alert(result.message);
          await fetchAll();
        } else {
          alert("Import failed: " + result.error);
        }
      } catch {
        alert("Failed to parse backup file. Make sure it's a valid JSON file.");
      }
      setImporting(false);
    };
    reader.readAsText(file);

    e.target.value = "";
  };

  const handleClearData = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL your data? This cannot be undone.",
      )
    )
      return;
    if (!confirm("Really? Everything will be gone forever.")) return;

    await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ things: [], todos: [], logs: [] }),
    });

    await fetchAll();
    alert("All data cleared.");
  };

  const formatBackupName = (filename: string) => {
    // backup-2026-03-24T01-33-34-462Z.json -> 2026-03-24 01:33:34
    const match = filename.match(
      /backup-(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})/,
    );
    if (match) {
      return `${match[1]} ${match[2]}:${match[3]}:${match[4]}`;
    }
    return filename;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your data and preferences.
        </p>
      </div>

      {/* Automatic Backups */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Automatic Backups
              </CardTitle>
              <CardDescription>
                Server keeps up to 30 backups. Schedule daily backups via cron
                with:{" "}
                <code className="text-xs bg-muted px-1 rounded">
                  curl -X POST http://your-host:7171/api/backup
                </code>
              </CardDescription>
            </div>
            <Button onClick={createBackup} disabled={creatingBackup} size="sm">
              {creatingBackup ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <HardDrive className="h-4 w-4 mr-2" />
              )}
              Backup Now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingBackups ? (
            <p className="text-muted-foreground text-sm">Loading backups...</p>
          ) : backups.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No backups yet. Click &quot;Backup Now&quot; to create one.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {backups.map((filename) => (
                <div
                  key={filename}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted/70"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formatBackupName(filename)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => restoreBackup(filename)}
                    className="text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Import / Export */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Backup & Restore</CardTitle>
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
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
              disabled={importing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? "Importing..." : "Import Data"}
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
            Overview of what&apos;s stored in the database.
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
          <CardDescription>Irreversible actions. Be careful.</CardDescription>
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
