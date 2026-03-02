'use client';

export interface SSEStream {
  subscribe(
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ): void;
  abort(): void;
}

const mockResponses = {
  chat: [
    '안녕하세요! 무엇을 도와드릴까요? 궁금하신 내용이나 필요하신 정보를 말씀해주시면 최선을 다해 답변드리겠습니다.',
    '네, 이해했습니다. 해당 내용에 대해 설명드리겠습니다. 먼저 핵심 요점부터 말씀드리면, 이 주제는 여러 측면에서 고려해볼 수 있습니다.',
    '좋은 질문입니다! 이 문제는 실제로 많은 분들이 궁금해하시는 부분인데요, 제가 단계별로 상세히 설명드리겠습니다.',
  ],
  work: [
    '업무 관련 요청을 검토했습니다. 효율적인 처리를 위해 다음과 같이 진행하는 것을 추천드립니다. 먼저 우선순위를 정하고, 각 단계별로 체크리스트를 작성하시면 좋을 것 같습니다.',
    '해당 업무를 분석한 결과, 세 가지 핵심 포인트를 발견했습니다. 첫째, 명확한 목표 설정이 중요합니다. 둘째, 관련 부서와의 협업이 필요합니다. 셋째, 일정 관리가 필수적입니다.',
  ],
  translation: [
    '번역을 시작하겠습니다. 원문의 의미와 뉘앙스를 최대한 살려서 자연스럽게 번역해드리겠습니다. 전문 용어는 해당 분야의 표준 번역을 적용하겠습니다.',
    '번역 요청하신 내용을 확인했습니다. 문맥을 고려하여 가장 적절한 표현으로 번역하겠습니다. 필요하신 경우 추가 설명도 함께 제공해드리겠습니다.',
  ],
  summary: [
    '요약을 시작하겠습니다. 제공하신 내용의 핵심 포인트는 다음과 같습니다. 주요 내용을 간결하면서도 명확하게 정리해드리겠습니다.',
    '문서 내용을 분석한 결과, 다음 세 가지가 핵심 메시지입니다. 각 항목별로 중요도에 따라 구조화하여 요약해드리겠습니다.',
  ],
};

function getRandomResponse(assistantId: string): string {
  const responses = mockResponses.chat;
  return responses[Math.floor(Math.random() * responses.length)];
}

function splitIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  const words = text.split(' ');

  for (const word of words) {
    if (word.length > 3 && Math.random() > 0.7) {
      const mid = Math.floor(word.length / 2);
      chunks.push(word.slice(0, mid));
      chunks.push(word.slice(mid) + ' ');
    } else {
      chunks.push(word + ' ');
    }
  }

  return chunks;
}

export function streamResponse(prompt: string, assistantId: string): SSEStream {
  let aborted = false;
  let timeoutIds: NodeJS.Timeout[] = [];

  const abort = () => {
    aborted = true;
    timeoutIds.forEach(id => clearTimeout(id));
    timeoutIds = [];
  };

  const subscribe = (
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ) => {
    try {
      const responseText = getRandomResponse(assistantId);
      const chunks = splitIntoChunks(responseText);

      chunks.forEach((chunk, index) => {
        const timeoutId = setTimeout(() => {
          if (!aborted) {
            onChunk(chunk);

            if (index === chunks.length - 1) {
              onDone();
            }
          }
        }, index * 50 + Math.random() * 30);

        timeoutIds.push(timeoutId);
      });
    } catch (error) {
      if (!aborted) {
        onError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다'));
      }
    }
  };

  return {
    subscribe,
    abort,
  };
}
