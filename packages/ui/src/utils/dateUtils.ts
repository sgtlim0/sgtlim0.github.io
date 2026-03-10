/**
 * Date utility functions — no external dependencies (date-fns, dayjs 미사용)
 */

/**
 * 주어진 년/월의 일 수 반환 (0-indexed month: 0=Jan, 11=Dec)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * 주어진 년/월의 1일 요일 반환 (0=일, 6=토)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/**
 * 날짜 포맷 (간단한 토큰 기반)
 *
 * 지원 토큰:
 * - YYYY: 4자리 연도
 * - MM: 2자리 월
 * - DD: 2자리 일
 * - yyyy, mm, dd: alias
 */
export function formatDate(date: Date, format: string): string {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()

  return format
    .replace(/YYYY|yyyy/g, String(y))
    .replace(/MM|mm/g, String(m).padStart(2, '0'))
    .replace(/DD|dd/g, String(d).padStart(2, '0'))
}

/**
 * 두 날짜가 같은 날인지 비교 (시간 무시)
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * 두 날짜가 같은 월인지 비교
 */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/**
 * date가 start 이상 end 이하인지 (날짜 단위)
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const d = stripTime(date).getTime()
  const s = stripTime(start).getTime()
  const e = stripTime(end).getTime()
  return d >= s && d <= e
}

/**
 * 시간 제거 (00:00:00 으로 설정한 새 Date 반환)
 */
export function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * date가 target보다 이전인지 (날짜 단위)
 */
export function isBefore(date: Date, target: Date): boolean {
  return stripTime(date).getTime() < stripTime(target).getTime()
}

/**
 * date가 target보다 이후인지 (날짜 단위)
 */
export function isAfter(date: Date, target: Date): boolean {
  return stripTime(date).getTime() > stripTime(target).getTime()
}

/** 한국어 요일 */
export const WEEKDAY_LABELS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const

/** 한국어 월 이름 */
export const MONTH_LABELS_KO = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
] as const
