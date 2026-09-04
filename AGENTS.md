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
- **Service Components**: 58 specialized integrations in `src/components/services/` that extend a Generic component pattern

### Service Integration Pattern

All service components follow this architecture:

- Render a single `Generic.vue` as the template root and feed it the `subtitle`, `status` and `badges` props, using a slot (`icon`, `subtitle`, `aside`, `badges`) only for richer content. `Generic` owns the card layout and `pnpm lint` enforces it.
- Use the `service.js` mixin (`src/mixins/service.js`) for common API functionality. It supplies the `item` prop, calls your `fetchData()` on create and on the refresh schedule, and owns error state through `load()` and `serverError`.
- Use a custom `fetch` method provided by the service mixin to seamlessly support proxy configuration, custom headers, and credentials.
- Keep display formatting out of the mixin. `capCount`, `displayRate`, `displaySize` and `displayDuration` are pure functions in `src/utils/format.js`, importable by anything, including components that are not cards. Anything needing `this` (the item config, the proxy, the lifecycle) belongs on the mixin instead.
- Never call the native `fetch` in a service component unless you have a specific reason not to. See `OpenWeather` (third-party public API) or `Rtorrent` (XML-RPC on a separate host) for use case where the service fetch is not suitable.
- Pass the service's own headers (an API key, an `Authorization` header, ...) as the `init.headers` argument of `this.fetch(path, init, json)`. They layer over the user's `proxy.headers` and item `headers` rather than replacing them, so a card must never build its headers from `proxy` or `item.headers` itself. Names are compared case-insensitively, and the card value wins on conflict.

### Auto-Update Configuration

Services support automatic data refreshing using a centralized scheduler system with global and per-service configuration:

#### Global Configuration

`updateIntervalMs: 30000` - Set default interval for all services (30 seconds)

#### Service Configuration
- **Service-specific interval**: `updateIntervalMs: 10000` - Override global default
- **Disable per service**: `updateIntervalMs: false` (or `0`) - Disable for specific service
- **Use global default**: Omit `updateIntervalMs` to use global setting

The mixin still accepts `checkInterval`, `downloadInterval`, `rateInterval`, `torrentInterval` and `updateInterval`, logging a deprecation warning for each.

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
