"use client";

import { useState } from "react";
import { HeroBanner, TabFilter, DownloadItem, Footer } from "@hchat/ui/hmg";

function handleDownload(title: string, format: string) {
  const filename = `${title.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
  alert(`${filename} 다운로드를 준비합니다.\n\n실제 서비스에서는 서버에서 파일을 생성하여 다운로드합니다.`);
}

export default function PublicationsPage() {
  const [activeTab, setActiveTab] = useState("전체");

  const tabs = ["전체", "가이드", "릴리즈 노트", "기술 문서"];

  const guideItems = [
    {
      title: "H Chat 시작 가이드",
      category: "가이드",
      buttons: [
        { label: "PDF", onClick: () => handleDownload("H_Chat_시작_가이드", "pdf") },
        { label: "Markdown", onClick: () => handleDownload("H_Chat_시작_가이드", "md") },
      ],
    },
    {
      title: "멀티 AI 활용법",
      category: "가이드",
      buttons: [
        { label: "PDF", onClick: () => handleDownload("멀티_AI_활용법", "pdf") },
        { label: "Markdown", onClick: () => handleDownload("멀티_AI_활용법", "md") },
      ],
    },
    {
      title: "고급 기능 가이드",
      category: "가이드",
      buttons: [
        { label: "PDF", onClick: () => handleDownload("고급_기능_가이드", "pdf") },
        { label: "Markdown", onClick: () => handleDownload("고급_기능_가이드", "md") },
      ],
    },
  ];

  const releaseItems = [
    {
      title: "v3.0.0 릴리즈 노트",
      category: "릴리즈 노트",
      buttons: [
        { label: "PDF", onClick: () => handleDownload("v3.0.0_릴리즈_노트", "pdf") },
        { label: "Markdown", onClick: () => handleDownload("v3.0.0_릴리즈_노트", "md") },
      ],
    },
    {
      title: "v2.5.0 릴리즈 노트",
      category: "릴리즈 노트",
      buttons: [
        { label: "PDF", onClick: () => handleDownload("v2.5.0_릴리즈_노트", "pdf") },
        { label: "Markdown", onClick: () => handleDownload("v2.5.0_릴리즈_노트", "md") },
      ],
    },
    {
      title: "v2.4.0 릴리즈 노트",
      category: "릴리즈 노트",
      buttons: [
        { label: "PDF", onClick: () => handleDownload("v2.4.0_릴리즈_노트", "pdf") },
        { label: "Markdown", onClick: () => handleDownload("v2.4.0_릴리즈_노트", "md") },
      ],
    },
  ];

  const techItems = [
    {
      title: "H Chat API 레퍼런스",
      category: "기술 문서",
      buttons: [
        { label: "PDF", onClick: () => handleDownload("H_Chat_API_레퍼런스", "pdf") },
        { label: "Markdown", onClick: () => handleDownload("H_Chat_API_레퍼런스", "md") },
      ],
    },
    {
      title: "프롬프트 엔지니어링 가이드",
      category: "기술 문서",
      buttons: [
        { label: "PDF", onClick: () => handleDownload("프롬프트_엔지니어링_가이드", "pdf") },
        { label: "Markdown", onClick: () => handleDownload("프롬프트_엔지니어링_가이드", "md") },
      ],
    },
  ];

  const allItems = [...guideItems, ...releaseItems, ...techItems];
  const filteredGuides = activeTab === "전체" || activeTab === "가이드" ? guideItems : [];
  const filteredReleases = activeTab === "전체" || activeTab === "릴리즈 노트" ? releaseItems : [];
  const filteredTech = activeTab === "전체" || activeTab === "기술 문서" ? techItems : [];

  return (
    <>
      <HeroBanner
        title="H Chat 발행물"
        description="최신 가이드와 릴리즈 노트를 확인하세요"
      />

      <div className="px-6 py-10 md:px-20 md:py-16">
        <TabFilter
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-12">
          {filteredGuides.length > 0 && (
            <section className="mb-16">
              <h2 className="text-hmg-text-title text-2xl md:text-[32px] font-bold mb-4">
                사용 가이드
              </h2>
              <p className="text-hmg-text-body text-base mb-8">
                H Chat 사용을 위한 완벽한 가이드 문서입니다
              </p>
              <div className="flex flex-col gap-3">
                {filteredGuides.map((item, index) => (
                  <DownloadItem
                    key={index}
                    title={item.title}
                    buttons={item.buttons}
                  />
                ))}
              </div>
            </section>
          )}

          {filteredReleases.length > 0 && (
            <section className="mb-16">
              <h2 className="text-hmg-text-title text-2xl md:text-[32px] font-bold mb-4">
                릴리즈 노트
              </h2>
              <p className="text-hmg-text-body text-base mb-8">
                H Chat의 최신 업데이트 내역을 확인하세요
              </p>
              <div className="flex flex-col gap-3">
                {filteredReleases.map((item, index) => (
                  <DownloadItem
                    key={index}
                    title={item.title}
                    buttons={item.buttons}
                  />
                ))}
              </div>
            </section>
          )}

          {filteredTech.length > 0 && (
            <section className="mb-16">
              <h2 className="text-hmg-text-title text-2xl md:text-[32px] font-bold mb-4">
                기술 문서
              </h2>
              <p className="text-hmg-text-body text-base mb-8">
                개발자를 위한 기술 참고 문서입니다
              </p>
              <div className="flex flex-col gap-3">
                {filteredTech.map((item, index) => (
                  <DownloadItem
                    key={index}
                    title={item.title}
                    buttons={item.buttons}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
