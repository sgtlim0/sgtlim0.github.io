'use client'

import { openDB } from 'idb'
import type { DBSchema } from 'idb'
import type { Conversation } from './types'

const DB_NAME = 'hchat-user'
const DB_VERSION = 1
const STORE_NAME = 'conversations' as const
const LS_KEY = 'hchat-conversations'
const MIGRATION_FLAG = 'hchat-idb-migrated'

interface HChatDB extends DBSchema {
  conversations: {
    key: string
    value: Conversation
    indexes: {
      'by-updatedAt': string
    }
  }
}

let _db: Promise<import('idb').IDBPDatabase<HChatDB>> | null = null

function getDB(): Promise<import('idb').IDBPDatabase<HChatDB>> {
  if (!_db) {
    _db = openDB<HChatDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('by-updatedAt', 'updatedAt', { unique: false })
        }
      },
    })
  }
  return _db
}

export async function getAllConversations(): Promise<Conversation[]> {
  const db = await getDB()
  const all = await db.getAll(STORE_NAME)
  return [...all].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function saveAllConversations(
  conversations: ReadonlyArray<Conversation>,
): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  await tx.store.clear()
  await Promise.all(conversations.map((conv) => tx.store.put(conv)))
  await tx.done
}

export async function saveConversation(conversation: Conversation): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, conversation)
}

export async function deleteConversationById(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function getConversationById(id: string): Promise<Conversation | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, id)
}

export async function migrateFromLocalStorage(): Promise<Conversation[]> {
  if (typeof window === 'undefined') return []

  if (localStorage.getItem(MIGRATION_FLAG) === 'true') {
    return getAllConversations()
  }

  const existing = await getAllConversations()
  if (existing.length > 0) {
    localStorage.setItem(MIGRATION_FLAG, 'true')
    return existing
  }

  try {
    const stored = localStorage.getItem(LS_KEY)
    if (stored) {
      const conversations: Conversation[] = JSON.parse(stored) as Conversation[]
      if (conversations.length > 0) {
        await saveAllConversations(conversations)
        localStorage.setItem(MIGRATION_FLAG, 'true')
        return conversations
      }
    }
  } catch {
    // localStorage parsing failure: return empty array silently
  }

  localStorage.setItem(MIGRATION_FLAG, 'true')
  return []
}
