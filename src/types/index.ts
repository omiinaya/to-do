export interface Thing {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Todo {
  id: string;
  thingId: string;
  note: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  completedAt: Date | null;
}

export interface ActivityLog {
  id: string;
  action: "created" | "completed" | "uncompleted" | "deleted";
  entityType: "todo" | "thing";
  entityId: string;
  entityName: string;
  thingId?: string;
  thingName?: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export type Priority = "low" | "medium" | "high";
