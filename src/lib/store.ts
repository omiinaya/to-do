import { create } from "zustand";
import { Thing, Todo, ActivityLog, Priority, Recurrence } from "@/types";

interface TodoOptions {
  dueDate?: string | null;
  tags?: string;
  recurrence?: Recurrence | null;
  parentTodoId?: string | null;
}

interface TodoStore {
  things: Thing[];
  todos: Todo[];
  logs: ActivityLog[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Data fetching
  fetchThings: () => Promise<void>;
  fetchTodos: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchAll: () => Promise<void>;

  // Thing actions
  addThing: (name: string, color?: string) => Promise<Thing>;
  updateThing: (id: string, name: string, color?: string) => Promise<void>;
  deleteThing: (id: string) => Promise<void>;

  // Todo actions
  addTodo: (
    thingName: string,
    note: string,
    priority?: Priority,
    options?: TodoOptions,
  ) => Promise<void>;
  updateTodo: (
    id: string,
    note: string,
    priority?: Priority,
    options?: TodoOptions,
  ) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;

  // Stats
  getStats: () => {
    totalThings: number;
    totalTodos: number;
    completedTodos: number;
    pendingTodos: number;
    completionRate: number;
    thingsStats: Array<{
      thing: Thing;
      total: number;
      completed: number;
      pending: number;
      rate: number;
    }>;
  };
}

export const useTodoStore = create<TodoStore>()((set, get) => ({
  things: [],
  todos: [],
  logs: [],
  _hasHydrated: false,

  setHasHydrated: (state: boolean) => {
    set({ _hasHydrated: state });
  },

  fetchThings: async () => {
    const res = await fetch("/api/things");
    const json = await res.json();
    if (json.success) set({ things: json.data });
  },

  fetchTodos: async () => {
    const res = await fetch("/api/todos?parentTodoId=null");
    const json = await res.json();
    if (json.success) set({ todos: json.data });
  },

  fetchLogs: async () => {
    const res = await fetch("/api/logs");
    const json = await res.json();
    if (json.success) set({ logs: json.data });
  },

  fetchAll: async () => {
    await Promise.all([
      get().fetchThings(),
      get().fetchTodos(),
      get().fetchLogs(),
    ]);
    set({ _hasHydrated: true });
  },

  addThing: async (name: string, color?: string) => {
    const res = await fetch("/api/things", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    const json = await res.json();
    if (json.success) {
      await get().fetchThings();
      return json.data;
    }
    throw new Error("Failed to add thing");
  },

  updateThing: async (id: string, name: string, color?: string) => {
    const res = await fetch(`/api/things/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) await get().fetchThings();
  },

  deleteThing: async (id: string) => {
    const res = await fetch(`/api/things/${id}`, { method: "DELETE" });
    if (res.ok) {
      await get().fetchAll();
    }
  },

  addTodo: async (
    thingName: string,
    note: string,
    priority: Priority = "medium",
    options?: TodoOptions,
  ) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thingName, note, priority, ...options }),
    });
    if (res.ok) await get().fetchAll();
  },

  updateTodo: async (
    id: string,
    note: string,
    priority?: Priority,
    options?: TodoOptions,
  ) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, priority, ...options }),
    });
    if (res.ok) await get().fetchTodos();
  },

  toggleTodo: async (id: string) => {
    const res = await fetch(`/api/todos/${id}/complete`, { method: "PATCH" });
    if (res.ok) await get().fetchAll();
  },

  deleteTodo: async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (res.ok) await get().fetchAll();
  },

  getStats: () => {
    const state = get();
    const totalTodos = state.todos.length;
    const completedTodos = state.todos.filter((t) => t.completed).length;
    const pendingTodos = totalTodos - completedTodos;
    const completionRate =
      totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

    const thingsStats = state.things.map((thing) => {
      const thingTodos = state.todos.filter((t) => t.thingId === thing.id);
      const total = thingTodos.length;
      const completed = thingTodos.filter((t) => t.completed).length;
      const pending = total - completed;
      const rate = total > 0 ? (completed / total) * 100 : 0;

      return { thing, total, completed, pending, rate };
    });

    return {
      totalThings: state.things.length,
      totalTodos,
      completedTodos,
      pendingTodos,
      completionRate,
      thingsStats,
    };
  },
}));

// Hook to check hydration status
export const useHasHydrated = () => {
  return useTodoStore((state) => state._hasHydrated);
};
