"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ListTodo, 
  BarChart3, 
  History,
  Settings,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddTodoForm } from "@/components/todos/AddTodoForm";

export function MobileNav() {
  const pathname = usePathname();
  const [showAddForm, setShowAddForm] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/todos", label: "Todos", icon: ListTodo },
    { href: "/stats", label: "Stats", icon: BarChart3 },
    { href: "/logs", label: "Logs", icon: History },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          {/* Add Button */}
          <Button
            size="icon"
            className="h-12 w-12 rounded-full -mt-4 shadow-lg"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>

          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Sidebar (hidden by default) */}
      <div
        id="mobile-sidebar"
        className="fixed inset-0 z-50 hidden md:hidden"
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border p-4">
          <h2 className="text-lg font-semibold mb-4">Menu</h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    const sidebar = document.getElementById("mobile-sidebar");
                    sidebar?.classList.add("hidden");
                  }}
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
        </div>
      </div>

      {/* Add Todo Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAddForm(false)}
          />
          <div className="absolute bottom-20 left-4 right-4 bg-card border border-border rounded-lg shadow-xl p-4">
            <AddTodoForm onComplete={() => setShowAddForm(false)} />
          </div>
        </div>
      )}
    </>
  );
}
