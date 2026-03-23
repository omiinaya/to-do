# ToDo Tracker - Smart Task Management App

## Overview

ToDo Tracker is a modern, professional-grade task management application built with shadcn/ui, Tailwind CSS, and dark mode styling. The app organizes todos by "things" (categories/topics) with a streamlined input flow: type the thing name (with autocomplete), add your note, and it becomes a trackable todo item with a checkbox. Includes powerful analytics, activity logs, and a REST API for future LLM integration.

---

## Core Features

### 1. Quick Todo Entry

#### Streamlined Input Flow
```
┌─────────────────────────────────────────────┐
│  + Add Todo                                 │
│  ┌─────────────────────────────────────┐   │
│  │ Thing name (autocomplete)...        │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ What do you need to do?             │   │
│  └─────────────────────────────────────┘   │
│                                    [Add ✓]  │
└─────────────────────────────────────────────┘
```

- **No title required** - just thing name + note
- **Autocomplete** for thing names (creates new thing if doesn't exist)
- **Quick add** from anywhere via floating button or keyboard shortcut
- **Inline creation** - add multiple todos quickly

#### Thing-Based Organization
- **Things**: Categories/topics (e.g., "Work", "Groceries", "Health", "Project X")
- Each thing contains multiple todo items
- Auto-created on first use
- Color-coded for visual identification
- Collapsible sections in main view

#### Todo Item Structure
```typescript
interface Todo {
  id: string;
  thingId: string;
  note: string;              // The actual task/note content
  completed: boolean;
  createdAt: DateTime;
  completedAt: DateTime | null;
  priority: "low" | "medium" | "high";
}
```

### 2. Main View - All Todos

```
┌─────────────────────────────────────────────────┐
│ 🔍 Search todos...                     [+ Add] │
├─────────────────────────────────────────────────┤
│                                                 │
│ ▼ WORK (5/12 complete)              [45% ████░░]│
│   ☐ Finish the quarterly report                 │  ← Mar 23, 2026
│   ☑ Review pull request #42                     │  ← Mar 22, 2026 ✓ Mar 23
│   ☐ Schedule team meeting                       │  ← Mar 21, 2026
│   ☑ Update documentation                        │  ← Mar 20, 2026 ✓ Mar 21
│   ...                                           │
│                                                 │
│ ▶ GROCERIES (3/3 complete)          [100% ████]│
│                                                 │
│ ▼ HEALTH (2/5 complete)              [40% ██░░░]│
│   ☐ Book dentist appointment                    │  ← Mar 23, 2026
│   ☐ Buy vitamins                                │  ← Mar 22, 2026
│   ☑ Morning run                                 │  ← Mar 21, 2026 ✓ Mar 21
│   ...                                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

- **Grouped by thing** with collapsible sections
- **Checkbox** to mark complete/incomplete
- **Creation date** shown for each todo
- **Completion date** shown when completed
- **Progress bar** per thing showing completion %
- **Quick filters**: All, Pending, Completed, Today

### 3. Thing Detail View

- All todos for selected thing
- Sort by: Date, Priority, Status
- Bulk actions: Complete all, Delete completed
- Thing statistics sidebar

### 4. Activity Logs

- Chronological timeline of all actions
- Filter by: Date range, Thing, Action type
- Actions logged: Created, Completed, Uncompleted, Deleted
- Export to CSV/JSON

### 5. Statistics Dashboard

#### Overview Cards
- Total things count
- Total todos count
- Overall completion rate
- Current streak (days with completions)

#### Charts & Graphs

**Completion Trend (Line Chart)**
- Daily/weekly completions over time
- Shows productivity patterns

**Todos by Thing (Horizontal Bar Chart)**
- Pending vs completed per thing
- Visual comparison of workload

**Activity Heatmap (Calendar Grid)**
- GitHub-style contribution graph
- Color intensity = number of completions

**Priority Breakdown (Donut Chart)**
- Distribution by priority level
- Completion rate per priority

**Weekly Progress (Stacked Bar)**
- Created vs completed per day
- Shows backlog trends

**Top Things Leaderboard**
- Highest completion rates
- Most active categories

---

## User Interface Design

### Design System
- **Framework**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Theme**: Dark mode (default)
- **Color Palette**:
  - Background: `#09090b` (zinc-950)
  - Card: `#18181b` (zinc-900)
  - Border: `#27272a` (zinc-800)
  - Text: `#fafafa` (zinc-50)
  - Muted: `#71717a` (zinc-500)
  - Primary: `#3b82f6` (blue-500)
  - Success: `#22c55e` (green-500)
  - Warning: `#f59e0b` (amber-500)
  - Danger: `#ef4444` (red-500)

### Desktop Layout
```
┌─────────────────────────────────────────────────────┐
│ [Logo] ToDo Tracker    🔍 Search...    [🌙] [Menu] │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │         Main Content Area                │
│          │                                          │
│ 📊 Dashboard│  [Content changes based on page]     │
│ 📋 All Todos│                                      │
│ ─────────│                                          │
│ Things:  │                                          │
│ 📁 Work  │                                          │
│ 📁 Health│                                          │
│ 📁 Home  │                                          │
│ + Add    │                                          │
│ ─────────│                                          │
│ 📜 Logs  │                                          │
│ 📈 Stats │                                          │
│          │                                          │
├──────────┴──────────────────────────────────────────┤
│ [+ Add Todo]  [Keyboard shortcuts: Ctrl+N to add]   │
└─────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)
```
┌─────────────────────────┐
│ [Logo]    🔍   [☰]     │
├─────────────────────────┤
│                         │
│   Quick Add:            │
│   ┌─────────────────┐   │
│   │ Thing name...   │   │
│   └─────────────────┘   │
│   ┌─────────────────┐   │
│   │ Todo note...    │   │
│   └─────────────────┘   │
│   [+ Add]               │
│                         │
├─────────────────────────┤
│                         │
│ ▼ WORK (5/12)      [▸]  │
│   ☐ Finish report    ← Mar 23│
│   ☑ Review PR        ← Mar 22 ✓│
│                         │
│ ▶ GROCERIES (3/3)   [▸] │
│                         │
│ ▼ HEALTH (2/5)      [▸]  │
│   ☐ Book dentist     ← Mar 23│
│                         │
├─────────────────────────┤
│ [🏠] [📋] [📊] [📜] [⚙️] │
└─────────────────────────┘
```

### Mobile Navigation
- **Bottom tab bar** with 5 tabs: Home, Todos, Stats, Logs, Settings
- **Hamburger menu** for sidebar content on mobile
- **Swipe gestures** for quick actions
- **Pull to refresh** for sync
- **Touch-friendly** checkboxes and buttons (min 44px tap targets)

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, bottom nav, hamburger menu |
| Tablet | 640px - 1024px | Collapsible sidebar, 2-column grids |
| Desktop | > 1024px | Fixed sidebar, multi-column layouts |

### Mobile-Specific Features
- **Floating Action Button (FAB)** for quick add
- **Bottom sheet** for add todo form
- **Swipe left** to delete, **swipe right** to complete
- **Long press** for context menu
- **Pull down** to refresh

---

## REST API

### Base URL
```
/api/v1
```

### Authentication (Future)
```
Authorization: Bearer <token>
```

### Endpoints

#### Things
```http
GET    /api/v1/things              # List all things
POST   /api/v1/things              # Create a thing
GET    /api/v1/things/:id          # Get thing with todos
PUT    /api/v1/things/:id          # Update thing
DELETE /api/v1/things/:id          # Delete thing and all todos
```

#### Todos
```http
GET    /api/v1/todos               # List all todos (with filters)
POST   /api/v1/todos               # Create a todo
GET    /api/v1/todos/:id           # Get todo
PUT    /api/v1/todos/:id           # Update todo
PATCH  /api/v1/todos/:id/complete  # Toggle completion
DELETE /api/v1/todos/:id           # Delete todo
```

#### Query Parameters
```http
GET /api/v1/todos?thingId=work&completed=false&priority=high&limit=50&offset=0
GET /api/v1/todos?createdAfter=2026-03-01&createdBefore=2026-03-31
GET /api/v1/todos?search=report&sortBy=createdAt&order=desc
```

#### Statistics
```http
GET /api/v1/stats                  # Overall statistics
GET /api/v1/stats/things           # Per-thing statistics
GET /api/v1/stats/completion-trend # Completion over time
GET /api/v1/stats/activity-heatmap # Activity data for heatmap
```

#### Activity Logs
```http
GET /api/v1/logs                   # List activity logs
GET /api/v1/logs?thingId=work      # Filter by thing
GET /api/v1/logs?action=completed  # Filter by action
GET /api/v1/logs?from=2026-03-01   # Date range
```

### API Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 42,
    "limit": 50,
    "offset": 0
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Thing not found"
  }
}
```

### Example Usage for LLMs
```bash
# Get all pending todos
curl http://localhost:3000/api/v1/todos?completed=false

# Create a todo
curl -X POST http://localhost:3000/api/v1/todos \
  -H "Content-Type: application/json" \
  -d '{"thingName": "Work", "note": "Finish quarterly report"}"

# Complete a todo
curl -X PATCH http://localhost:3000/api/v1/todos/abc123/complete

# Get statistics
curl http://localhost:3000/api/v1/stats
```

---

## MCP (Model Context Protocol) Support [Future]

### Overview
MCP allows AI agents (like Claude, GPT) to interact with ToDo Tracker programmatically.

### MCP Tools
```typescript
// Tools exposed to AI agents
const mcpTools = {
  // Read operations
  listThings: "List all things/categories",
  listTodos: "List todos with optional filters",
  getThingStats: "Get statistics for a thing",
  getOverallStats: "Get overall app statistics",
  
  // Write operations
  createThing: "Create a new thing/category",
  createTodo: "Create a new todo item",
  completeTodo: "Mark a todo as complete",
  uncompleteTodo: "Mark a todo as incomplete",
  deleteTodo: "Delete a todo item",
  
  // Analytics
  getProductivityReport: "Generate productivity insights",
  suggestPriorities: "AI-suggested priority assignments"
};
```

### MCP Resources
```typescript
const mcpResources = {
  "things://list": "All things with metadata",
  "todos://pending": "All pending todos",
  "todos://completed/today": "Today's completed todos",
  "stats://overview": "Dashboard statistics",
  "logs://recent": "Recent activity logs"
};
```

### Example AI Interactions
```
User: "What do I need to do for work today?"
AI: *calls listTodos(thingId="work", completed=false)*

User: "Add a todo to buy groceries: milk, eggs, bread"
AI: *calls createTodo(thingName="Groceries", note="Buy milk, eggs, bread")*

User: "How productive was I this week?"
AI: *calls getProductivityReport(period="week")*
```

---

## Technical Architecture

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **State**: Zustand with localStorage persistence
- **Charts**: Recharts
- **Dates**: date-fns
- **Animations**: Framer Motion
- **API**: Next.js API Routes
- **AI Backend**: OpenCode (final phase)
- **LLM**: OpenAI / Anthropic (via OpenCode)

### Data Models

#### Thing
```typescript
interface Thing {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Todo
```typescript
interface Todo {
  id: string;
  thingId: string;
  note: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  completedAt: Date | null;
}
```

#### ActivityLog
```typescript
interface ActivityLog {
  id: string;
  action: "created" | "completed" | "uncompleted" | "deleted";
  entityType: "todo" | "thing";
  entityId: string;
  entityName: string;
  thingId?: string;
  thingName?: string;
  timestamp: Date;
}
```

### File Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard
│   ├── todos/page.tsx              # All todos
│   ├── things/
│   │   └── [id]/page.tsx           # Thing detail
│   ├── logs/page.tsx               # Activity logs
│   ├── stats/page.tsx              # Statistics
│   └── api/
│       ├── things/route.ts
│       ├── things/[id]/route.ts
│       ├── todos/route.ts
│       ├── todos/[id]/route.ts
│       ├── todos/[id]/complete/route.ts
│       ├── stats/route.ts
│       ├── logs/route.ts
│       └── chat/route.ts           # AI chat endpoint (final phase)
├── components/
│   ├── ui/                         # shadcn components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── QuickAdd.tsx
│   ├── todos/
│   │   ├── TodoItem.tsx
│   │   ├── TodoList.tsx
│   │   ├── AddTodoForm.tsx
│   │   └── ThingSection.tsx
│   ├── things/
│   │   ├── ThingCard.tsx
│   │   └── ThingAutocomplete.tsx
│   ├── charts/
│   │   ├── CompletionTrend.tsx
│   │   ├── ActivityHeatmap.tsx
│   │   ├── ThingsBarChart.tsx
│   │   └── StatsCard.tsx
│   └── chat/                       # AI chat (final phase)
│       ├── ChatPanel.tsx
│       ├── ChatMessage.tsx
│       ├── ChatInput.tsx
│       └── TodoCard.tsx
├── lib/
│   ├── store.ts                    # Zustand store
│   ├── utils.ts
│   ├── analytics.ts
│   └── openai.ts                   # OpenCode/LLM client (final phase)
└── types/
    └── index.ts
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | Quick add todo |
| `Ctrl/Cmd + K` | Search |
| `Ctrl/Cmd + B` | Toggle sidebar |
| `Space` | Toggle todo completion (when focused) |
| `Delete` | Delete todo (when focused) |
| `Escape` | Close modals |

---

## Accessibility

- ARIA labels on all interactive elements
- Full keyboard navigation
- Screen reader support
- WCAG AA contrast ratios
- Visible focus indicators
- Minimum 44px touch targets on mobile
- Reduced motion support

---

## Future Enhancements

### Short Term
- Due dates with reminders
- Recurring todos
- Subtasks
- File attachments
- Tags/labels

### Medium Term
- Cloud sync (Firebase/Supabase)
- Collaboration/sharing
- Calendar view
- Kanban board view

### Long Term
- AI-powered suggestions
- Natural language input ("remind me Friday to call mom")
- Mobile native app (React Native)
- Desktop app (Electron)

---

## AI Chat Integration (Final Phase)

### Overview
Integrate an AI assistant powered by OpenCode into the app. The assistant lives in a sleek chat panel and can read, create, complete, and manage todos on behalf of the user. Think of it as a smart sidebar chat that understands your todos and helps you get things done.

### UX Design

**Desktop - Collapsible Side Panel**
```
┌──────────────────────────────┬─────────────────────┐
│                              │  AI Assistant    [X]│
│      Main App Content        │                     │
│                              │  What do you need   │
│                              │  help with?         │
│                              │                     │
│                              │  ┌───────────────┐  │
│                              │  │ Type here...  │  │
│                              │  └───────────────┘  │
│                              │                     │
│                              │  You:               │
│                              │  What's on my plate │
│                              │  for Work today?    │
│                              │                     │
│                              │  AI:                │
│                              │  You have 4 pending │
│                              │  todos under Work:  │
│                              │  • Finish report    │
│                              │  • Review PR #42    │
│                              │  ...                │
│                              │                     │
└──────────────────────────────┴─────────────────────┘
```

**Mobile - Bottom Sheet / Full Screen**
```
┌─────────────────────────┐
│  AI Assistant        [X] │
├─────────────────────────┤
│                         │
│  You: Show me my stats  │
│                         │
│  AI: This week you've   │
│  completed 12/18 todos  │
│  (67%). Your most       │
│  productive day was     │
│  Tuesday with 5         │
│  completions.           │
│                         │
│  ┌─────────────────┐    │
│  │ Ask anything... │ ➤  │
│  └─────────────────┘    │
│                         │
└─────────────────────────┘
```

### Chat Features
- **Floating chat button** (bottom-right) to open/close
- **Persistent conversation history** per session
- **Markdown rendering** for AI responses
- **Inline todo cards** - AI can render interactive todo items in chat
- **Quick actions** - buttons to confirm AI suggestions ("Add this todo?")
- **Context-aware** - AI has access to current todos, stats, and logs
- **Streaming responses** for real-time feel

### What the AI Can Do
| User Says | AI Action |
|-----------|-----------|
| "What do I have to do today?" | Reads and lists pending todos |
| "Add buy groceries under Shopping" | Creates new todo |
| "Mark the report as done" | Finds and completes matching todo |
| "How productive was I this week?" | Runs stats and summarizes |
| "Prioritize my Work todos" | Suggests priority ordering |
| "Delete all completed Groceries" | Bulk deletes completed items |
| "Remind me to call mom Friday" | Creates todo with due date (future) |

### Backend Architecture
```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  Chat UI     │────▶│  /api/chat    │────▶│  OpenCode    │
│  (Frontend)  │◀────│  (Next.js)    │◀────│  (Backend)   │
└──────────────┘     └───────────────┘     └──────────────┘
                            │                      │
                            ▼                      ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Todo Store  │     │  LLM Provider│
                     │  (Zustand)   │     │  (OpenAI/    │
                     └──────────────┘     │   Anthropic) │
                                          └──────────────┘
```

### OpenCode Integration
- OpenCode runs as a backend service
- Exposes tools that map to our API endpoints
- Receives context about user's todos on each request
- Streams responses back to the frontend

### Chat API Endpoint
```http
POST /api/chat
Content-Type: application/json

{
  "message": "What do I need to do for Work?",
  "history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

**Response (Streaming)**
```
data: {"type": "text", "content": "You have "}
data: {"type": "text", "content": "4 pending "}
data: {"type": "text", "content": "todos...\n\n"}
data: {"type": "todo", "todo": {"id": "abc", "note": "Finish report", "completed": false}}
data: {"type": "todo", "todo": {"id": "def", "note": "Review PR", "completed": false}}
data: {"type": "done"}
```

### Tools Exposed to OpenCode
```typescript
const chatTools = {
  listTodos: "List todos with filters",
  createTodo: "Create a new todo (thingName, note)",
  completeTodo: "Mark todo complete by ID",
  uncompleteTodo: "Mark todo incomplete by ID",
  deleteTodo: "Delete a todo by ID",
  getStats: "Get productivity statistics",
  getLogs: "Get recent activity logs",
  searchTodos: "Search todos by text",
  bulkComplete: "Complete multiple todos",
  bulkDelete: "Delete multiple todos"
};
```

### Implementation Notes
- **Phase 1**: Basic chat with text responses
- **Phase 2**: Tool calling (AI can manipulate todos)
- **Phase 3**: Streaming + inline todo cards
- **Phase 4**: MCP integration for external AI agents
- This is the **final feature** to implement after core app is stable

---

## Summary

ToDo Tracker is a streamlined task management app focused on quick entry and organization. The simple flow (thing name + note = todo) combined with autocomplete and checkboxes makes capturing and completing tasks effortless. The shadcn dark theme provides a professional look, while the responsive design ensures usability on any device. The REST API enables future integrations, and the AI chat assistant (powered by OpenCode) adds a smart layer that helps users manage their tasks conversationally.

ToDo Tracker is a streamlined task management app focused on quick entry and organization. The simple flow (thing name + note = todo) combined with autocomplete and checkboxes makes capturing and completing tasks effortless. The shadcn dark theme provides a professional look, while the responsive design ensures usability on any device. The REST API and future MCP support enable powerful AI integrations.