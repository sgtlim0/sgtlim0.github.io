'use client';

/**
 * Custom assistant management service with localStorage persistence.
 * Handles CRUD operations for user-created assistants.
 */

import type { Assistant } from './types';
import { captureError } from '../../utils/errorMonitoring';

const STORAGE_KEY = 'hchat-custom-assistants';

function getStoredAssistants(): Assistant[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    captureError(error instanceof Error ? error : new Error('커스텀 어시스턴트 로드 실패'), {
      component: 'assistantService',
      action: 'getStoredAssistants',
    });
    return [];
  }
}

function saveToStorage(assistants: Assistant[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assistants));
  } catch (error) {
    captureError(error instanceof Error ? error : new Error('커스텀 어시스턴트 저장 실패'), {
      component: 'assistantService',
      action: 'saveToStorage',
    });
  }
}

/**
 * Retrieves all custom (user-created) assistants from localStorage.
 * @returns Array of custom Assistant objects
 */
export function getCustomAssistants(): Assistant[] {
  return getStoredAssistants();
}

/**
 * Creates and persists a new custom assistant with an auto-generated ID.
 * @param assistant - Assistant data (without id and isOfficial)
 * @returns The newly created Assistant with generated ID and isOfficial=false
 */
export function saveCustomAssistant(
  assistant: Omit<Assistant, 'id' | 'isOfficial'>
): Assistant {
  const newAssistant: Assistant = {
    ...assistant,
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    isOfficial: false,
  };

  const assistants = getStoredAssistants();
  const updatedAssistants = [...assistants, newAssistant];
  saveToStorage(updatedAssistants);

  return newAssistant;
}

/**
 * Updates a custom assistant's properties by ID.
 * The id and isOfficial fields cannot be overridden.
 * @param id - Assistant ID to update
 * @param data - Partial fields to merge
 * @returns Updated assistants array
 */
export function updateCustomAssistant(
  id: string,
  data: Partial<Assistant>
): Assistant[] {
  const assistants = getStoredAssistants();

  const updatedAssistants = assistants.map(assistant => {
    if (assistant.id === id) {
      return {
        ...assistant,
        ...data,
        id: assistant.id,
        isOfficial: false,
      };
    }
    return assistant;
  });

  saveToStorage(updatedAssistants);
  return updatedAssistants;
}

/**
 * Deletes a custom assistant by ID and persists the change.
 * @param id - Assistant ID to delete
 * @returns Updated assistants array without the deleted assistant
 */
export function deleteCustomAssistant(id: string): Assistant[] {
  const assistants = getStoredAssistants();
  const updatedAssistants = assistants.filter(assistant => assistant.id !== id);
  saveToStorage(updatedAssistants);
  return updatedAssistants;
}
