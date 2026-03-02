'use client';

/**
 * Admin Service Context Provider
 *
 * This context provides access to the API service throughout the Admin app.
 * By default, it uses the MockApiService, but can be swapped with a real API implementation.
 */

import { createContext, useContext, type ReactNode } from 'react';
import type { AdminApiService } from './apiService';
import { mockApiService } from './mockApiService';

/**
 * Admin Service Context
 */
const AdminServiceContext = createContext<AdminApiService | undefined>(undefined);

/**
 * Admin Service Provider Props
 */
interface AdminServiceProviderProps {
  children: ReactNode;
  /**
   * Optional custom service implementation
   * Defaults to MockApiService
   */
  service?: AdminApiService;
}

/**
 * Admin Service Provider Component
 *
 * Wraps the app and provides access to the API service
 *
 * @example
 * ```tsx
 * // Use default mock service
 * <AdminServiceProvider>
 *   <App />
 * </AdminServiceProvider>
 *
 * // Use custom real API service
 * <AdminServiceProvider service={realApiService}>
 *   <App />
 * </AdminServiceProvider>
 * ```
 */
export function AdminServiceProvider({ children, service = mockApiService }: AdminServiceProviderProps) {
  return <AdminServiceContext.Provider value={service}>{children}</AdminServiceContext.Provider>;
}

/**
 * Hook to access the Admin API service
 *
 * @throws {Error} If used outside of AdminServiceProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const service = useAdminService();
 *   const data = await service.getDashboardSummary();
 * }
 * ```
 */
export function useAdminService(): AdminApiService {
  const context = useContext(AdminServiceContext);
  if (context === undefined) {
    throw new Error('useAdminService must be used within AdminServiceProvider');
  }
  return context;
}
