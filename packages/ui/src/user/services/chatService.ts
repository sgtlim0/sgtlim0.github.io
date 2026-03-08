'use client';

/**
 * Chat conversation service with localStorage persistence.
 * Provides CRUD operations for conversations and messages.
 * All mutations return new arrays (immutable pattern).
 */

import type { Conversation, ChatMessage } from './types';
import { captureError } from '../../utils/errorMonitoring';

const STORAGE_KEY = 'hchat-conversations';

function getStoredConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    captureError(error instanceof Error ? error : new Error('대화 목록 로드 실패'), {
      component: 'chatService',
      action: 'getStoredConversations',
    });
    return [];
  }
}

function saveToStorage(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    captureError(error instanceof Error ? error : new Error('대화 목록 저장 실패'), {
      component: 'chatService',
      action: 'saveToStorage',
    });
  }
}

/**
 * Retrieves all stored conversations from localStorage.
 * @returns Array of Conversation objects, or empty array on failure
 */
export function getConversations(): Conversation[] {
  return getStoredConversations();
}

/**
 * Persists the full conversations array to localStorage.
 * @param conversations - Complete conversations array to save
 */
export function saveConversations(conversations: Conversation[]): void {
  saveToStorage(conversations);
}

/**
 * Creates a new conversation, prepends it to storage, and returns it.
 * @param assistantId - ID of the assistant associated with the conversation
 * @param title - Display title for the conversation
 * @returns The newly created Conversation
 */
export function createConversation(assistantId: string, title: string): Conversation {
  const now = new Date().toISOString();
  const newConversation: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    title,
    messages: [],
    assistantId,
    createdAt: now,
    updatedAt: now,
  };

  const conversations = getStoredConversations();
  const updatedConversations = [newConversation, ...conversations];
  saveToStorage(updatedConversations);

  return newConversation;
}

/**
 * Appends a message to a conversation and persists the update.
 * @param conversationId - Target conversation ID
 * @param message - The ChatMessage to append
 * @returns Updated conversations array
 */
export function addMessage(conversationId: string, message: ChatMessage): Conversation[] {
  const conversations = getStoredConversations();
  const now = new Date().toISOString();

  const updatedConversations = conversations.map(conv => {
    if (conv.id === conversationId) {
      return {
        ...conv,
        messages: [...conv.messages, message],
        updatedAt: now,
      };
    }
    return conv;
  });

  saveToStorage(updatedConversations);
  return updatedConversations;
}

/**
 * Deletes a conversation by ID and persists the change.
 * @param id - Conversation ID to delete
 * @returns Updated conversations array without the deleted conversation
 */
export function deleteConversation(id: string): Conversation[] {
  const conversations = getStoredConversations();
  const updatedConversations = conversations.filter(conv => conv.id !== id);
  saveToStorage(updatedConversations);
  return updatedConversations;
}

/**
 * Searches conversations by title or message content (case-insensitive).
 * Returns all conversations if the query is empty.
 * @param query - Search text
 * @returns Filtered conversations matching the query
 */
export function searchConversations(query: string): Conversation[] {
  if (!query.trim()) {
    return getStoredConversations();
  }

  const conversations = getStoredConversations();
  const lowerQuery = query.toLowerCase();

  return conversations.filter(conv => {
    const titleMatch = conv.title.toLowerCase().includes(lowerQuery);
    const messageMatch = conv.messages.some(msg =>
      msg.content.toLowerCase().includes(lowerQuery)
    );

    return titleMatch || messageMatch;
  });
}
