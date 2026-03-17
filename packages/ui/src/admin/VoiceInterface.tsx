'use client'

import { useState } from 'react'
import type { VoiceModel, MeetingSummary } from './services/voiceTypes'
import {
  getVoiceModels,
  startListening,
  stopListening,
  synthesizeSpeech,
  summarizeMeeting,
  getTTSConfig,
} from './services/voiceService'
import { useAsyncData } from '../hooks/useAsyncData'

export default function VoiceInterface() {
  const { data: models, loading } = useAsyncData<VoiceModel[]>(() => getVoiceModels(), [])
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState<MeetingSummary | null>(null)
  const [ttsText, setTtsText] = useState('')

  const handleListen = async () => {
    if (isListening) {
      const result = await stopListening('current')
      setTranscript(result.text)
      setIsListening(false)
    } else {
      await startListening('ko')
      setIsListening(true)
    }
  }

  const handleTTS = async () => {
    if (!ttsText.trim()) return
    await synthesizeSpeech(ttsText, getTTSConfig())
  }

  const handleSummarize = async () => {
    const result = await summarizeMeeting([
      { speaker: '홍길동', text: '벤치마크 결과를 공유합니다' },
      { speaker: '김철수', text: '번역 모델 파인튜닝이 필요합니다' },
      { speaker: '이영희', text: '비용 최적화 방안을 논의합시다' },
    ])
    setSummary(result)
  }

  if (loading || !models)
    return <div className="p-8 text-center text-text-secondary">음성 모듈 로딩 중...</div>

  const sttModels = models.filter((m) => m.type === 'stt')
  const ttsModels = models.filter((m) => m.type === 'tts')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">음성 인터페이스</h2>
        <p className="text-sm text-text-secondary mt-1">
          STT {sttModels.length}개 | TTS {ttsModels.length}개 모델
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* STT */}
        <div className="p-5 rounded-xl border border-border bg-admin-bg-card space-y-4">
          <h3 className="text-sm font-bold text-text-primary">음성 → 텍스트 (STT)</h3>
          <button
            onClick={handleListen}
            className={`w-full py-4 rounded-xl text-sm font-medium transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-admin-teal text-white hover:opacity-90'}`}
          >
            {isListening ? '🎙️ 녹음 중... (클릭하여 중지)' : '🎤 녹음 시작'}
          </button>
          {transcript && (
            <div className="p-3 rounded-lg bg-admin-bg-section">
              <p className="text-xs text-text-secondary mb-1">변환 결과:</p>
              <p className="text-sm text-text-primary">{transcript}</p>
            </div>
          )}
          <div className="text-xs text-text-tertiary">
            모델: {sttModels.map((m) => m.name).join(', ')}
          </div>
        </div>

        {/* TTS */}
        <div className="p-5 rounded-xl border border-border bg-admin-bg-card space-y-4">
          <h3 className="text-sm font-bold text-text-primary">텍스트 → 음성 (TTS)</h3>
          <textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            placeholder="읽어줄 텍스트를 입력하세요..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-admin-bg-card text-text-primary resize-none"
            rows={3}
          />
          <button
            onClick={handleTTS}
            disabled={!ttsText.trim()}
            className="w-full py-2 rounded-lg bg-admin-bg-section text-text-primary text-sm hover:bg-bg-hover disabled:opacity-50"
          >
            🔊 읽기
          </button>
          <div className="text-xs text-text-tertiary">
            모델: {ttsModels.map((m) => m.name).join(', ')}
          </div>
        </div>
      </div>

      {/* Meeting Summary */}
      <div className="p-5 rounded-xl border border-border bg-admin-bg-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">회의 요약</h3>
          <button
            onClick={handleSummarize}
            className="px-4 py-2 text-xs rounded-lg bg-admin-teal text-white"
          >
            데모 회의 요약
          </button>
        </div>

        {summary && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-admin-bg-section">
              <p className="text-xs text-text-secondary mb-1">요약</p>
              <p className="text-sm text-text-primary">{summary.summary}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary mb-1">액션 아이템</p>
              {summary.actionItems.map((item, i) => (
                <p key={i} className="text-xs text-text-secondary">
                  • {item}
                </p>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-text-primary mb-1">주요 결정</p>
              {summary.keyDecisions.map((d, i) => (
                <p key={i} className="text-xs text-text-secondary">
                  ✓ {d}
                </p>
              ))}
            </div>
            <p className="text-[10px] text-text-tertiary">
              참석자: {summary.participants.join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
