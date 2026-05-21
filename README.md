# ToDo Tracker

A modern task tracking and management app with cool stats, pretty graphs and many other features. Organize todos by categories ("things"), track completion, and view productivity stats.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![React](https://img.shields.io/badge/React-19-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-teal) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## What It Does

- **Quick entry** - Type a category name + your note, hit enter. Done.
- **Autocomplete** - Existing categories show up as you type
- **Inline editing** - Click pencil to edit note, priority, due date, tags, and recurrence
- **Due dates** - Set due dates with color-coded indicators (overdue, today, upcoming)
- **Reminders** - Browser notifications for overdue, today, and upcoming todos
- **Recurring todos** - Auto-creates next occurrence on completion (daily/weekly/monthly)
- **Subtasks** - Break todos into smaller items
- **Tags** - Organize todos with comma-separated tags
- **Checkboxes** - Mark todos complete, see completion dates
- **Activity logs** - Full history of what you created, completed, deleted
- **Statistics** - Charts for weekly activity, priority distribution, activity heatmap, per-category breakdown
- **Calendar view** - Monthly calendar showing todos by due date
- **Kanban board** - Visual board with Backlog, Today, Upcoming, Done columns
- **Import/Export** - Backup your data as JSON, restore anytime
- **Auto-backup** - Automatic backups (max 30) with one-click restore
- **Search** - Real-time search across all todos
- **Streak counter** - Tracks consecutive days of completions
- **Share links** - Copy shareable URLs for any thing/category
- **Dark mode** - Professional dark theme out of the box
- **Responsive** - Works on desktop, tablet, and mobile with bottom nav
- **Keyboard shortcuts** - Ctrl+N add, Ctrl+K search, Ctrl+B toggle sidebar

## Requirements

- Node.js 18+
- npm (comes with Node.js)

## Installation

```bash
# Clone the repo
git clone https://github.com/your-username/todo-tracker.git
cd todo-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Deploy on Coolify

1. Create a new service in Coolify
2. Connect your Git repository
3. Coolify will auto-detect the Nixpacks configuration
4. Set port to `3000`
5. Deploy

The included `nixpacks.toml` handles the build automatically.

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/todo-tracker)

## Usage

### Adding Todos

1. Type a category name (e.g., "Work", "Groceries") - autocomplete suggests existing ones
2. Type what you need to do
3. Select priority (low/medium/high)
4. Click "Add Todo" or press Enter

### Editing Todos

- Click the **pencil** icon to edit inline
- Change the note text and/or priority dropdown
- Click the **checkmark** to save, or press Enter
- Press Escape to cancel

### Completing Todos

- Click the checkbox to mark complete
- Completed items show a checkmark and completion date
- Completed items stay in place but appear faded

### Viewing Stats

Navigate to **Statistics** in the sidebar to see:

- Completion rate and current streak
- Weekly activity chart (created vs completed)
- Priority distribution (donut chart)
- Todos by category (bar chart)
- Per-category performance table

### Backup & Restore

Go to **Settings** to:

- **Export** - Downloads all your data as a JSON file
- **Import** - Upload a previous backup to restore
- **Delete All Data** - Wipe everything (asks twice for confirmation)

## Data Storage

Data is stored in SQLite via Prisma ORM. The database runs on the server and can be backed up using the built-in export/import or auto-backup system.

**Note**: Use the export feature to back up your data regularly. Backups are stored as JSON files on the server.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS 4
- **Database**: SQLite via Prisma ORM
- **State**: Zustand (fetches from API)
- **Charts**: Recharts
- **Dates**: date-fns
- **Icons**: Lucide React
- **Language**: TypeScript

## Planned Features

- [x] Due dates and reminders
- [x] Recurring todos
- [x] Subtasks
- [x] Tags/labels
- [x] Calendar view
- [x] Kanban board view
- [x] REST API for external access
- [x] Collaboration/sharing
- [ ] AI chat assistant integration

## License

MIT
