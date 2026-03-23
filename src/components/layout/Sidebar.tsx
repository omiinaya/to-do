"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ListTodo, 
  BarChart3, 
  History,
  Plus,
  Settings,
  Calendar,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTodoStore } from "@/lib/store";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { things, addThing, fetchThings } = useTodoStore();
  const [newThingName, setNewThingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchThings();
  }, [fetchThings]);

  const handleAddThing = async () => {
    if (newThingName.trim()) {
      await addThing(newThingName.trim());
      setNewThingName("");
      setIsAdding(false);
    }
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/todos", label: "All Todos", icon: ListTodo },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/kanban", label: "Kanban", icon: LayoutGrid },
    { href: "/stats", label: "Statistics", icon: BarChart3 },
    { href: "/logs", label: "Activity Logs", icon: History },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r border-border">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">To Do</span>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4" />

          {/* Things Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Things
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {isAdding && (
              <div className="px-3">
                <input
                  type="text"
                  value={newThingName}
                  onChange={(e) => setNewThingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddThing();
                    if (e.key === "Escape") setIsAdding(false);
                  }}
                  placeholder="Thing name..."
                  className="w-full px-2 py-1 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
            )}

            {things.map((thing) => {
              const isActive = pathname === `/things/${thing.id}`;
              return (
                <Link
                  key={thing.id}
                  href={`/things/${thing.id}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: thing.color }}
                  />
                  <span className="truncate">{thing.name}</span>
                </Link>
              );
            })}

            {things.length === 0 && !isAdding && (
              <p className="px-3 text-xs text-muted-foreground">
                No things yet. Add a todo to create one.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
