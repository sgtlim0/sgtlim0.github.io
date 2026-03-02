"use client";

import { useState } from "react";
import { HeroBanner, TabFilter, DownloadItem, Footer } from "@hchat/ui/hmg";

export default function PublicationsPage() {
  const [activeTab, setActiveTab] = useState("전체");

  const tabs = ["전체", "가이드", "릴리즈 노트", "기술 문서"];

  const guideItems = [
    { title: "H Chat 시작 가이드", buttons: [{ label: "PDF" }, { label: "Markdown" }] },
    { title: "멀티 AI 활용법", buttons: [{ label: "PDF" }, { label: "Markdown" }] },
    { title: "고급 기능 가이드", buttons: [{ label: "PDF" }, { label: "Markdown" }] },
  ];

  const releaseItems = [
    { title: "v3.0.0 릴리즈 노트", buttons: [{ label: "PDF" }, { label: "Markdown" }] },
    { title: "v2.5.0 릴리즈 노트", buttons: [{ label: "PDF" }, { label: "Markdown" }] },
    { title: "v2.4.0 릴리즈 노트", buttons: [{ label: "PDF" }, { label: "Markdown" }] },
  ];

  return (
    <>
      <HeroBanner
        title="H Chat 발행물"
        description="최신 가이드와 릴리즈 노트를 확인하세요"
      />

      <div style={{ padding: "60px 80px" }}>
        <TabFilter
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div style={{ marginTop: "48px" }}>
          <section style={{ marginBottom: "64px" }}>
            <h2
              className="text-hmg-text-title"
              style={{
                fontSize: "32px",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              사용 가이드
            </h2>
            <p
              className="text-hmg-text-body"
              style={{
                fontSize: "16px",
                marginBottom: "32px",
              }}
            >
              H Chat 사용을 위한 완벽한 가이드 문서입니다
            </p>
            <div
              className="bg-hmg-bg-section"
              style={{
                width: "460px",
                height: "340px",
                borderRadius: "8px",
                marginBottom: "24px",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {guideItems.map((item, index) => (
                <DownloadItem
                  key={index}
                  title={item.title}
                  buttons={item.buttons}
                />
              ))}
            </div>
          </section>

          <section>
            <h2
              className="text-hmg-text-title"
              style={{
                fontSize: "32px",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              릴리즈 노트
            </h2>
            <p
              className="text-hmg-text-body"
              style={{
                fontSize: "16px",
                marginBottom: "32px",
              }}
            >
              H Chat의 최신 업데이트 내역을 확인하세요
            </p>
            <div
              className="bg-hmg-bg-section"
              style={{
                width: "460px",
                height: "340px",
                borderRadius: "8px",
                marginBottom: "24px",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {releaseItems.map((item, index) => (
                <DownloadItem
                  key={index}
                  title={item.title}
                  buttons={item.buttons}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}
