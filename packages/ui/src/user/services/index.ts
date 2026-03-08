export * from './types'
export * from './mockData'
export * from './sseService'
export * from './chatService'
export { RealChatService, createRealChatService } from './realChatService'
export * from './indexedDbService'
export * from './assistantService'
export * from './researchService'

// API-ready service layer
export type { UserService } from './userService'
export { MockUserService } from './mockUserService'
export { UserServiceProvider, useUserService } from './UserServiceProvider'
export * from './hooks'
