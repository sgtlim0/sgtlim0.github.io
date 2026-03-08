/**
 * 접근성 유틸리티 — 포커스 관리 및 스크린 리더 지원
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * 모달/다이얼로그용 포커스 트랩
 * Tab 키로 container 밖으로 포커스가 나가지 않도록 제한합니다.
 *
 * @returns cleanup 함수
 */
export function trapFocus(container: HTMLElement): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    if (focusableElements.length === 0) return

    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable.focus()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable.focus()
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)

  // 첫 번째 포커스 가능한 요소로 포커스 이동
  const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
  if (firstFocusable) {
    firstFocusable.focus()
  }

  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * 스크린 리더에 메시지를 공지합니다.
 * aria-live 영역을 동적으로 생성하여 메시지를 전달합니다.
 *
 * @param message - 공지할 메시지
 * @param priority - 'polite' (기본값) 또는 'assertive'
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const CONTAINER_ID = `sr-announcer-${priority}`

  let container = document.getElementById(CONTAINER_ID)
  if (!container) {
    container = document.createElement('div')
    container.id = CONTAINER_ID
    container.setAttribute('aria-live', priority)
    container.setAttribute('aria-atomic', 'true')
    container.setAttribute('role', priority === 'assertive' ? 'alert' : 'status')
    Object.assign(container.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0',
    })
    document.body.appendChild(container)
  }

  // 같은 메시지를 연속으로 보낼 때도 SR이 읽을 수 있도록 비우고 다시 설정
  container.textContent = ''
  requestAnimationFrame(() => {
    if (container) {
      container.textContent = message
    }
  })
}

/**
 * 포커스 가능한 요소 목록을 반환합니다.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}
