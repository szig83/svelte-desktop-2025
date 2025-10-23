# Product Overview

This is a desktop environment web application built with SvelteKit that simulates a traditional desktop operating system interface in the browser.

## Key Features

- **Window Management System**: Multi-window interface with draggable, resizable windows
- **Desktop Environment**: Complete desktop metaphor with taskbar, start menu, and workspace
- **App Framework**: Modular app system where each app is a separate Svelte component
- **Theme System**: Dynamic theming with light/dark modes and customizable backgrounds
- **Authentication**: Built-in user authentication and authorization system
- **Database Integration**: PostgreSQL with Drizzle ORM for data persistence
- **Settings Management**: User preferences and configuration storage

## Architecture Philosophy

The application follows a desktop OS paradigm where:

- Apps are independent Svelte components loaded dynamically
- Windows can be opened, closed, minimized, maximized, and managed
- Each app can have multiple instances with different parameters
- The system maintains state for window positions, sizes, and user preferences
- Authentication and permissions control access to different apps and features
