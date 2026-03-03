'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { UserService } from './userService';
import { MockUserService } from './mockUserService';

const UserServiceContext = createContext<UserService>(new MockUserService());

interface UserServiceProviderProps {
  children: ReactNode;
  service?: UserService;
}

/**
 * UserServiceProvider wraps the app and provides access to UserService implementation.
 * Defaults to MockUserService if no service is provided.
 *
 * @example
 * // Use default mock service
 * <UserServiceProvider>
 *   <App />
 * </UserServiceProvider>
 *
 * @example
 * // Use custom API service
 * <UserServiceProvider service={apiUserService}>
 *   <App />
 * </UserServiceProvider>
 */
export function UserServiceProvider({ children, service }: UserServiceProviderProps) {
  return (
    <UserServiceContext.Provider value={service ?? new MockUserService()}>
      {children}
    </UserServiceContext.Provider>
  );
}

/**
 * Hook to access UserService from context.
 * Must be used within UserServiceProvider.
 */
export function useUserService(): UserService {
  return useContext(UserServiceContext);
}
