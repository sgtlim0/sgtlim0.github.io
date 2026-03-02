import { HeroBanner, Footer } from "@hchat/ui/hmg";
import { Bot, MessageSquare, Youtube, FileText, Search, PenTool } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: Bot,
      title: "멀티 AI 프로바이더",
      description: "ChatGPT, Claude, Gemini 등 다양한 AI 모델을 하나의 플랫폼에서 활용하세요",
    },
    {
      icon: MessageSquare,
      title: "크로스 모델 토론",
      description: "여러 AI 모델이 하나의 주제에 대해 토론하고 최적의 답변을 도출합니다",
    },
    {
      icon: Youtube,
      title: "YouTube 분석",
      description: "YouTube 영상의 핵심 내용을 자동으로 요약하고 분석합니다",
    },
    {
      icon: FileText,
      title: "PDF 채팅",
      description: "PDF 문서를 업로드하고 AI와 대화하며 핵심 정보를 추출하세요",
    },
    {
      icon: Search,
      title: "검색 AI 카드",
      description: "AI 기반 검색으로 필요한 정보를 빠르고 정확하게 찾으세요",
    },
    {
      icon: PenTool,
      title: "글쓰기 어시스턴트",
      description: "보고서, 이메일, 기획서 등 다양한 문서 작성을 AI가 도와드립니다",
    },
  ];

  return (
    <>
      <HeroBanner
        title="H Chat 사용 가이드"
        description="멀티 AI 어시스턴트의 모든 기능을 확인하세요"
      />

      <div style={{ padding: "60px 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-hmg-bg-card border border-hmg-border"
                style={{
                  borderRadius: "10px",
                  padding: "32px",
                  height: "240px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <Icon className="text-hmg-teal" size={32} />
                <h3
                  className="text-hmg-text-title"
                  style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-hmg-text-body"
                  style={{ fontSize: "14px", lineHeight: "1.6", margin: 0 }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </>
  );
}
