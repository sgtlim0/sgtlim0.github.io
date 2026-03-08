import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  startListening,
  stopListening,
  transcribeAudio,
  synthesizeSpeech,
  summarizeMeeting,
  getVoiceModels,
  getTTSConfig,
} from '../src/admin/services/voiceService'

describe('voiceService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('startListening', () => {
    it('should return a voice session', async () => {
      const promise = startListening('ko')
      vi.advanceTimersByTime(300)
      const session = await promise

      expect(session).toHaveProperty('id')
      expect(session.status).toBe('listening')
      expect(session.language).toBe('ko')
      expect(session.transcript).toEqual([])
      expect(session).toHaveProperty('startedAt')
    })

    it('should default to Korean language', async () => {
      const promise = startListening()
      vi.advanceTimersByTime(300)
      const session = await promise

      expect(session.language).toBe('ko')
    })
  })

  describe('stopListening', () => {
    it('should return STT result', async () => {
      const promise = stopListening('vs-123')
      vi.advanceTimersByTime(600)
      const result = await promise

      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('confidence')
      expect(result).toHaveProperty('language')
      expect(result).toHaveProperty('duration')
      expect(result.isFinal).toBe(true)
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.text.length).toBeGreaterThan(0)
    })
  })

  describe('transcribeAudio', () => {
    it('should transcribe audio blob', async () => {
      const blob = new Blob(['audio-data'], { type: 'audio/wav' })
      const promise = transcribeAudio(blob, 'ko')
      vi.advanceTimersByTime(1000)
      const result = await promise

      expect(result).toHaveProperty('text')
      expect(result).toHaveProperty('confidence')
      expect(result.isFinal).toBe(true)
      expect(result.language).toBe('ko')
      expect(result.duration).toBeGreaterThan(0)
    })

    it('should default to Korean language', async () => {
      const blob = new Blob(['audio-data'])
      const promise = transcribeAudio(blob)
      vi.advanceTimersByTime(1000)
      const result = await promise

      expect(result.language).toBe('ko')
    })
  })

  describe('synthesizeSpeech', () => {
    it('should return audio URL and duration', async () => {
      const promise = synthesizeSpeech('테스트 텍스트')
      vi.advanceTimersByTime(700)
      const result = await promise

      expect(result).toHaveProperty('url')
      expect(result).toHaveProperty('duration')
      expect(result.url).toBeTruthy()
      expect(result.duration).toBeGreaterThan(0)
    })

    it('should produce longer duration for longer text', async () => {
      const shortPromise = synthesizeSpeech('짧은')
      vi.advanceTimersByTime(700)
      const shortResult = await shortPromise

      const longPromise = synthesizeSpeech('이것은 훨씬 더 긴 텍스트입니다 테스트를 위해 작성되었습니다')
      vi.advanceTimersByTime(700)
      const longResult = await longPromise

      expect(longResult.duration).toBeGreaterThan(shortResult.duration)
    })
  })

  describe('summarizeMeeting', () => {
    it('should summarize meeting transcript', async () => {
      const transcript = [
        { speaker: '홍길동', text: 'AI 모델 벤치마크 결과를 공유합니다.' },
        { speaker: '김철수', text: 'GPT-4o가 1위를 차지했네요.' },
      ]
      const promise = summarizeMeeting(transcript)
      vi.advanceTimersByTime(1200)
      const summary = await promise

      expect(summary).toHaveProperty('id')
      expect(summary).toHaveProperty('title')
      expect(summary).toHaveProperty('summary')
      expect(summary).toHaveProperty('actionItems')
      expect(summary).toHaveProperty('keyDecisions')
      expect(summary).toHaveProperty('participants')
      expect(summary.actionItems.length).toBeGreaterThan(0)
      expect(summary.keyDecisions.length).toBeGreaterThan(0)
      expect(summary.participants.length).toBeGreaterThan(0)
    })

    it('should include duration and transcript', async () => {
      const transcript = [{ speaker: '이영희', text: '안녕하세요.' }]
      const promise = summarizeMeeting(transcript)
      vi.advanceTimersByTime(1200)
      const summary = await promise

      expect(summary.duration).toBeGreaterThan(0)
      expect(summary.transcript.length).toBeGreaterThan(0)
      summary.transcript.forEach((t) => {
        expect(t).toHaveProperty('speaker')
        expect(t).toHaveProperty('text')
        expect(t).toHaveProperty('startTime')
        expect(t).toHaveProperty('endTime')
      })
    })
  })

  describe('getVoiceModels', () => {
    it('should return voice models', async () => {
      const promise = getVoiceModels()
      vi.advanceTimersByTime(200)
      const models = await promise

      expect(models.length).toBeGreaterThan(0)
      models.forEach((m) => {
        expect(m).toHaveProperty('id')
        expect(m).toHaveProperty('name')
        expect(m).toHaveProperty('provider')
        expect(m).toHaveProperty('type')
        expect(m).toHaveProperty('languages')
        expect(['stt', 'tts']).toContain(m.type)
      })
    })

    it('should include both STT and TTS models', async () => {
      const promise = getVoiceModels()
      vi.advanceTimersByTime(200)
      const models = await promise

      const types = models.map((m) => m.type)
      expect(types).toContain('stt')
      expect(types).toContain('tts')
    })
  })

  describe('getTTSConfig', () => {
    it('should return default TTS configuration', () => {
      const config = getTTSConfig()

      expect(config).toHaveProperty('voice')
      expect(config).toHaveProperty('speed')
      expect(config).toHaveProperty('pitch')
      expect(config).toHaveProperty('language')
      expect(config.speed).toBe(1.0)
      expect(config.language).toBe('ko')
    })
  })
})
