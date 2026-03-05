# Admin API Service Layer

This directory contains the API service abstraction layer for the Admin app. It provides a clean separation between data fetching and UI components, making it easy to swap between mock and real API implementations.

## Architecture

```
services/
├── types.ts                    # TypeScript type definitions
├── apiService.ts               # Service interface
├── mockApiService.ts           # Mock implementation (default)
├── AdminServiceProvider.tsx    # React Context provider
├── hooks.ts                    # Custom React hooks
└── index.ts                    # Barrel exports
```

## Quick Start

### 1. Wrap your app with the provider

```tsx
import { AdminServiceProvider } from '@hchat/ui/admin/services';

export default function RootLayout({ children }) {
  return (
    <AdminServiceProvider>
      {children}
    </AdminServiceProvider>
  );
}
```

### 2. Use hooks in components

```tsx
import { useDashboard } from '@hchat/ui/admin/services';

export default function Dashboard() {
  const { data, loading, error } = useDashboard();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h1>Dashboard</h1>
      {data.stats.map(stat => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
```

## Available Hooks

### Dashboard
- `useDashboard()` — Get dashboard summary

### Usage History
- `useUsageHistory(year, month)` — Get usage records for a month
- `useMonthlyUsageStats(year, month)` — Get monthly stats

### Statistics
- `useStatistics(period)` — Get statistics data

### User Management
- `useUsers()` — Get all users
- `useUserSearch(query)` — Search users

### Settings
- `useSettings()` — Get admin settings

### Provider Status
- `useProviders()` — Get provider status
- `useProviderIncidents()` — Get incident logs

### Model Pricing
- `useModels()` — Get all models
- `useMonthlyCosts(months)` — Get cost breakdown

### Feature Usage
- `useFeatureUsage()` — Get feature usage stats
- `useWeeklyTrend(weeks)` — Get weekly trend
- `useAdoptionRates()` — Get adoption rates

### Prompt Library
- `usePrompts(category?)` — Get prompt templates
- `usePromptById(id)` — Get single prompt

### Agent Monitoring
- `useAgentStatus()` — Get agent status
- `useAgentLogs(limit)` — Get execution logs
- `useDailyTrend()` — Get daily trend

## Switching to Real API

When ready to connect to a real API, create a new implementation:

```typescript
// realApiService.ts
import type { AdminApiService } from './apiService';

export class RealApiService implements AdminApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getDashboardSummary() {
    const response = await fetch(`${this.baseUrl}/api/dashboard`);
    return response.json();
  }

  // Implement other methods...
}

export const realApiService = new RealApiService(process.env.API_URL);
```

Then update the provider:

```tsx
import { AdminServiceProvider } from '@hchat/ui/admin/services';
import { realApiService } from './services/realApiService';

export default function RootLayout({ children }) {
  return (
    <AdminServiceProvider service={realApiService}>
      {children}
    </AdminServiceProvider>
  );
}
```

## Data Flow

```
Component
   ↓
Custom Hook (useDashboard)
   ↓
useAdminService (Context)
   ↓
AdminApiService (interface)
   ↓
MockApiService or RealApiService (implementation)
   ↓
Data
```

## Benefits

1. **Separation of Concerns** — UI components don't know about data fetching details
2. **Easy Testing** — Components can be tested with mock data
3. **Flexible** — Switch between mock and real API without changing component code
4. **Type Safe** — Full TypeScript support
5. **Consistent** — All data fetching follows the same pattern
6. **Loading States** — Built-in loading and error handling

## Type Definitions

All types are based on the hchat-v2-extension data models and are exported from `types.ts`. This ensures consistency between the extension backend and the admin frontend.

## Mock Data

The `MockApiService` contains all hardcoded mock data extracted from existing components. It simulates network delay (100ms) for realistic behavior during development.

## Recent Updates

### Phase 22: Service Layer Implementation
- **Provider Pattern**: Interface → MockImplementation → ContextProvider → Custom Hooks
- **19 Custom Hooks**: useDashboard(), useUsageHistory(), useUsers(), useSettings(), etc.
- **Mock Network Delay**: 100-300ms realistic network simulation
- **Type Safety**: Full TypeScript support with enterprise types

### Phase 23: Performance Optimization
- **Bundle Analysis**: Service layer optimized for tree-shaking
- **Lazy Loading**: Services loaded on-demand when provider mounted

### Phase 24: CI/CD Integration
- **Type Checking**: Service layer validated in CI pipeline
- **Lint Standards**: ESLint rules for service consistency

### Phase 25: Testing & Documentation
- **Integration Tests**: Service layer covered in E2E tests
- **API Documentation**: API_SPEC.md documents all service methods

### Phase 26: Storybook Completion
- **103 Stories**: 97% UI component coverage
- **Storybook URL**: https://hchat-wiki-storybook.vercel.app

## Future Enhancements

- Add caching layer (React Query / SWR)
- Add optimistic updates
- Add real-time subscriptions (WebSocket)
- Add request cancellation
- Add retry logic
- Add pagination support
