/**
 * Web Worker utility — promise-based wrapper with SSR fallback.
 *
 * Usage:
 *   const { postMessage, terminate } = createWorkerClient<Req, Res>(url)
 *   const result = await postMessage(request, [transfer])
 */

/** Check whether the current environment supports Web Workers. */
export function supportsWorker(): boolean {
  return typeof Worker !== 'undefined'
}

export interface WorkerClient<TReq, TRes> {
  /** Send a message to the worker and wait for a single response. */
  postMessage(data: TReq, transfer?: Transferable[]): Promise<TRes>
  /** Terminate the underlying worker (no-op after first call). */
  terminate(): void
}

/**
 * Create a thin promise wrapper around a Web Worker.
 *
 * Each `postMessage` call returns a `Promise` that resolves with the *next*
 * message the worker posts back (single request → single response model).
 *
 * If the environment does not support Web Workers, a `fallback` function is
 * invoked on the main thread instead.
 *
 * @param workerUrl  URL / module specifier passed to `new Worker(url, opts)`.
 * @param opts       Standard `WorkerOptions` (e.g. `{ type: 'module' }`).
 * @param fallback   Optional synchronous / async function executed when
 *                   Workers are unavailable (SSR, old browsers, tests).
 */
export function createWorkerClient<TReq, TRes>(
  workerUrl: URL | string,
  opts?: WorkerOptions,
  fallback?: (data: TReq) => TRes | Promise<TRes>,
): WorkerClient<TReq, TRes> {
  // ── Fallback path (no Worker support) ──────────────────────────────
  if (!supportsWorker()) {
    if (!fallback) {
      throw new Error('Web Worker를 지원하지 않는 환경이며, 폴백 함수가 제공되지 않았습니다.')
    }
    return {
      postMessage: (data) => Promise.resolve(fallback(data)),
      terminate: () => {},
    }
  }

  // ── Worker path ────────────────────────────────────────────────────
  let worker: Worker | null = new Worker(workerUrl, opts)
  let terminated = false

  function terminate(): void {
    if (!terminated && worker) {
      worker.terminate()
      worker = null
      terminated = true
    }
  }

  function postMessage(data: TReq, transfer?: Transferable[]): Promise<TRes> {
    return new Promise<TRes>((resolve, reject) => {
      if (terminated || !worker) {
        reject(new Error('Worker가 이미 종료되었습니다.'))
        return
      }

      const w = worker

      const onMessage = (e: MessageEvent<TRes>) => {
        cleanup()
        resolve(e.data)
      }

      const onError = (err: ErrorEvent) => {
        cleanup()
        reject(new Error(err.message || 'Worker에서 오류가 발생했습니다.'))
      }

      function cleanup() {
        w.removeEventListener('message', onMessage)
        w.removeEventListener('error', onError)
      }

      w.addEventListener('message', onMessage)
      w.addEventListener('error', onError)

      if (transfer && transfer.length > 0) {
        w.postMessage(data, transfer)
      } else {
        w.postMessage(data)
      }
    })
  }

  return { postMessage, terminate }
}

/**
 * One-shot helper: create a worker, send one message, get one response,
 * then terminate. Convenient for fire-and-forget parsing tasks.
 */
export async function runWorkerTask<TReq, TRes>(
  workerUrl: URL | string,
  data: TReq,
  opts?: WorkerOptions & { transfer?: Transferable[]; fallback?: (data: TReq) => TRes | Promise<TRes> },
): Promise<TRes> {
  const { transfer, fallback, ...workerOpts } = opts ?? {}
  const client = createWorkerClient<TReq, TRes>(workerUrl, workerOpts, fallback)
  try {
    return await client.postMessage(data, transfer)
  } finally {
    client.terminate()
  }
}
