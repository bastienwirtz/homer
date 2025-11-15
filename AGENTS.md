# AGENTS Instructions

This file provides guidance to AI Agents when working with code in this repository.

## Development Commands

```bash
pnpm install      # Install dependencies (PNPM enforced via packageManager)
pnpm dev          # Start development server on http://localhost:3000
pnpm mock         # Start mock API server for testing service integrations
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint with auto-fix
```

## Architecture Overview

Homer is a static Vue.js 3 PWA dashboard that loads configuration from YAML files. The architecture is service-oriented with dynamic component loading.

### Core Application Structure

- **Entry Point**: `src/main.js` mounts the Vue app
- **Root Component**: `src/App.vue` handles layout, configuration loading, and routing
- **Configuration System**: YAML-based with runtime merging of defaults (`src/assets/defaults.yml`) and user config (`/assets/config.yml`)
- **Service Components**: 53 specialized integrations in `src/components/services/` that extend a Generic component pattern

### Service Integration Pattern

All service components follow this architecture:

- Extend `Generic.vue` using Vue slots (`<template #indicator>`, `<template #content>`, `<template #icon>`)
- Use the `service.js` mixin (`src/mixins/service.js`) for common API functionality
- Use a custom `fetch` method provided by the service mixin to seamlessly support proxy configuration, custom headers, and credentials.

### Configuration & Routing

- **Multi-page Support**: Hash-based routing without Vue Router
- **Dynamic Config Loading**: External URLs supported via `config.remote_config`
- **Theme System**: CSS layers architecture with three built-in themes in `src/assets/themes/`
- **Asset Management**: Static files served from `/assets/` with runtime configuration merging

### Build System Details

- **Vite 7**: Modern build tool with Vue plugin
- **PWA**: Auto-updating service worker via `vite-plugin-pwa`
- **SCSS**: Bulma framework with modular component styling
- **Docker**: Multi-stage build (Node.js → Alpine + Lighttpd)

### Mock Data Creation Pattern

When creating mock data for service components testing:

**Structure**: `dummy-data/[component-name]/[api-path]/[endpoint]`

**Steps**:

1. **Analyze component**: Read the Vue component file to identify API calls (look for `this.fetch()` calls)
2. **Check existing mock**: If mock directory exists, read existing files to check for missing fields
3. **Create/update structure**: `mkdir -p dummy-data/[lowercase-component-name]/` and mirror API endpoint paths
4. **Create/update JSON files**: Write realistic mock responses matching the expected data structure
5. **Verify fields**: Ensure all fields used in the component's computed properties and templates are included
6. **Update existing mocks**: If mock files exist but are missing fields, add the missing fields without removing existing data

**Key Points**:

- Component directory name should be lowercase version of component name (e.g., `AdGuardHome.vue` → `adguardhome/`)
- Directory structure mirrors API endpoints exactly
- Files contain JSON responses (no file extension needed)
- Mock server serves from `dummy-data/` via `pnpm mock` command
- Each component gets isolated directory to prevent API path conflicts
- When updating existing mocks, preserve existing data and only add missing fields required by the component
- Always read existing mock files first to understand current structure before making changes

**Example**: For `AdGuardHome.vue`:
- API calls: `/control/status`, `/control/stats`
- Mock files: `dummy-data/adguardhome/control/status`, `dummy-data/adguardhome/control/stats`

### Development Notes

- Use `pnpm mock` to test service integrations with dummy data
- Configuration changes require restart in development mode
- New service components should follow the Generic component slot pattern
- Themes use CSS custom properties for dynamic color switching
- The app has no backend dependencies and generates static files only
