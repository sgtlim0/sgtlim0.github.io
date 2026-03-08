/**
 * Unified persistence storage abstraction over IndexedDB (primary) and localStorage (fallback).
 *
 * Uses the `idb` library for IndexedDB access. SSR-safe — all operations
 * return sensible defaults when running outside a browser context.
 */

import { openDB } from 'idb'
import type { IDBPDatabase } from 'idb'

const DB_NAME = 'hchat-persist'
const STORE_NAME = 'kv' as const

// ---------- IndexedDB singleton ----------

let _db: Promise<IDBPDatabase> | null = null

function isIndexedDBAvailable(): boolean {
  if (typeof indexedDB === 'undefined') return false
  try {
    // Some environments define indexedDB but throw on open
    return typeof indexedDB.open === 'function'
  } catch {
    return false
  }
}

function getDB(): Promise<IDBPDatabase> {
  if (!_db) {
    _db = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      },
    })
  }
  return _db
}

// ---------- IndexedDB adapter ----------

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, key) as Promise<T | undefined>
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, value, key)
}

async function idbDelete(key: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, key)
}

async function idbClear(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
}

// ---------- localStorage adapter ----------

function lsGet<T>(key: string): Promise<T | undefined> {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return Promise.resolve(undefined)
    return Promise.resolve(JSON.parse(raw) as T)
  } catch {
    return Promise.resolve(undefined)
  }
}

function lsSet<T>(key: string, value: T): Promise<void> {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota exceeded or unavailable — silently ignore
  }
  return Promise.resolve()
}

function lsDelete(key: string): Promise<void> {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
  return Promise.resolve()
}

function lsClear(): Promise<void> {
  // intentionally only clear keys we manage — noop for safety
  return Promise.resolve()
}

// ---------- Public API ----------

export interface PersistStorage {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

/**
 * Create a PersistStorage instance.
 *
 * @param preferIndexedDB - When true (default) uses IndexedDB with localStorage fallback.
 *   When false uses localStorage directly.
 */
export function createPersistStorage(preferIndexedDB = true): PersistStorage {
  const useIDB = preferIndexedDB && isIndexedDBAvailable()

  return {
    get: useIDB ? idbGet : lsGet,
    set: useIDB ? idbSet : lsSet,
    delete: useIDB ? idbDelete : lsDelete,
    clear: useIDB ? idbClear : lsClear,
  }
}

/** Default storage instance (IndexedDB with localStorage fallback). */
export const persistStorage: PersistStorage = createPersistStorage()

/**
 * Reset the internal IndexedDB singleton — primarily for tests.
 */
export function _resetDB(): void {
  _db = null
}
