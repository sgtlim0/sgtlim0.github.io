'use client';

import type { Assistant } from './types';

const STORAGE_KEY = 'hchat-custom-assistants';

function getStoredAssistants(): Assistant[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('커스텀 어시스턴트 로드 실패:', error);
    return [];
  }
}

function saveToStorage(assistants: Assistant[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assistants));
  } catch (error) {
    console.error('커스텀 어시스턴트 저장 실패:', error);
  }
}

export function getCustomAssistants(): Assistant[] {
  return getStoredAssistants();
}

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

export function deleteCustomAssistant(id: string): Assistant[] {
  const assistants = getStoredAssistants();
  const updatedAssistants = assistants.filter(assistant => assistant.id !== id);
  saveToStorage(updatedAssistants);
  return updatedAssistants;
}
