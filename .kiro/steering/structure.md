# Project Structure

## Root Level

- `src/`: Main application source code
- `static/`: Static assets (icons, images, videos)
- `docker/`: Docker configuration and PostgreSQL setup
- `docs/`: Project documentation
- Configuration files: `package.json`, `svelte.config.js`, `vite.config.ts`, `drizzle.config.ts`

## Source Structure (`src/`)

### Core Application

- `app.html`: HTML template
- `app.d.ts`: Global type definitions
- `hooks.server.ts`: SvelteKit server hooks
- `routes/`: SvelteKit routing (pages and API endpoints)

### Library (`src/lib/`)

#### Components (`src/lib/components/`)

- `core/`: Core desktop environment components
  - `Desktop.svelte`: Main desktop container
  - `Taskbar.svelte`: Bottom taskbar
  - `startmenu/`: Start menu components
  - `window/`: Window management components
- `ui/`: Reusable UI components (buttons, inputs, etc.)
- Standalone components: `Clock.svelte`, `ThemeSwitcher.svelte`, etc.

#### Apps (`src/lib/apps/`)

Each app follows the pattern:

```
src/lib/apps/[app-name]/
├── index.svelte     # Main app component
└── icon.svg         # App icon
```

Apps are loaded dynamically by the window manager.

#### Database (`src/lib/server/database/`)

- `schemas/`: Drizzle ORM schema definitions
  - `auth/`: Authentication-related tables
  - `platform/`: Platform settings and user preferences
- `drizzle/`: Generated migrations
- `seeds/`: Database seeding scripts
- `queries/`: Reusable database queries
- `procedures/`: SQL stored procedures

#### State Management (`src/lib/stores/`)

- `windowStore.svelte.ts`: Window management with Svelte 5 runes
- `themeStore.svelte.ts`: Theme and appearance management

#### Types (`src/lib/types/`)

- `window.ts`: Window and app-related types
- `theme.ts`: Theme system types
- `desktopEnviroment.ts`: Desktop environment types
- `settings.ts`: User settings types

#### Services (`src/lib/services/`)

- `appContext.ts`: Application context management
- `apps.remote.ts`: Remote app loading services

#### Utilities (`src/lib/utils/`)

- `iconLoader.ts`: Dynamic icon loading
- `screenshot.ts`: Window screenshot functionality
- `utils.ts`: General utility functions

## Key Patterns

### App Development

- Each app is a self-contained Svelte component in `src/lib/apps/[name]/`
- Apps receive parameters through the window manager
- Apps can be single or multi-instance based on metadata

### Database Schema Organization

- Schemas are organized by domain (auth, platform)
- Each schema has its own folder with related tables
- Seeds follow the same structure as schemas

### Component Architecture

- Core components handle desktop environment functionality
- UI components are reusable across the application
- Components use Svelte 5 runes for reactivity

### State Management

- Window state managed through `WindowManager` class
- Theme state managed through `ThemeManager` class
- Both use Svelte 5 `$state` runes for reactivity
