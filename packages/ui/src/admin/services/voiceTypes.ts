/**
 * Voice Interface types (STT/TTS)
 */

export type VoiceCommand =
  | 'send_message'
  | 'navigate'
  | 'search'
  | 'read_aloud'
  | 'start_recording'
  | 'stop_recording'

export interface STTResult {
  readonly text: string
  readonly confidence: number
  readonly language: string
  readonly duration: number
  readonly isFinal: boolean
}

export interface TTSConfig {
  readonly voice: string
  readonly speed: number
  readonly pitch: number
  readonly language: string
}

export interface VoiceSession {
  readonly id: string
  readonly status: 'idle' | 'listening' | 'processing' | 'speaking'
  readonly startedAt?: string
  readonly transcript: string[]
  readonly language: string
}

export interface MeetingSummary {
  readonly id: string
  readonly title: string
  readonly duration: number
  readonly transcript: TranscriptSegment[]
  readonly summary: string
  readonly actionItems: string[]
  readonly keyDecisions: string[]
  readonly participants: string[]
  readonly createdAt: string
}

export interface TranscriptSegment {
  readonly speaker: string
  readonly text: string
  readonly startTime: number
  readonly endTime: number
}

export interface VoiceModel {
  readonly id: string
  readonly name: string
  readonly provider: string
  readonly type: 'stt' | 'tts'
  readonly languages: string[]
  readonly quality: 'standard' | 'enhanced'
}
