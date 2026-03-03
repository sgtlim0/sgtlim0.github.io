'use client';

import type { UserService } from './userService';
import type {
  Assistant,
  Conversation,
  TranslationJob,
  DocProject,
  OCRJob,
  ModelUsage,
  Subscription
} from './types';
import {
  mockAssistants,
  mockModelUsage,
  mockSubscription,
  mockDocProjects,
  mockOCRJobs
} from './mockData';
import * as chatService from './chatService';
import * as assistantService from './assistantService';
import { streamResponse } from './sseService';

/**
 * Mock implementation of UserService using localStorage and mock data.
 * All operations include a simulated delay (100-300ms) for realistic async behavior.
 */
export class MockUserService implements UserService {
  private delay(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, 100 + Math.random() * 200);
    });
  }

  // Chat operations
  async getConversations(): Promise<Conversation[]> {
    await this.delay();
    return chatService.getConversations();
  }

  async createConversation(assistantId: string): Promise<Conversation> {
    await this.delay();
    const title = '새 대화';
    return chatService.createConversation(assistantId, title);
  }

  async deleteConversation(id: string): Promise<void> {
    await this.delay();
    chatService.deleteConversation(id);
  }

  async sendMessage(conversationId: string, content: string): Promise<ReadableStream<string>> {
    await this.delay();
    const conversation = chatService.getConversations().find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('대화를 찾을 수 없습니다');
    }

    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      role: 'user' as const,
      content,
      timestamp: new Date().toISOString()
    };
    chatService.addMessage(conversationId, userMessage);

    // Stream assistant response
    const sseStream = streamResponse(content, conversation.assistantId);

    return new ReadableStream<string>({
      start(controller) {
        let fullResponse = '';

        sseStream.subscribe(
          (chunk) => {
            fullResponse += chunk;
            controller.enqueue(chunk);
          },
          () => {
            // Save assistant message
            const assistantMessage = {
              id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              role: 'assistant' as const,
              content: fullResponse,
              timestamp: new Date().toISOString(),
              assistantId: conversation.assistantId
            };
            chatService.addMessage(conversationId, assistantMessage);
            controller.close();
          },
          (error) => {
            controller.error(error);
          }
        );
      }
    });
  }

  // Assistant operations
  async getAssistants(): Promise<Assistant[]> {
    await this.delay();
    return [...mockAssistants];
  }

  async getCustomAssistants(): Promise<Assistant[]> {
    await this.delay();
    return assistantService.getCustomAssistants();
  }

  async createAssistant(data: Omit<Assistant, 'id' | 'isOfficial'>): Promise<Assistant> {
    await this.delay();
    return assistantService.saveCustomAssistant(data);
  }

  async updateAssistant(id: string, data: Partial<Assistant>): Promise<Assistant> {
    await this.delay();
    const updated = assistantService.updateCustomAssistant(id, data);
    const assistant = updated.find(a => a.id === id);
    if (!assistant) {
      throw new Error('어시스턴트를 찾을 수 없습니다');
    }
    return assistant;
  }

  async deleteAssistant(id: string): Promise<void> {
    await this.delay();
    assistantService.deleteCustomAssistant(id);
  }

  // My Page operations
  async getUsageStats(): Promise<ModelUsage[]> {
    await this.delay();
    return [...mockModelUsage];
  }

  async getSubscription(): Promise<Subscription> {
    await this.delay();
    return { ...mockSubscription };
  }

  // Translation operations
  async getTranslationJobs(): Promise<TranslationJob[]> {
    await this.delay();
    return [];
  }

  // Document operations
  async getDocProjects(): Promise<DocProject[]> {
    await this.delay();
    return [...mockDocProjects];
  }

  // OCR operations
  async getOCRJobs(): Promise<OCRJob[]> {
    await this.delay();
    return [...mockOCRJobs];
  }
}
