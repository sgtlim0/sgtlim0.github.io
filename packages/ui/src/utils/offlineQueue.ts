/**
 * Offline Queue Service
 *
 * Persists failed requests to localStorage and retries them
 * when the browser comes back online. Uses exponential backoff
 * and moves exhausted items to a dead-letter queue.
 *
 * SSR-safe — all browser APIs are guarded.
 */

export interface QueuedRequest {
  readonly id: string
  readonly url: string
  readonly method: string
  readonly body?: unknown
  readonly headers?: Record<string, string>
  readonly timestamp: number
  readonly retryCount: number
  readonly maxRetries: number
}

export interface DeadLetterItem {
  readonly request: QueuedRequest
  readonly failedAt: number
  readonly lastError: string
}

export interface OfflineQueueOptions {
  /** Maximum retry attempts per request (default 3). */
  readonly maxRetries?: number
  /** Base delay in ms for exponential backoff (default 1000). */
  readonly baseDelayMs?: number
  /** localStorage key for the queue (default 'hchat:offline-queue'). */
  readonly persistKey?: string
  /** localStorage key for dead-letter items (default 'hchat:offline-dlq'). */
  readonly dlqKey?: string
  /** Callback fired after each successful retry. */
  readonly onRetrySuccess?: (request: QueuedRequest, response: Response) => void
  /** Callback fired when a request exhausts its retries. */
  readonly onDeadLetter?: (item: DeadLetterItem) => void
}

type Listener = () => void

const isBrowser = typeof window !== 'undefined'

function generateId(): string {
  if (isBrowser && typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

// ---------------------------------------------------------------------------
// OfflineQueue class
// ---------------------------------------------------------------------------

export class OfflineQueue {
  private queue: QueuedRequest[] = []
  private dlq: DeadLetterItem[] = []
  private readonly persistKey: string
  private readonly dlqKey: string
  private readonly maxRetries: number
  private readonly baseDelayMs: number
  private readonly onRetrySuccess?: (req: QueuedRequest, res: Response) => void
  private readonly onDeadLetter?: (item: DeadLetterItem) => void
  private listeners: Set<Listener> = new Set()
  private retrying = false
  private boundOnlineHandler: (() => void) | null = null

  constructor(options: OfflineQueueOptions = {}) {
    this.persistKey = options.persistKey ?? 'hchat:offline-queue'
    this.dlqKey = options.dlqKey ?? 'hchat:offline-dlq'
    this.maxRetries = options.maxRetries ?? 3
    this.baseDelayMs = options.baseDelayMs ?? 1000
    this.onRetrySuccess = options.onRetrySuccess
    this.onDeadLetter = options.onDeadLetter

    this.load()
    this.attachOnlineListener()
  }

  // -- Public API -----------------------------------------------------------

  getQueue(): readonly QueuedRequest[] {
    return this.queue
  }

  getDeadLetterQueue(): readonly DeadLetterItem[] {
    return this.dlq
  }

  get pendingCount(): number {
    return this.queue.length
  }

  get isOnline(): boolean {
    return isBrowser ? navigator.onLine : true
  }

  enqueue(
    request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>,
  ): string {
    const id = generateId()
    const item: QueuedRequest = {
      ...request,
      id,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: request.maxRetries ?? this.maxRetries,
    }
    this.queue = [...this.queue, item]
    this.persist()
    this.notify()
    return id
  }

  remove(id: string): void {
    this.queue = this.queue.filter((r) => r.id !== id)
    this.persist()
    this.notify()
  }

  clear(): void {
    this.queue = []
    this.persist()
    this.notify()
  }

  clearDeadLetterQueue(): void {
    this.dlq = []
    this.persistDlq()
  }

  async retry(id: string): Promise<Response | null> {
    const item = this.queue.find((r) => r.id === id)
    if (!item) return null
    return this.executeRetry(item)
  }

  async retryAll(): Promise<void> {
    if (this.retrying) return
    this.retrying = true
    try {
      // Process a snapshot so mutations during iteration are safe
      const snapshot = [...this.queue]
      for (const item of snapshot) {
        // Skip if already removed by a previous iteration
        if (!this.queue.find((r) => r.id === item.id)) continue
        await this.executeRetry(item)
      }
    } finally {
      this.retrying = false
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  destroy(): void {
    this.detachOnlineListener()
    this.listeners.clear()
  }

  // -- Internal -------------------------------------------------------------

  private async executeRetry(item: QueuedRequest): Promise<Response | null> {
    const delay = this.baseDelayMs * Math.pow(2, item.retryCount)

    await this.sleep(delay)

    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body !== undefined ? JSON.stringify(item.body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Success — remove from queue
      this.queue = this.queue.filter((r) => r.id !== item.id)
      this.persist()
      this.notify()
      this.onRetrySuccess?.(item, response)
      return response
    } catch (error) {
      const nextCount = item.retryCount + 1
      if (nextCount >= item.maxRetries) {
        // Move to dead-letter queue
        this.queue = this.queue.filter((r) => r.id !== item.id)
        const dlqItem: DeadLetterItem = {
          request: { ...item, retryCount: nextCount },
          failedAt: Date.now(),
          lastError: error instanceof Error ? error.message : String(error),
        }
        this.dlq = [...this.dlq, dlqItem]
        this.persist()
        this.persistDlq()
        this.notify()
        this.onDeadLetter?.(dlqItem)
      } else {
        // Increment retry count immutably
        this.queue = this.queue.map((r) =>
          r.id === item.id ? { ...r, retryCount: nextCount } : r,
        )
        this.persist()
        this.notify()
      }
      return null
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private persist(): void {
    if (!isBrowser) return
    try {
      localStorage.setItem(this.persistKey, JSON.stringify(this.queue))
    } catch {
      // localStorage may be full or unavailable
    }
  }

  private persistDlq(): void {
    if (!isBrowser) return
    try {
      localStorage.setItem(this.dlqKey, JSON.stringify(this.dlq))
    } catch {
      // localStorage may be full or unavailable
    }
  }

  private load(): void {
    if (!isBrowser) return
    try {
      const raw = localStorage.getItem(this.persistKey)
      if (raw) {
        this.queue = JSON.parse(raw) as QueuedRequest[]
      }
      const rawDlq = localStorage.getItem(this.dlqKey)
      if (rawDlq) {
        this.dlq = JSON.parse(rawDlq) as DeadLetterItem[]
      }
    } catch {
      // Corrupted data — start fresh
      this.queue = []
      this.dlq = []
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener()
    }
  }

  private attachOnlineListener(): void {
    if (!isBrowser) return
    this.boundOnlineHandler = () => {
      void this.retryAll()
    }
    window.addEventListener('online', this.boundOnlineHandler)
  }

  private detachOnlineListener(): void {
    if (!isBrowser || !this.boundOnlineHandler) return
    window.removeEventListener('online', this.boundOnlineHandler)
    this.boundOnlineHandler = null
  }
}

// ---------------------------------------------------------------------------
// Singleton for convenience (lazy-initialized)
// ---------------------------------------------------------------------------

let defaultInstance: OfflineQueue | null = null

export function getOfflineQueue(options?: OfflineQueueOptions): OfflineQueue {
  if (!defaultInstance) {
    defaultInstance = new OfflineQueue(options)
  }
  return defaultInstance
}

export function resetOfflineQueue(): void {
  if (defaultInstance) {
    defaultInstance.destroy()
    defaultInstance = null
  }
}
