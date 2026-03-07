import { describe, it, expect } from 'vitest'
import {
  startListening,
  stopListening,
  synthesizeSpeech,
  summarizeMeeting,
  getVoiceModels,
  getTTSConfig,
} from '../src/admin/services/voiceService'

describe('voiceService', () => {
  it('should start listening session', async () => {
    const session = await startListening('ko')
    expect(session.status).toBe('listening')
    expect(session.language).toBe('ko')
    expect(session.id).toBeDefined()
  })

  it('should stop listening and return transcript', async () => {
    const result = await stopListening('vs-1')
    expect(result.text.length).toBeGreaterThan(0)
    expect(result.confidence).toBeGreaterThan(0.5)
    expect(result.isFinal).toBe(true)
  })

  it('should synthesize speech', async () => {
    const result = await synthesizeSpeech('안녕하세요')
    expect(result.url).toBeDefined()
    expect(result.duration).toBeGreaterThan(0)
  })

  it('should summarize meeting', async () => {
    const summary = await summarizeMeeting([
      { speaker: '홍길동', text: '벤치마크 결과를 공유합니다' },
      { speaker: '김철수', text: '번역 모델 개선이 필요합니다' },
    ])
    expect(summary.summary.length).toBeGreaterThan(0)
    expect(summary.actionItems.length).toBeGreaterThan(0)
    expect(summary.keyDecisions.length).toBeGreaterThan(0)
    expect(summary.participants.length).toBeGreaterThan(0)
  })

  it('should return voice models', async () => {
    const models = await getVoiceModels()
    expect(models.length).toBeGreaterThan(0)
    expect(models.some((m) => m.type === 'stt')).toBe(true)
    expect(models.some((m) => m.type === 'tts')).toBe(true)
  })

  it('should return TTS config', () => {
    const config = getTTSConfig()
    expect(config.voice).toBeDefined()
    expect(config.speed).toBe(1.0)
    expect(config.language).toBe('ko')
  })
})
