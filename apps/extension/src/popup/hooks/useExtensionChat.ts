import { useState, useCallback, useRef, useEffect } from 'react'
import type { AnalysisMode, PageContext } from '../../types/context'

export interface UseExtensionChatOptions {
  mode: AnalysisMode
  context: PageContext | null
  onComplete?: (result: string) => void
  onError?: (error: Error) => void
}

export interface UseExtensionChatReturn {
  result: string
  isStreaming: boolean
  error: Error | null
  startAnalysis: () => Promise<void>
  reset: () => void
}

// Mock streaming analysis function for development
async function* mockStreamAnalysis(
  mode: AnalysisMode,
  _text: string,
): AsyncGenerator<string, void, unknown> {
  const responses: Record<AnalysisMode, string> = {
    summarize: `이 페이지의 주요 내용을 요약하면 다음과 같습니다:\n\n1. React 19의 새로운 Actions API가 도입되었습니다.\n2. 서버 컴포넌트 지원이 개선되었습니다.\n3. Document Metadata 관리 기능이 추가되었습니다.\n4. Asset Loading이 최적화되었습니다.\n\n전반적으로 개발자 경험과 성능이 크게 향상되었습니다.`,
    explain: `선택하신 내용에 대해 자세히 설명드리겠습니다.\n\n이 개념은 React의 핵심 원리 중 하나로, 컴포넌트 재사용성과 타입 안전성을 동시에 보장하는 중요한 패턴입니다.\n\n구체적으로는:\n- 타입 파라미터를 활용한 제네릭 프로그래밍\n- 컴파일 타임 타입 체크\n- 런타임 오버헤드 없음\n\n이를 통해 더 안전하고 유지보수하기 쉬운 코드를 작성할 수 있습니다.`,
    research: `관련 정보를 조사한 결과입니다:\n\n**주요 트렌드:**\n- AI 기술의 급속한 발전\n- 생성형 AI의 대중화\n- 멀티모달 모델의 확산\n\n**산업 영향:**\n- 개발 생산성 30-50% 향상\n- 새로운 비즈니스 모델 창출\n- 기존 워크플로우의 자동화\n\n**향후 전망:**\n2024년에는 더욱 강력하고 효율적인 모델들이 등장할 것으로 예상됩니다.`,
    translate: `번역 결과:\n\nThis page introduces the new features of React 19.\n\nThe main updates include:\n- New Actions API for form handling\n- Improved server components support\n- Document metadata management\n- Optimized asset loading\n\nThese features significantly enhance developer experience and application performance.`,
  }

  const response = responses[mode]
  const words = response.split(' ')

  for (let i = 0; i < words.length; i++) {
    yield words.slice(0, i + 1).join(' ')
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

export function useExtensionChat({
  mode,
  context,
  onComplete,
  onError,
}: UseExtensionChatOptions): UseExtensionChatReturn {
  const [result, setResult] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const startAnalysis = useCallback(async () => {
    if (!context) {
      const err = new Error('No context available')
      setError(err)
      onError?.(err)
      return
    }

    try {
      setIsStreaming(true)
      setError(null)
      setResult('')

      abortControllerRef.current = new AbortController()

      // Check if we have real service available (to be implemented by W1)
      // For now, use mock streaming
      const stream = mockStreamAnalysis(mode, context.text)

      for await (const chunk of stream) {
        if (abortControllerRef.current.signal.aborted) {
          break
        }
        setResult(chunk)
      }

      if (!abortControllerRef.current.signal.aborted) {
        onComplete?.(result)
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err)
        onError?.(err)
      }
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [mode, context, onComplete, onError, result])

  const reset = useCallback(() => {
    abortControllerRef.current?.abort()
    setResult('')
    setError(null)
    setIsStreaming(false)
  }, [])

  return {
    result,
    isStreaming,
    error,
    startAnalysis,
    reset,
  }
}
