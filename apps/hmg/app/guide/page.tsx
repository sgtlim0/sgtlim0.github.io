export const revalidate = 86400

import { HeroBanner, StepItem, Footer } from '@hchat/ui/hmg'

export default function GuidePage() {
  const steps = [
    {
      step: 1,
      title: 'H Chat 접속',
      description: '브라우저에서 H Chat 포털에 접속합니다',
    },
    {
      step: 2,
      title: '로그인',
      description: '사번과 비밀번호로 로그인합니다',
    },
    {
      step: 3,
      title: '모델 선택',
      description: '사용할 AI 모델을 선택합니다',
    },
    {
      step: 4,
      title: '질문 입력',
      description: '채팅창에 질문을 입력합니다',
    },
    {
      step: 5,
      title: '결과 확인',
      description: 'AI의 응답을 확인하고 활용합니다',
    },
  ]

  return (
    <>
      <HeroBanner
        title="H Chat 빠른 시작 가이드"
        description="설치부터 첫 대화까지 5단계로 시작하세요"
      />

      <div style={{ padding: '60px 80px' }}>
        <h2
          className="text-hmg-text-title"
          style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '12px',
          }}
        >
          시작하기
        </h2>
        <div
          className="bg-hmg-teal"
          style={{
            width: '64px',
            height: '2px',
            marginBottom: '48px',
          }}
        />

        <div style={{ display: 'flex', gap: '80px' }}>
          <div style={{ width: '420px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {steps.map((step, index) => (
                <StepItem
                  key={index}
                  step={step.step}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div
              className="bg-hmg-bg-section"
              style={{
                width: '100%',
                height: '600px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <p className="text-hmg-text-caption" style={{ fontSize: '14px' }}>
                스크린샷 영역
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
