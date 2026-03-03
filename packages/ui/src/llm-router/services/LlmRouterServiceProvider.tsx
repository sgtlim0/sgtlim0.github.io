'use client';

/**
 * LLM Router Service Context Provider
 *
 * This context provides access to the LLM Router API service throughout the app.
 * By default, it uses the MockLlmRouterService, but can be swapped with a real API implementation.
 */

import { createContext, useContext, type ReactNode } from 'react';
import type { LlmRouterService } from './llmRouterService';
import { mockLlmRouterService } from './mockLlmRouterService';

/**
 * LLM Router Service Context
 */
const LlmRouterServiceContext = createContext<LlmRouterService | undefined>(undefined);

/**
 * LLM Router Service Provider Props
 */
interface LlmRouterServiceProviderProps {
  children: ReactNode;
  /**
   * Optional custom service implementation
   * Defaults to MockLlmRouterService
   */
  service?: LlmRouterService;
}

/**
 * LLM Router Service Provider Component
 *
 * Wraps the app and provides access to the API service
 *
 * @example
 * ```tsx
 * // Use default mock service
 * <LlmRouterServiceProvider>
 *   <App />
 * </LlmRouterServiceProvider>
 *
 * // Use custom real API service
 * <LlmRouterServiceProvider service={realApiService}>
 *   <App />
 * </LlmRouterServiceProvider>
 * ```
 */
export function LlmRouterServiceProvider({
  children,
  service = mockLlmRouterService,
}: LlmRouterServiceProviderProps) {
  return <LlmRouterServiceContext.Provider value={service}>{children}</LlmRouterServiceContext.Provider>;
}

/**
 * Hook to access the LLM Router API service
 *
 * @throws {Error} If used outside of LlmRouterServiceProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const service = useLlmRouterService();
 *   const models = await service.getModels();
 * }
 * ```
 */
export function useLlmRouterService(): LlmRouterService {
  const context = useContext(LlmRouterServiceContext);
  if (context === undefined) {
    throw new Error('useLlmRouterService must be used within LlmRouterServiceProvider');
  }
  return context;
}
