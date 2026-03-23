import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Thing, Todo, ActivityLog, Priority } from '@/types';

interface TodoStore {
  things: Thing[];
  todos: Todo[];
  logs: ActivityLog[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  
  // Thing actions
  addThing: (name: string, color?: string) => Thing;
  updateThing: (id: string, name: string, color?: string) => void;
  deleteThing: (id: string) => void;
  getThingByName: (name: string) => Thing | undefined;
  
  // Todo actions
  addTodo: (thingName: string, note: string, priority?: Priority) => Todo;
  updateTodo: (id: string, note: string, priority?: Priority) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  getTodosByThing: (thingId: string) => Todo[];
  
  // Log actions
  addLog: (action: ActivityLog['action'], entityType: ActivityLog['entityType'], entityId: string, entityName: string, thingId?: string, thingName?: string) => void;
  getLogsByThing: (thingId: string) => ActivityLog[];
  getLogsByDateRange: (startDate: Date, endDate: Date) => ActivityLog[];
  
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

const THING_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      things: [],
      todos: [],
      logs: [],
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      addThing: (name: string, color?: string) => {
        const existingThing = get().things.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (existingThing) return existingThing;

        const newThing: Thing = {
          id: uuidv4(),
          name,
          color: color || THING_COLORS[get().things.length % THING_COLORS.length],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          things: [...state.things, newThing],
        }));

        get().addLog('created', 'thing', newThing.id, newThing.name);
        return newThing;
      },

      updateThing: (id: string, name: string, color?: string) => {
        set((state) => ({
          things: state.things.map((t) =>
            t.id === id ? { ...t, name, color: color || t.color, updatedAt: new Date() } : t
          ),
        }));
      },

      deleteThing: (id: string) => {
        const thing = get().things.find(t => t.id === id);
        if (thing) {
          get().addLog('deleted', 'thing', id, thing.name);
        }
        set((state) => ({
          things: state.things.filter((t) => t.id !== id),
          todos: state.todos.filter((t) => t.thingId !== id),
        }));
      },

      getThingByName: (name: string) => {
        return get().things.find(t => t.name.toLowerCase() === name.toLowerCase());
      },

      addTodo: (thingName: string, note: string, priority: Priority = 'medium') => {
        let thing = get().getThingByName(thingName);
        if (!thing) {
          thing = get().addThing(thingName);
        }

        const newTodo: Todo = {
          id: uuidv4(),
          thingId: thing.id,
          note,
          completed: false,
          priority,
          createdAt: new Date(),
          completedAt: null,
        };

        set((state) => ({
          todos: [...state.todos, newTodo],
        }));

        get().addLog('created', 'todo', newTodo.id, note, thing.id, thing.name);
        return newTodo;
      },

      updateTodo: (id: string, note: string, priority?: Priority) => {
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, note, priority: priority || t.priority } : t
          ),
        }));
      },

      toggleTodo: (id: string) => {
        const todo = get().todos.find(t => t.id === id);
        if (!todo) return;

        const thing = get().things.find(t => t.id === todo.thingId);
        const newCompleted = !todo.completed;

        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id
              ? { ...t, completed: newCompleted, completedAt: newCompleted ? new Date() : null }
              : t
          ),
        }));

        get().addLog(
          newCompleted ? 'completed' : 'uncompleted',
          'todo',
          id,
          todo.note,
          thing?.id,
          thing?.name
        );
      },

      deleteTodo: (id: string) => {
        const todo = get().todos.find(t => t.id === id);
        if (todo) {
          const thing = get().things.find(t => t.id === todo.thingId);
          get().addLog('deleted', 'todo', id, todo.note, thing?.id, thing?.name);
        }
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        }));
      },

      getTodosByThing: (thingId: string) => {
        return get().todos.filter(t => t.thingId === thingId);
      },

      addLog: (action, entityType, entityId, entityName, thingId?, thingName?) => {
        const newLog: ActivityLog = {
          id: uuidv4(),
          action,
          entityType,
          entityId,
          entityName,
          thingId,
          thingName,
          timestamp: new Date(),
        };

        set((state) => ({
          logs: [newLog, ...state.logs].slice(0, 1000),
        }));
      },

      getLogsByThing: (thingId: string) => {
        return get().logs.filter(l => l.thingId === thingId);
      },

      getLogsByDateRange: (startDate: Date, endDate: Date) => {
        return get().logs.filter(l => {
          const logDate = new Date(l.timestamp);
          return logDate >= startDate && logDate <= endDate;
        });
      },

      getStats: () => {
        const state = get();
        const totalTodos = state.todos.length;
        const completedTodos = state.todos.filter(t => t.completed).length;
        const pendingTodos = totalTodos - completedTodos;
        const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

        const thingsStats = state.things.map(thing => {
          const thingTodos = state.todos.filter(t => t.thingId === thing.id);
          const total = thingTodos.length;
          const completed = thingTodos.filter(t => t.completed).length;
          const pending = total - completed;
          const rate = total > 0 ? (completed / total) * 100 : 0;

          return {
            thing,
            total,
            completed,
            pending,
            rate,
          };
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
    }),
    {
      name: 'todo-tracker-storage',
      storage: createJSONStorage(() => 
        typeof window !== 'undefined' ? window.localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (state) => ({
        things: state.things,
        todos: state.todos,
        logs: state.logs,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Hook to check hydration status
export const useHasHydrated = () => {
  return useTodoStore((state) => state._hasHydrated);
};
