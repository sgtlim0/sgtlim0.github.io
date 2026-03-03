export * from './types';
export * from './mockData';
export * from './sseService';
export * from './chatService';
export * from './assistantService';

// API-ready service layer
export type { UserService } from './userService';
export { MockUserService } from './mockUserService';
export { UserServiceProvider, useUserService } from './UserServiceProvider';
export * from './hooks';
