'use client';

import { useState } from 'react';
import { LRNavbar, mockModels, type LLMModel } from '@hchat/ui/llm-router';
import { Play, RotateCcw, Clock, Coins, Cpu } from 'lucide-react';

export default function PlaygroundPage() {
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(mockModels[0]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [topP, setTopP] = useState(1);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    tokens: 0,
    responseTime: 0,
    estimatedCost: 0,
  });

  const handleReset = () => {
    setSystemPrompt('');
    setUserMessage('');
    setTemperature(0.7);
    setMaxTokens(1024);
    setTopP(1);
    setResponse('');
    setStats({ tokens: 0, responseTime: 0, estimatedCost: 0 });
  };

  const handleExecute = async () => {
    if (!selectedModel || !userMessage.trim()) return;

    setIsLoading(true);
    setResponse('');

    const startTime = Date.now();

    setTimeout(() => {
      const mockResponse = `안녕하세요! "${userMessage}"에 대한 응답입니다.\n\n${selectedModel.name} 모델을 사용하여 답변을 생성했습니다. 이는 시뮬레이션된 응답이며, 실제 API 연결 시 실제 모델의 응답이 표시됩니다.\n\n현재 설정:\n- Temperature: ${temperature}\n- Max Tokens: ${maxTokens}\n- Top P: ${topP}\n${systemPrompt ? `- System Prompt: ${systemPrompt}` : ''}`;

      const responseTime = Date.now() - startTime;
      const inputTokens = Math.ceil((systemPrompt.length + userMessage.length) / 4);
      const outputTokens = Math.ceil(mockResponse.length / 4);
      const totalTokens = inputTokens + outputTokens;
      const estimatedCost =
        (inputTokens / 1000000) * selectedModel.inputPrice +
        (outputTokens / 1000000) * selectedModel.outputPrice;

      setResponse(mockResponse);
      setStats({
        tokens: totalTokens,
        responseTime,
        estimatedCost: Math.round(estimatedCost * 100) / 100,
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-lr-bg">
      <LRNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-lr-text-primary mb-8">
          모델 Playground
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-3 space-y-6">
            {/* Model Selector */}
            <div>
              <label className="block text-sm font-medium text-lr-text-primary mb-2">
                모델 선택
              </label>
              <select
                value={selectedModel?.id || ''}
                onChange={(e) => {
                  const model = mockModels.find((m) => m.id === e.target.value);
                  setSelectedModel(model || null);
                }}
                className="w-full px-4 py-2 bg-lr-bg border border-lr-border rounded-lg text-lr-text-primary focus:outline-none focus:ring-2 focus:ring-lr-primary"
              >
                {mockModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.provider}
                  </option>
                ))}
              </select>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-lr-text-primary mb-2">
                시스템 프롬프트
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="시스템 프롬프트를 입력하세요"
                className="w-full h-24 px-4 py-2 bg-lr-bg border border-lr-border rounded-lg text-lr-text-primary placeholder:text-lr-text-muted focus:outline-none focus:ring-2 focus:ring-lr-primary resize-none"
              />
            </div>

            {/* User Message */}
            <div>
              <label className="block text-sm font-medium text-lr-text-primary mb-2">
                사용자 메시지
              </label>
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="w-full h-32 px-4 py-2 bg-lr-bg border border-lr-border rounded-lg text-lr-text-primary placeholder:text-lr-text-muted focus:outline-none focus:ring-2 focus:ring-lr-primary resize-none"
              />
            </div>

            {/* Parameters */}
            <div className="space-y-4 p-4 bg-lr-bg-section rounded-lg border border-lr-border">
              <h3 className="font-medium text-lr-text-primary">파라미터</h3>

              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-lr-text-secondary">
                    Temperature
                  </label>
                  <span className="text-sm font-mono text-lr-text-primary">
                    {temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-lr-text-secondary">
                    Max Tokens
                  </label>
                  <span className="text-sm font-mono text-lr-text-primary">
                    {maxTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="4096"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Top P */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-lr-text-secondary">Top P</label>
                  <span className="text-sm font-mono text-lr-text-primary">
                    {topP}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleExecute}
                disabled={isLoading || !userMessage.trim()}
                className="flex-1 px-6 py-3 bg-lr-primary text-white rounded-lg hover:bg-lr-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                {isLoading ? '실행 중...' : '실행'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-lr-bg-section text-lr-text-primary border border-lr-border rounded-lg hover:bg-lr-border transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                초기화
              </button>
            </div>
          </div>

          {/* Right Panel - Response */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-full min-h-[500px] flex flex-col">
              <h3 className="text-lg font-medium text-lr-text-primary mb-4">
                응답
              </h3>
              <div className="flex-1 p-4 bg-lr-bg-section border border-lr-border rounded-lg overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse text-lr-text-muted">
                      응답 생성 중...
                    </div>
                  </div>
                ) : response ? (
                  <pre className="whitespace-pre-wrap text-sm text-lr-text-primary font-sans">
                    {response}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-lr-text-muted">
                    실행 버튼을 클릭하여 응답을 생성하세요
                  </div>
                )}
              </div>

              {/* Stats */}
              {response && (
                <div className="mt-4 p-4 bg-lr-bg-section border border-lr-border rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-lr-text-secondary">
                      <Cpu className="w-4 h-4" />
                      <span>토큰 사용량</span>
                    </div>
                    <span className="font-mono text-lr-text-primary">
                      {stats.tokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-lr-text-secondary">
                      <Clock className="w-4 h-4" />
                      <span>응답 시간</span>
                    </div>
                    <span className="font-mono text-lr-text-primary">
                      {stats.responseTime}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-lr-text-secondary">
                      <Coins className="w-4 h-4" />
                      <span>예상 비용</span>
                    </div>
                    <span className="font-mono text-lr-text-primary">
                      ₩{stats.estimatedCost}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
