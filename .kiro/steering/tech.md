# Technology Stack

## Core Framework

- **SvelteKit**: Full-stack web framework with SSR/SPA capabilities
- **Svelte 5**: Component framework with runes for reactivity
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Build tool and development server

## Package Manager

- **Bun**: Primary package manager (specified in packageManager field)
- Node.js 20+ required

## Styling & UI

- **TailwindCSS 4**: Utility-first CSS framework with Vite plugin
- **bits-ui**: Headless UI components for Svelte
- **Tailwind Variants**: Component variant system
- **Lucide/Phosphor**: Icon libraries
- **CSS Animations**: tailwindcss-animate, tw-animate-css

## Database & ORM

- **PostgreSQL**: Primary database
- **Drizzle ORM**: Type-safe SQL ORM with migrations
- **Drizzle Kit**: Schema management and migrations

## Authentication

- **Better Auth**: Authentication library for user management

## State Management

- **Svelte 5 Runes**: Built-in reactivity system ($state, $effect)
- Custom stores for window and theme management

## Development Tools

- **ESLint**: Code linting with Svelte plugin
- **Prettier**: Code formatting with Svelte plugin
- **TypeScript**: Type checking with svelte-check

## Common Commands

### Development

```bash
bun dev                 # Start development server
bun build              # Build for production
bun preview            # Preview production build
```

### Code Quality

```bash
bun check              # Type check with Svelte
bun check:watch        # Type check in watch mode
bun lint               # Run linting
bun format             # Format code
```

### Database

```bash
bun db:generate        # Generate Drizzle migrations
bun db:push            # Push schema to database
bun db:migrate         # Run migrations
bun db:seed            # Seed database with test data
```

## Configuration Files

- `svelte.config.js`: SvelteKit configuration with experimental features
- `vite.config.ts`: Vite build configuration
- `drizzle.config.ts`: Database schema and migration settings
- `tsconfig.json`: TypeScript compiler options
