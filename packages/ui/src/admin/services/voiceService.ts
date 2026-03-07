/**
 * Voice Interface Service — STT, TTS, meeting summary
 */
import type { STTResult, TTSConfig, VoiceSession, MeetingSummary, VoiceModel } from './voiceTypes'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const MOCK_VOICES: VoiceModel[] = [
  {
    id: 'whisper-large',
    name: 'Whisper Large v3',
    provider: 'OpenAI',
    type: 'stt',
    languages: ['ko', 'en', 'ja', 'zh'],
    quality: 'enhanced',
  },
  {
    id: 'whisper-base',
    name: 'Whisper Base',
    provider: 'OpenAI',
    type: 'stt',
    languages: ['ko', 'en'],
    quality: 'standard',
  },
  {
    id: 'tts-nova',
    name: 'TTS Nova',
    provider: 'OpenAI',
    type: 'tts',
    languages: ['ko', 'en', 'ja'],
    quality: 'enhanced',
  },
  {
    id: 'tts-alloy',
    name: 'TTS Alloy',
    provider: 'OpenAI',
    type: 'tts',
    languages: ['en'],
    quality: 'standard',
  },
  {
    id: 'elevenlabs-ko',
    name: 'ElevenLabs Korean',
    provider: 'ElevenLabs',
    type: 'tts',
    languages: ['ko'],
    quality: 'enhanced',
  },
]

const DEFAULT_TTS: TTSConfig = { voice: 'tts-nova', speed: 1.0, pitch: 1.0, language: 'ko' }

export async function startListening(language: string = 'ko'): Promise<VoiceSession> {
  await delay(200)
  return {
    id: `vs-${Date.now()}`,
    status: 'listening',
    startedAt: new Date().toISOString(),
    transcript: [],
    language,
  }
}

export async function stopListening(sessionId: string): Promise<STTResult> {
  await delay(500)
  return {
    text: '안녕하세요. H Chat에 대해 알려주세요.',
    confidence: 0.95,
    language: 'ko',
    duration: 3.2,
    isFinal: true,
  }
}

export async function transcribeAudio(
  audioBlob: Blob,
  language: string = 'ko',
): Promise<STTResult> {
  await delay(800)
  return {
    text: '오늘 회의에서 논의된 주요 안건을 정리하겠습니다.',
    confidence: 0.92,
    language,
    duration: 5.0,
    isFinal: true,
  }
}

export async function synthesizeSpeech(
  text: string,
  config: TTSConfig = DEFAULT_TTS,
): Promise<{ url: string; duration: number }> {
  await delay(600)
  return { url: `#mock-audio-${Date.now()}`, duration: text.length * 0.08 }
}

export async function summarizeMeeting(
  transcriptSegments: { speaker: string; text: string }[],
): Promise<MeetingSummary> {
  await delay(1000)
  return {
    id: `ms-${Date.now()}`,
    title: 'AI 프로젝트 주간 회의',
    duration: 3600,
    transcript: transcriptSegments.map((s, i) => ({
      ...s,
      startTime: i * 120,
      endTime: (i + 1) * 120,
    })),
    summary:
      '이번 주 AI 모델 벤치마크 결과를 공유하고, 번역 모델 파인튜닝 진행 상황을 논의했습니다. GPT-4o가 품질 기준 1위를 유지하고 있으며, 파인튜닝 모델은 전문 용어 정확도에서 16.7% 개선을 보였습니다.',
    actionItems: [
      '번역 파인튜닝 모델 프로덕션 배포 (담당: 홍길동, 기한: 3/15)',
      'RAG 검색 정확도 개선 방안 조사 (담당: 김철수, 기한: 3/12)',
      '비용 최적화 리포트 작성 (담당: 이영희, 기한: 3/10)',
    ],
    keyDecisions: [
      'GPT-4o Mini를 일반 채팅 기본 모델로 설정',
      '파인튜닝 모델 A/B 테스트 2주간 진행',
    ],
    participants: ['홍길동', '김철수', '이영희', '박대리'],
    createdAt: new Date().toISOString(),
  }
}

export async function getVoiceModels(): Promise<VoiceModel[]> {
  await delay(150)
  return MOCK_VOICES
}

export function getTTSConfig(): TTSConfig {
  return DEFAULT_TTS
}
