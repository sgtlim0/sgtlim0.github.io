import type {
  Assistant,
  Conversation,
  TranslationJob,
  DocProject,
  OCRJob,
  ModelUsage,
  Subscription,
} from './types'

/**
 * Unified UserService interface for API-ready architecture.
 * All methods return Promises to support both async API calls and mock implementations.
 */
export interface UserService {
  // Chat operations
  getConversations(): Promise<Conversation[]>
  createConversation(assistantId: string): Promise<Conversation>
  deleteConversation(id: string): Promise<void>
  sendMessage(conversationId: string, content: string): Promise<ReadableStream<string>>

  // Assistant operations
  getAssistants(): Promise<Assistant[]>
  getCustomAssistants(): Promise<Assistant[]>
  createAssistant(data: Omit<Assistant, 'id' | 'isOfficial'>): Promise<Assistant>
  updateAssistant(id: string, data: Partial<Assistant>): Promise<Assistant>
  deleteAssistant(id: string): Promise<void>

  // My Page operations
  getUsageStats(): Promise<ModelUsage[]>
  getSubscription(): Promise<Subscription>

  // Translation operations
  getTranslationJobs(): Promise<TranslationJob[]>

  // Document operations
  getDocProjects(): Promise<DocProject[]>

  // OCR operations
  getOCRJobs(): Promise<OCRJob[]>
}
