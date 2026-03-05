'use client'

/**
 * React hooks for SSE streaming chat completion
 *
 * Provides a convenient interface for managing streaming lifecycle
 * with proper cleanup and immutable state updates.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { StreamingOptions, StreamingResult, StreamingController } from './streamingTypes'
import { streamChatCompletion } from './streamingService'

interface UseStreamingChatOptions {
  onComplete?: (result: StreamingResult) => void
}

interface UseStreamingChatReturn {
  isStreaming: boolean
  streamingContent: string
  result: StreamingResult | null
  error: Error | null
  startStream: (options: Omit<StreamingOptions, 'onToken' | 'onComplete' | 'onError'>) => void
  stopStream: () => void
  reset: () => void
}

/**
 * Hook for managing streaming chat completion lifecycle.
 *
 * @returns Streaming state and control functions
 *
 * @example
 * ```tsx
 * function ChatPanel() {
 *   const { isStreaming, streamingContent, result, error, startStream, stopStream, reset } =
 *     useStreamingChat();
 *
 *   const handleSend = () => {
 *     startStream({
 *       model: 'gpt-4o',
 *       messages: [{ role: 'user', content: 'Hello!' }],
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <p>{streamingContent}</p>
 *       {isStreaming && <button onClick={stopStream}>Stop</button>}
 *       {result && <p>Cost: {result.estimatedCostKRW} KRW</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useStreamingChat(options?: UseStreamingChatOptions): UseStreamingChatReturn {
  const onCompleteCallbackRef = useRef(options?.onComplete)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [result, setResult] = useState<StreamingResult | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const controllerRef = useRef<StreamingController | null>(null)
  const mountedRef = useRef(true)

  // Track mounted state for safe state updates
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (controllerRef.current) {
        controllerRef.current.abort()
        controllerRef.current = null
      }
    }
  }, [])

  // Sync callback ref
  useEffect(() => {
    onCompleteCallbackRef.current = options?.onComplete
  })

  const startStream = useCallback(
    (options: Omit<StreamingOptions, 'onToken' | 'onComplete' | 'onError'>) => {
      // Abort any existing stream
      if (controllerRef.current) {
        controllerRef.current.abort()
        controllerRef.current = null
      }

      // Reset state immutably
      setIsStreaming(true)
      setStreamingContent('')
      setResult(null)
      setError(null)

      const controller = streamChatCompletion({
        ...options,
        onToken: (token: string) => {
          if (mountedRef.current) {
            setStreamingContent((prev) => prev + token)
          }
        },
        onComplete: (streamResult: StreamingResult) => {
          if (mountedRef.current) {
            setResult(streamResult)
            setIsStreaming(false)
            controllerRef.current = null
            onCompleteCallbackRef.current?.(streamResult)
          }
        },
        onError: (err: Error) => {
          if (mountedRef.current) {
            setError(err)
            setIsStreaming(false)
            controllerRef.current = null
          }
        },
      })

      controllerRef.current = controller
    },
    [],
  )

  const stopStream = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort()
      // Note: onComplete callback will fire with partial result and set isStreaming to false
    }
  }, [])

  const reset = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort()
      controllerRef.current = null
    }
    setIsStreaming(false)
    setStreamingContent('')
    setResult(null)
    setError(null)
  }, [])

  return {
    isStreaming,
    streamingContent,
    result,
    error,
    startStream,
    stopStream,
    reset,
  }
}
