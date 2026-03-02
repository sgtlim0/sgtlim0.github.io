# H Chat Wiki — HMG 디자인 wiki.pen 구현 방안

## 1. 개요

`docs/HMG_DESIGN_GUIDE_PLAN.md` 설계 방안을 기반으로, `wiki.pen` 파일에 HMG 스타일 화면과 컴포넌트를 **Pencil MCP 도구로 실제 구현**하는 단계별 방안입니다.

### 구현 범위

| 항목 | 수량 |
|------|------|
| 새 디자인 변수 | 18개 (HMG 공식 11 + Brand Home 7) |
| 새 재사용 컴포넌트 | 13개 |
| 새 화면 (Light + Dark) | 8개 (4 Light + 4 Dark) |

### 사전 조건

- `wiki.pen` 활성 에디터 상태
- 기존 6개 화면 + 6개 재사용 컴포넌트 보존

---

## 2. 현재 wiki.pen 상태

### 2.1 캔버스 레이아웃

```
X축 →
Y=0:    WikiHome(0,0)     DocsPage(1540,0)   WikiHome-Dark(3080,0)  DocsPage-Dark(4620,0)
Y=1000: QuickStart(0,1000)                    QuickStart-Dark(3080,1000)

컴포넌트: x=-600 (캔버스 좌측 영역)
```

| 노드 | 위치 (x, y) | 크기 (w × h) |
|------|------------|-------------|
| WikiHome | 0, 0 | 1440 × 900 |
| DocsPage | 1540, 0 | 1440 × 900 |
| QuickStartPage | 0, 1000 | 1440 × 900 |
| WikiHome-Dark | 3080, 0 | 1440 × 900 |
| DocsPage-Dark | 4620, 0 | 1440 × 900 |
| QuickStart-Dark | 3080, 1000 | 1440 × 900 |
| 컴포넌트 6개 | -600, 0~600 | 다양 |

### 2.2 기존 디자인 변수 (18개)

| 변수명 | Light | Dark | 용도 |
|--------|-------|------|------|
| `primary` | #2563EB | #3B82F6 | 강조색 |
| `bg-page` | #FFFFFF | #111827 | 페이지 배경 |
| `bg-sidebar` | #F8FAFC | #1F2937 | 사이드바 배경 |
| `bg-card` | #F8FAFC | #1F2937 | 카드 배경 |
| `bg-hero` | #EFF6FF | #1E3A5F | 히어로 배경 |
| `bg-hover` | #F1F5F9 | #374151 | 호버 배경 |
| `bg-code` | #F1F5F9 | #1F2937 | 코드 배경 |
| `text-primary` | #0F172A | #F1F5F9 | 주 텍스트 |
| `text-secondary` | #64748B | #94A3B8 | 보조 텍스트 |
| `text-tertiary` | #94A3B8 | #64748B | 3차 텍스트 |
| `text-white` | #FFFFFF | — | 흰 텍스트 |
| `border` | #E2E8F0 | #374151 | 보더 |
| `border-light` | #F1F5F9 | #1F2937 | 연한 보더 |
| `primary-light` | #EFF6FF | #1E3A5F | 연한 강조 |
| `primary-hover` | #1D4ED8 | #2563EB | 강조 호버 |
| `danger` | #EF4444 | — | 위험 |
| `success` | #22C55E | — | 성공 |
| `warning` | #F59E0B | — | 경고 |

### 2.3 기존 재사용 컴포넌트 (6개)

| ID | 이름 | 위치 |
|----|------|------|
| `pKthN` | Wiki/NavItem | -600, 0 |
| `2ITpx` | Wiki/NavGroupHeader | -600, 80 |
| `ZUwkZ` | Wiki/FeatureCard | -600, 160 |
| `iE8nD` | Wiki/Badge | -600, 500 |
| `b4345` | Wiki/Breadcrumb | -600, 550 |
| `7d4mW` | Wiki/SearchBar | -600, 600 |

---

## 3. 캔버스 배치 계획

### 3.1 HMG 화면 배치 좌표

기존 화면과 겹치지 않도록, **Y=2200** 이후에 HMG 화면을 배치합니다.

```
Y=2200 (Light):
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ HMG-Home    │ HMG-Pub     │ HMG-Step    │ HMG-Dash    │
│ (0, 2200)   │ (1540, 2200)│ (3080, 2200)│ (4620, 2200)│
│ 1440×1200   │ 1440×1400   │ 1440×1200   │ 1440×900    │
└─────────────┴─────────────┴─────────────┴─────────────┘

Y=3600 (Dark):
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ HMG-Home    │ HMG-Pub     │ HMG-Step    │ HMG-Dash    │
│ (0, 3600)   │ (1540, 3600)│ (3080, 3600)│ (4620, 3600)│
│  Dark       │  Dark       │  Dark       │  Dark       │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### 3.2 HMG 컴포넌트 배치 좌표

기존 컴포넌트 영역(x=-600, y=0~600) 아래에 배치합니다.

```
x=-600, y=800~ :  HMG 컴포넌트 13개
  y=800:   HMG/PillButton (2가지 크기)
  y=920:   HMG/GNBItem
  y=980:   HMG/GNB
  y=1100:  HMG/HeroBanner
  y=1440:  HMG/TabFilter
  y=1540:  HMG/DownloadItem
  y=1620:  HMG/PublicationCard
  y=1920:  HMG/Footer
  y=2200:  HMG/StepNumber
  y=2260:  HMG/StepItem
  y=2420:  HMG/StepGuideSection
  y=2820:  HMG/StatCard
  y=2980:  HMG/CoverPage
```

---

## 4. Phase 1: 디자인 변수 등록

### 4.1 `set_variables` 호출

기존 18개 변수를 보존하면서 HMG 전용 18개 변수를 **merge** 모드로 추가합니다.

```json
{
  "filePath": "wiki.pen",
  "variables": {
    "hmg-navy":          { "type": "color", "value": "#002C5F" },
    "hmg-accent":        { "type": "color", "value": "#E15C39" },
    "hmg-blue":          { "type": "color", "value": "#3A5BC5" },
    "hmg-green":         { "type": "color", "value": "#118762" },
    "hmg-teal":          { "type": "color", "value": "#00B4D8" },
    "hmg-cover-bg":      { "type": "color", "value": "#D5CEBF" },
    "hmg-reject":        { "type": "color", "value": "#E53935" },
    "hmg-approve":       { "type": "color", "value": "#4CAF50" },
    "hmg-bg-section": {
      "type": "color",
      "value": [
        { "theme": { "mode": "light" }, "value": "#F5F5F5" },
        { "theme": { "mode": "dark" },  "value": "#1A1A1A" }
      ]
    },
    "hmg-bg-card": {
      "type": "color",
      "value": [
        { "theme": { "mode": "light" }, "value": "#FFFFFF" },
        { "theme": { "mode": "dark" },  "value": "#2A2A2A" }
      ]
    },
    "hmg-text-title": {
      "type": "color",
      "value": [
        { "theme": { "mode": "light" }, "value": "#000000" },
        { "theme": { "mode": "dark" },  "value": "#F1F1F1" }
      ]
    },
    "hmg-text-body": {
      "type": "color",
      "value": [
        { "theme": { "mode": "light" }, "value": "#111111" },
        { "theme": { "mode": "dark" },  "value": "#E0E0E0" }
      ]
    },
    "hmg-text-caption": {
      "type": "color",
      "value": [
        { "theme": { "mode": "light" }, "value": "#949494" },
        { "theme": { "mode": "dark" },  "value": "#666666" }
      ]
    },
    "hmg-border": {
      "type": "color",
      "value": [
        { "theme": { "mode": "light" }, "value": "#EAEAEA" },
        { "theme": { "mode": "dark" },  "value": "#333333" }
      ]
    },
    "hmg-footer-bg": {
      "type": "color",
      "value": [
        { "theme": { "mode": "light" }, "value": "#1F1F1F" },
        { "theme": { "mode": "dark" },  "value": "#0A0A0A" }
      ]
    },
    "hmg-teal-light": {
      "type": "color",
      "value": [
        { "theme": { "mode": "light" }, "value": "#E0F7FA" },
        { "theme": { "mode": "dark" },  "value": "#004D5A" }
      ]
    },
    "hmg-input-bg": {
      "type": "color",
      "value": [
        { "theme": { "mode": "light" }, "value": "#F5F5F5" },
        { "theme": { "mode": "dark" },  "value": "#2A2A2A" }
      ]
    },
    "hmg-input-border": {
      "type": "color",
      "value": [
        { "theme": { "mode": "light" }, "value": "#E0E0E0" },
        { "theme": { "mode": "dark" },  "value": "#444444" }
      ]
    }
  }
}
```

### 4.2 변수 검증

등록 후 `get_variables` 호출로 총 36개 변수(기존 18 + HMG 18) 확인.

---

## 5. Phase 2: 재사용 컴포넌트 생성 (13개)

### 5.1 생성 순서 (의존성 기반)

```
Level 0 (의존 없음):
  1. HMG/PillButton
  2. HMG/GNBItem
  3. HMG/StepNumber
  4. HMG/StatCard
  5. HMG/DownloadItem

Level 1 (Level 0 참조):
  6. HMG/GNB          ← GNBItem 사용
  7. HMG/StepItem      ← StepNumber 사용
  8. HMG/TabFilter     ← 독립 (PillButton과 유사하지만 별도)

Level 2 (Level 1 참조):
  9. HMG/HeroBanner    ← 독립
  10. HMG/PublicationCard ← DownloadItem 사용
  11. HMG/StepGuideSection ← StepItem 사용
  12. HMG/CoverPage     ← 독립
  13. HMG/Footer        ← 독립
```

### 5.2 컴포넌트 상세 — `batch_design` 명세

#### 5.2.1 `HMG/PillButton`

```javascript
// batch_design call 1: PillButton 컴포넌트
btn=I(document, {
  type: "frame", name: "HMG/PillButton", reusable: true,
  x: -600, y: 800,
  layout: "horizontal", justifyContent: "center", alignItems: "center",
  width: "fit_content", height: 60,
  padding: [0, 30], cornerRadius: 30,
  fill: "$hmg-bg-card",
  stroke: { align: "inside", thickness: 1, fill: "$hmg-border" },
  placeholder: true
})
btnLabel=I(btn, {
  type: "text", name: "label",
  content: "더보기", fill: "$hmg-text-body",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 20, fontWeight: "500"
})
U(btn, { placeholder: false })
```

**변형 (인스턴스에서 override)**:
- `black`: fill="#333333", stroke 없음, 텍스트 fill="#FFFFFF"
- `line`: fill="transparent", stroke 1px #333
- `small`: height=36, padding=[0,16], cornerRadius=18, fontSize=14

#### 5.2.2 `HMG/GNBItem`

```javascript
gnbItem=I(document, {
  type: "frame", name: "HMG/GNBItem", reusable: true,
  x: -600, y: 920,
  layout: "horizontal", alignItems: "center",
  width: "fit_content", height: 80,
  placeholder: true
})
gnbLabel=I(gnbItem, {
  type: "text", name: "label",
  content: "메뉴",
  fill: "#333333",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 17, fontWeight: "500"
})
U(gnbItem, { placeholder: false })
```

#### 5.2.3 `HMG/StepNumber`

```javascript
stepNum=I(document, {
  type: "frame", name: "HMG/StepNumber", reusable: true,
  x: -600, y: 2200,
  layout: "horizontal", justifyContent: "center", alignItems: "center",
  width: 28, height: 28,
  cornerRadius: 14,
  fill: "$hmg-teal",
  placeholder: true
})
stepNumText=I(stepNum, {
  type: "text", name: "number",
  content: "1", fill: "#FFFFFF",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 14, fontWeight: "600"
})
U(stepNum, { placeholder: false })
```

#### 5.2.4 `HMG/StatCard`

```javascript
statCard=I(document, {
  type: "frame", name: "HMG/StatCard", reusable: true,
  x: -600, y: 2820,
  layout: "vertical", justifyContent: "center", alignItems: "center",
  width: 200, height: 120, gap: 8,
  cornerRadius: 8, fill: "$hmg-bg-section",
  padding: 20,
  placeholder: true
})
statLabel=I(statCard, {
  type: "text", name: "label",
  content: "AI 채팅", fill: "$hmg-text-caption",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 13, fontWeight: "400",
  textAlign: "center"
})
statValue=I(statCard, {
  type: "text", name: "value",
  content: "128", fill: "$hmg-text-title",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 32, fontWeight: "700",
  textAlign: "center"
})
U(statCard, { placeholder: false })
```

#### 5.2.5 `HMG/DownloadItem`

```javascript
dlItem=I(document, {
  type: "frame", name: "HMG/DownloadItem", reusable: true,
  x: -600, y: 1540,
  layout: "horizontal", justifyContent: "space_between", alignItems: "center",
  width: 600, height: "fit_content",
  padding: [20, 0],
  stroke: { align: "inside", thickness: { bottom: 1 }, fill: "$hmg-border" },
  placeholder: true
})
dlTitle=I(dlItem, {
  type: "text", name: "title",
  content: "빠른 시작 가이드", fill: "$hmg-text-body",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 17, fontWeight: "400"
})
dlBtnGroup=I(dlItem, {
  type: "frame", name: "buttons",
  layout: "horizontal", gap: 8,
  width: "fit_content", height: "fit_content"
})
dlBtn=I(dlBtnGroup, {
  type: "ref", ref: "<<PillButton ID>>",
  height: 36, padding: [0, 16], cornerRadius: 18
})
// PillButton 인스턴스의 label 텍스트를 "KO"로 override
U(dlBtn+"/<<label ID>>", { content: "KO", fontSize: 14 })
U(dlItem, { placeholder: false })
```

> **참고**: `<<PillButton ID>>`는 Phase 2 Step 1에서 생성된 실제 ID로 대체합니다. 이하 동일.

#### 5.2.6 `HMG/GNB` (GNBItem 참조)

```javascript
gnb=I(document, {
  type: "frame", name: "HMG/GNB", reusable: true,
  x: -600, y: 980,
  layout: "horizontal", alignItems: "center", justifyContent: "space_between",
  width: 1440, height: 80,
  padding: [0, 80],
  fill: "$hmg-bg-card",
  stroke: { align: "inside", thickness: { bottom: 1 }, fill: "$hmg-border" },
  placeholder: true
})

// 좌측 로고
gnbLogo=I(gnb, {
  type: "text", name: "logo",
  content: "현대자동차그룹", fill: "$hmg-navy",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 17, fontWeight: "700"
})

// 중앙 메뉴 그룹
gnbMenu=I(gnb, {
  type: "frame", name: "menu",
  layout: "horizontal", gap: 40, alignItems: "center",
  width: "fit_content", height: 80
})
gnbM1=I(gnbMenu, { type: "ref", ref: "<<GNBItem ID>>" })
U(gnbM1+"/<<label>>", { content: "회사소개" })
gnbM2=I(gnbMenu, { type: "ref", ref: "<<GNBItem ID>>" })
U(gnbM2+"/<<label>>", { content: "사업영역" })
gnbM3=I(gnbMenu, { type: "ref", ref: "<<GNBItem ID>>" })
U(gnbM3+"/<<label>>", { content: "기술혁신" })
gnbM4=I(gnbMenu, { type: "ref", ref: "<<GNBItem ID>>" })
U(gnbM4+"/<<label>>", { content: "지속가능경영" })

// 우측 유틸리티
gnbUtil=I(gnb, {
  type: "frame", name: "utils",
  layout: "horizontal", gap: 16, alignItems: "center",
  width: "fit_content", height: "fit_content"
})
gnbSearch=I(gnbUtil, {
  type: "icon_font", iconFontName: "search", iconFontFamily: "lucide",
  width: 20, height: 20, fill: "$hmg-text-caption"
})
gnbLang=I(gnbUtil, {
  type: "text", content: "KO",
  fill: "$hmg-text-caption",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 14, fontWeight: "400"
})

U(gnb, { placeholder: false })
```

#### 5.2.7 `HMG/HeroBanner`

```javascript
hero=I(document, {
  type: "frame", name: "HMG/HeroBanner", reusable: true,
  x: -600, y: 1100,
  layout: "vertical", justifyContent: "center", alignItems: "center",
  width: 1440, height: 300, gap: 20,
  fill: "$hmg-bg-section",
  padding: 80,
  placeholder: true
})
heroTitle=I(hero, {
  type: "text", name: "title",
  content: "발행물", fill: "$hmg-text-title",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 40, fontWeight: "700",
  textAlign: "center"
})
heroDesc=I(hero, {
  type: "text", name: "description",
  content: "현대자동차그룹의 다양한 발행물을 확인하실 수 있습니다.",
  fill: "$hmg-text-body",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 17, fontWeight: "400",
  textAlign: "center"
})
U(hero, { placeholder: false })
```

#### 5.2.8 `HMG/TabFilter`

```javascript
tabFilter=I(document, {
  type: "frame", name: "HMG/TabFilter", reusable: true,
  x: -600, y: 1440,
  layout: "horizontal", alignItems: "center", gap: 40,
  width: 1440, height: 60,
  padding: [0, 80],
  stroke: { align: "inside", thickness: { bottom: 1 }, fill: "$hmg-border" },
  placeholder: true
})
// 활성 탭
tabActive=I(tabFilter, {
  type: "frame", name: "active-tab",
  layout: "vertical", justifyContent: "center", alignItems: "center",
  width: "fit_content", height: 60,
  stroke: { align: "inside", thickness: { bottom: 2 }, fill: "#000000" }
})
tabActiveLabel=I(tabActive, {
  type: "text", name: "label",
  content: "전체", fill: "$hmg-text-title",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 17, fontWeight: "500"
})
// 비활성 탭들
tab2=I(tabFilter, {
  type: "text", name: "tab2",
  content: "가이드", fill: "$hmg-text-caption",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 17, fontWeight: "400"
})
tab3=I(tabFilter, {
  type: "text", name: "tab3",
  content: "릴리즈 노트", fill: "$hmg-text-caption",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 17, fontWeight: "400"
})
tab4=I(tabFilter, {
  type: "text", name: "tab4",
  content: "기술 문서", fill: "$hmg-text-caption",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 17, fontWeight: "400"
})
U(tabFilter, { placeholder: false })
```

#### 5.2.9 `HMG/StepItem` (StepNumber 참조)

```javascript
stepItem=I(document, {
  type: "frame", name: "HMG/StepItem", reusable: true,
  x: -600, y: 2260,
  layout: "vertical", gap: 4,
  width: 300, height: "fit_content",
  placeholder: true
})
// 상단: 번호 + 제목 (가로)
stepItemRow=I(stepItem, {
  type: "frame", name: "header",
  layout: "horizontal", gap: 12, alignItems: "center",
  width: "fill_container", height: "fit_content"
})
stepItemNum=I(stepItemRow, { type: "ref", ref: "<<StepNumber ID>>" })
stepItemTitle=I(stepItemRow, {
  type: "text", name: "title",
  content: "스텝 제목", fill: "#333333",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 16, fontWeight: "600"
})
// 설명
stepItemDesc=I(stepItem, {
  type: "text", name: "description",
  content: "스텝 설명 텍스트가 여기에 들어갑니다.",
  fill: "#666666",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 14, fontWeight: "400",
  textGrowth: "fixed-width", width: 260,
  padding: [0, 0, 0, 40]
})
// 하단 화살표
stepItemArrow=I(stepItem, {
  type: "text", name: "arrow",
  content: "↓", fill: "$hmg-teal",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 16, fontWeight: "400",
  padding: [0, 0, 0, 12]
})
U(stepItem, { placeholder: false })
```

#### 5.2.10 `HMG/PublicationCard` (DownloadItem 참조)

```javascript
pubCard=I(document, {
  type: "frame", name: "HMG/PublicationCard", reusable: true,
  x: -600, y: 1620,
  layout: "vertical", gap: 40,
  width: 1280, height: "fit_content",
  padding: [60, 80],
  placeholder: true
})
// 섹션 제목
pubTitle=I(pubCard, {
  type: "text", name: "sectionTitle",
  content: "사용 가이드", fill: "$hmg-text-title",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 32, fontWeight: "700"
})
pubDesc=I(pubCard, {
  type: "text", name: "sectionDesc",
  content: "H Chat의 주요 기능별 상세 가이드", fill: "$hmg-text-body",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 17, fontWeight: "400"
})
// 콘텐츠 2컬럼
pubContent=I(pubCard, {
  type: "frame", name: "content",
  layout: "horizontal", gap: 40,
  width: "fill_container", height: "fit_content"
})
// 좌: 이미지 영역
pubImg=I(pubContent, {
  type: "frame", name: "image",
  width: 500, height: 360,
  cornerRadius: 10, fill: "$hmg-bg-section",
  clip: true
})
// 우: 다운로드 리스트
pubList=I(pubContent, {
  type: "frame", name: "list",
  layout: "vertical",
  width: "fill_container", height: "fit_content"
})
// DownloadItem 인스턴스 3개
dl1=I(pubList, { type: "ref", ref: "<<DownloadItem ID>>", width: "fill_container" })
U(dl1+"/<<title>>", { content: "빠른 시작 가이드" })
dl2=I(pubList, { type: "ref", ref: "<<DownloadItem ID>>", width: "fill_container" })
U(dl2+"/<<title>>", { content: "AI 채팅 가이드" })
dl3=I(pubList, { type: "ref", ref: "<<DownloadItem ID>>", width: "fill_container" })
U(dl3+"/<<title>>", { content: "그룹 채팅 가이드" })

U(pubCard, { placeholder: false })
```

#### 5.2.11 `HMG/StepGuideSection` (StepItem 참조)

```javascript
stepGuide=I(document, {
  type: "frame", name: "HMG/StepGuideSection", reusable: true,
  x: -600, y: 2420,
  layout: "vertical", gap: 40,
  width: 1280, height: "fit_content",
  padding: [60, 80],
  placeholder: true
})
// 섹션 제목
sgTitle=I(stepGuide, {
  type: "text", name: "sectionTitle",
  content: "Access & Sign up", fill: "#333333",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 24, fontWeight: "700"
})
// 틸 구분선
sgDivider=I(stepGuide, {
  type: "rectangle", name: "divider",
  width: "fill_container", height: 2,
  fill: "$hmg-teal"
})
// 2컬럼
sgColumns=I(stepGuide, {
  type: "frame", name: "columns",
  layout: "horizontal", gap: 48,
  width: "fill_container", height: "fit_content(400)"
})
// 좌: 스텝 목록 (35%)
sgLeft=I(sgColumns, {
  type: "frame", name: "steps",
  layout: "vertical", gap: 0,
  width: 380, height: "fit_content"
})
sg1=I(sgLeft, { type: "ref", ref: "<<StepItem ID>>" })
U(sg1+"/<<header>>/<<StepNumber>>/<<number>>", { content: "1" })
U(sg1+"/<<title>>", { content: "Chrome 웹스토어 접속" })
U(sg1+"/<<description>>", { content: "Chrome 웹스토어에서 H Chat을 검색합니다." })
sg2=I(sgLeft, { type: "ref", ref: "<<StepItem ID>>" })
U(sg2+"/<<header>>/<<StepNumber>>/<<number>>", { content: "2" })
U(sg2+"/<<title>>", { content: "확장 프로그램 설치" })
U(sg2+"/<<description>>", { content: "Chrome에 추가 버튼을 클릭합니다." })
// 우: 스크린샷 영역 (65%)
sgRight=I(sgColumns, {
  type: "frame", name: "screenshot",
  width: "fill_container", height: "fill_container",
  cornerRadius: 8, fill: "$hmg-bg-section",
  padding: 24
})
sgPlaceholder=I(sgRight, {
  type: "text", content: "스크린샷 영역",
  fill: "$hmg-text-caption",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 14, textAlign: "center"
})

U(stepGuide, { placeholder: false })
```

#### 5.2.12 `HMG/CoverPage`

```javascript
cover=I(document, {
  type: "frame", name: "HMG/CoverPage", reusable: true,
  x: -600, y: 2980,
  layout: "horizontal", justifyContent: "center", alignItems: "center",
  width: 1440, height: 900,
  fill: "$hmg-cover-bg",
  placeholder: true
})
coverCard=I(cover, {
  type: "frame", name: "card",
  layout: "vertical", gap: 24, justifyContent: "center",
  width: 800, height: 500,
  cornerRadius: 16, fill: "#FFFFFF",
  padding: 60
})
coverTitle=I(coverCard, {
  type: "text", name: "title",
  content: "H Chat", fill: "#333333",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 32, fontWeight: "700"
})
coverSubtitle=I(coverCard, {
  type: "text", name: "subtitle",
  content: "사용 가이드", fill: "#666666",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 20, fontWeight: "400"
})
// 범례
coverLegend=I(coverCard, {
  type: "frame", name: "legend",
  layout: "vertical", gap: 8,
  width: "fit_content", height: "fit_content"
})
leg1=I(coverLegend, { type: "frame", layout: "horizontal", gap: 8, alignItems: "center", width: "fit_content", height: "fit_content" })
I(leg1, { type: "ellipse", width: 8, height: 8, fill: "$hmg-teal" })
I(leg1, { type: "text", content: "Decision Making", fill: "#666666", fontSize: 14, fontFamily: "SpoqaHanSansNeo, sans-serif" })
leg2=I(coverLegend, { type: "frame", layout: "horizontal", gap: 8, alignItems: "center", width: "fit_content", height: "fit_content" })
I(leg2, { type: "ellipse", width: 8, height: 8, fill: "#FF9800" })
I(leg2, { type: "text", content: "Information Sharing", fill: "#666666", fontSize: 14, fontFamily: "SpoqaHanSansNeo, sans-serif" })
leg3=I(coverLegend, { type: "frame", layout: "horizontal", gap: 8, alignItems: "center", width: "fit_content", height: "fit_content" })
I(leg3, { type: "ellipse", width: 8, height: 8, fill: "$hmg-approve" })
I(leg3, { type: "text", content: "Directions", fill: "#666666", fontSize: 14, fontFamily: "SpoqaHanSansNeo, sans-serif" })

U(cover, { placeholder: false })
```

#### 5.2.13 `HMG/Footer`

```javascript
footer=I(document, {
  type: "frame", name: "HMG/Footer", reusable: true,
  x: -600, y: 1920,
  layout: "vertical", gap: 40,
  width: 1440, height: "fit_content",
  fill: "$hmg-footer-bg",
  padding: [60, 80],
  placeholder: true
})
// 뉴스레터 영역
footerNews=I(footer, {
  type: "frame", name: "newsletter",
  layout: "horizontal", justifyContent: "space_between", alignItems: "center",
  width: "fill_container", height: "fit_content"
})
footerNewsLabel=I(footerNews, {
  type: "text", content: "뉴스레터 구독",
  fill: "#FFFFFF",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 20, fontWeight: "500"
})
// 구분선
footerDivider=I(footer, {
  type: "rectangle", width: "fill_container", height: 1,
  fill: "#333333"
})
// 그룹사 바로가기
footerBrands=I(footer, {
  type: "frame", name: "brands",
  layout: "horizontal", gap: 20,
  width: "fill_container", height: "fit_content"
})
I(footerBrands, { type: "text", content: "현대자동차", fill: "#949494", fontSize: 14, fontFamily: "SpoqaHanSansNeo, sans-serif" })
I(footerBrands, { type: "text", content: "기아", fill: "#949494", fontSize: 14, fontFamily: "SpoqaHanSansNeo, sans-serif" })
I(footerBrands, { type: "text", content: "제네시스", fill: "#949494", fontSize: 14, fontFamily: "SpoqaHanSansNeo, sans-serif" })
I(footerBrands, { type: "text", content: "현대모비스", fill: "#949494", fontSize: 14, fontFamily: "SpoqaHanSansNeo, sans-serif" })
// 하단 저작권
footerCopy=I(footer, {
  type: "text", name: "copyright",
  content: "© Hyundai Motor Group. All rights reserved.",
  fill: "#949494",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 13, fontWeight: "300"
})

U(footer, { placeholder: false })
```

---

## 6. Phase 3: Light 화면 4개 조립

### 6.1 HMG-Home (Light)

**좌표**: (0, 2200) | **크기**: 1440 × 1200

```javascript
// batch_design call: HMG-Home 프레임 생성
hmgHome=I(document, {
  type: "frame", name: "HMG-Home",
  x: 0, y: 2200,
  layout: "vertical",
  width: 1440, height: "fit_content(1200)",
  fill: "$hmg-bg-card",
  placeholder: true
})

// GNB 삽입
homeGnb=I(hmgHome, { type: "ref", ref: "<<GNB ID>>", width: "fill_container" })

// HeroBanner 삽입 (제목/설명 override)
homeHero=I(hmgHome, { type: "ref", ref: "<<HeroBanner ID>>", width: "fill_container" })
U(homeHero+"/<<title>>", { content: "H Chat 사용 가이드" })
U(homeHero+"/<<desc>>", { content: "멀티 AI 어시스턴트의 모든 기능을 확인하세요" })

// 기능 카드 그리드 (3×2)
homeGrid=I(hmgHome, {
  type: "frame", name: "card-grid",
  layout: "horizontal", gap: 24,
  width: "fill_container", height: "fit_content",
  padding: [60, 80],
  // flexWrap이 없으므로 2행은 중첩 프레임으로 구성
})
// 행 1
homeRow1=I(homeGrid, {
  type: "frame", layout: "horizontal", gap: 24,
  width: "fill_container", height: "fit_content"
})
// 카드 1: 멀티 AI
card1=I(homeRow1, {
  type: "frame", name: "card-1",
  layout: "vertical", gap: 16,
  width: "fill_container", height: 240,
  cornerRadius: 10, padding: 32,
  fill: "$hmg-bg-card",
  stroke: { align: "inside", thickness: 1, fill: "$hmg-border" },
  effect: { type: "shadow", offset: { x: 0, y: 0 }, blur: 10, color: "#0000001A" }
})
card1Icon=I(card1, {
  type: "icon_font", iconFontName: "cpu", iconFontFamily: "lucide",
  width: 40, height: 40, fill: "$hmg-navy"
})
card1Title=I(card1, {
  type: "text", content: "멀티 AI 프로바이더",
  fill: "$hmg-text-title",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 20, fontWeight: "600"
})
card1Desc=I(card1, {
  type: "text", content: "Claude, GPT, Gemini 등 7개 AI 모델",
  fill: "$hmg-text-body",
  fontFamily: "SpoqaHanSansNeo, sans-serif",
  fontSize: 14, fontWeight: "400",
  textGrowth: "fixed-width", width: "fill_container"
})
// (카드 2~6도 동일 패턴으로 반복 — 아이콘/제목/설명만 변경)
// ...

// Footer 삽입
homeFooter=I(hmgHome, { type: "ref", ref: "<<Footer ID>>", width: "fill_container" })

U(hmgHome, { placeholder: false })
```

**카드 콘텐츠 (6개)**:

| # | 아이콘 | 제목 | 설명 |
|---|--------|------|------|
| 1 | `cpu` | 멀티 AI 프로바이더 | Claude, GPT, Gemini 등 7개 AI 모델 |
| 2 | `messages-square` | 크로스 모델 토론 | AI 간 토론으로 다양한 관점 비교 |
| 3 | `circle-play` | YouTube 분석 | 영상 자동 요약 및 Q&A |
| 4 | `file-text` | PDF 채팅 | 문서 기반 AI 대화 |
| 5 | `panel-top` | 검색 AI 카드 | 검색엔진에 AI 답변 표시 |
| 6 | `pencil` | 글쓰기 어시스턴트 | AI 기반 텍스트 변환 |

### 6.2 HMG-Publications (Light)

**좌표**: (1540, 2200) | **크기**: 1440 × 1400

```
구조:
  HMG/GNB (인스턴스)
  HMG/HeroBanner (title: "H Chat 발행물")
  HMG/TabFilter (인스턴스)
  HMG/PublicationCard (섹션 1: 사용 가이드)
  HMG/PublicationCard (섹션 2: 릴리즈 노트) — 복사 후 텍스트 override
  HMG/Footer (인스턴스)
```

**구현 단계**:
1. 프레임 생성 (1540, 2200, 1440×1400, placeholder)
2. GNB 인스턴스 삽입
3. HeroBanner 인스턴스 삽입 (title: "H Chat 발행물", desc: "...")
4. TabFilter 인스턴스 삽입
5. PublicationCard 인스턴스 삽입 (섹션 1)
6. PublicationCard 복사 → 섹션 2 텍스트 override
7. Footer 인스턴스 삽입
8. 이미지 영역에 G() 호출로 커버 이미지 생성
9. placeholder 해제

### 6.3 HMG-StepGuide (Light)

**좌표**: (3080, 2200) | **크기**: 1440 × 1200

```
구조:
  HMG/GNB (인스턴스)
  HMG/HeroBanner (title: "H Chat 빠른 시작 가이드", desc: "설치부터 첫 대화까지 5단계")
  HMG/StepGuideSection (인스턴스 — 5스텝)
  HMG/Footer (인스턴스)
```

**스텝 콘텐츠**:

| # | 제목 | 설명 |
|---|------|------|
| 1 | Chrome 웹스토어 접속 | Chrome 웹스토어에서 H Chat을 검색합니다 |
| 2 | 확장 프로그램 설치 | "Chrome에 추가" 버튼을 클릭합니다 |
| 3 | API 키 설정 | Settings에서 AWS/OpenAI/Gemini API 키를 입력합니다 |
| 4 | 모델 선택 | 원하는 AI 모델을 선택합니다 |
| 5 | 첫 대화 시작 | 채팅창에 메시지를 입력하고 AI와 대화합니다 |

### 6.4 HMG-Dashboard (Light)

**좌표**: (4620, 2200) | **크기**: 1440 × 900

```
구조:
  HMG/GNB (Brand Home 변형 — 메뉴 override)
  Welcome 섹션 (텍스트)
  HMG/StatCard × 4 (가로 그리드)
  검색바 (프레임)
  CTA 버튼 2개 (PillButton 인스턴스)
  히어로 이미지 영역 (프레임 + G() 이미지)
```

**StatCard 콘텐츠**:

| # | 라벨 | 값 |
|---|------|-----|
| 1 | AI 채팅 | 128 |
| 2 | 그룹 채팅 | 42 |
| 3 | 도구 사용 | 89 |
| 4 | 북마크 | 15 |

---

## 7. Phase 4: Dark 화면 4개 생성

### 7.1 복사 전략

Light 화면을 `C()` (Copy) 연산으로 복제한 후 `theme: { mode: "dark" }` 속성을 적용합니다.

```javascript
// HMG-Home Dark
hmgHomeDark=C("<<HMG-Home ID>>", document, {
  name: "HMG-Home - Dark",
  x: 0, y: 3600,
  theme: { mode: "dark" },
  positionDirection: "bottom", positionPadding: 200
})

// HMG-Publications Dark
hmgPubDark=C("<<HMG-Pub ID>>", document, {
  name: "HMG-Publications - Dark",
  x: 1540, y: 3600,
  theme: { mode: "dark" }
})

// HMG-StepGuide Dark
hmgStepDark=C("<<HMG-Step ID>>", document, {
  name: "HMG-StepGuide - Dark",
  x: 3080, y: 3600,
  theme: { mode: "dark" }
})

// HMG-Dashboard Dark
hmgDashDark=C("<<HMG-Dash ID>>", document, {
  name: "HMG-Dashboard - Dark",
  x: 4620, y: 3600,
  theme: { mode: "dark" }
})
```

### 7.2 다크 모드 수정 사항

복사 후 테마 변수(`$hmg-*`)가 자동으로 Dark 값으로 전환됩니다. 다만 하드코딩된 색상은 수동 조정이 필요합니다:

| 항목 | Light 하드코딩 | Dark 수정 |
|------|--------------|----------|
| 카드 그림자 | `#0000001A` | `#00000066` |
| GNB 로고 | `$hmg-navy` (#002C5F) | `#5B8FD4` (밝은 네이비) |
| StepItem 제목 | `#333333` | `#E0E0E0` |
| StepItem 설명 | `#666666` | `#999999` |
| CoverPage 카드 | `#FFFFFF` | `#2A2A2A` |
| CoverPage 제목 | `#333333` | `#F1F1F1` |

> **최적화**: 위 하드코딩 색상을 변수로 전환하면 Dark 복사 시 자동 적용됩니다. Phase 2에서 컴포넌트 생성 시 가능한 한 `$hmg-*` 변수 사용을 권장합니다.

---

## 8. Phase 5: 검증 및 마무리

### 8.1 스크린샷 검증 체크리스트

| # | 대상 | 검증 항목 |
|---|------|----------|
| 1 | 각 컴포넌트 (13개) | 크기, 색상, 폰트, 레이아웃 정상 |
| 2 | HMG-Home (Light) | GNB + Hero + 3×2 카드 + Footer 정렬 |
| 3 | HMG-Publications (Light) | 탭 필터 + 2컬럼 카드 + 다운로드 리스트 |
| 4 | HMG-StepGuide (Light) | 틸 구분선 + 스텝 번호 + 2컬럼 레이아웃 |
| 5 | HMG-Dashboard (Light) | StatCard 4열 + 검색바 + CTA 버튼 |
| 6 | Dark 화면 4개 | 변수 전환 정상, 하드코딩 색상 수정 완료 |
| 7 | 기존 위키 6화면 | 변경 없음 (regression 체크) |

### 8.2 레이아웃 검증

`snapshot_layout` 호출로 각 화면의 자식 요소 위치/크기가 설계와 일치하는지 확인합니다.

### 8.3 검증 도구 호출 순서

```
1. get_screenshot(컴포넌트 ID)  × 13회 (각 컴포넌트)
2. get_screenshot(HMG-Home)
3. get_screenshot(HMG-Publications)
4. get_screenshot(HMG-StepGuide)
5. get_screenshot(HMG-Dashboard)
6. get_screenshot(HMG-Home-Dark)
7. get_screenshot(HMG-Publications-Dark)
8. get_screenshot(HMG-StepGuide-Dark)
9. get_screenshot(HMG-Dashboard-Dark)
10. snapshot_layout(maxDepth: 2, 각 화면)  → 오버플로우/클리핑 확인
11. get_screenshot(WikiHome)  → 기존 화면 변경 없음 확인
```

---

## 9. `batch_design` 호출 계획 (최대 25 연산/호출)

### 9.1 총 호출 수 추정

| Phase | 호출 내용 | 예상 호출 수 |
|-------|----------|-------------|
| 2-1 | PillButton + GNBItem + StepNumber + StatCard + DownloadItem | 5개 컴포넌트, ~3 호출 |
| 2-2 | GNB + StepItem + TabFilter | 3개 컴포넌트, ~3 호출 |
| 2-3 | HeroBanner + PublicationCard + StepGuideSection + CoverPage + Footer | 5개 컴포넌트, ~5 호출 |
| 3-1 | HMG-Home (프레임 + GNB + Hero + 6카드 + Footer) | ~4 호출 |
| 3-2 | HMG-Publications (프레임 + 구조 + 2섹션) | ~3 호출 |
| 3-3 | HMG-StepGuide (프레임 + 구조 + 5스텝) | ~3 호출 |
| 3-4 | HMG-Dashboard (프레임 + 구조 + StatCards + CTA) | ~3 호출 |
| 4 | Dark 화면 4개 복사 + 미세 조정 | ~2 호출 |
| 5 | 검증 (스크린샷 + 레이아웃) | ~10 호출 |
| **합계** | | **~37 호출** |

### 9.2 호출 분할 예시

**HMG-Home 화면 — 4 호출로 분할**:

```
호출 1 (구조 프레임):
  - 메인 프레임 생성 (placeholder: true)
  - GNB 인스턴스 삽입
  - HeroBanner 인스턴스 삽입
  - 카드 그리드 프레임 생성
  → ~8 연산

호출 2 (카드 행 1):
  - 행 프레임 생성
  - 카드 1 (프레임 + 아이콘 + 제목 + 설명)
  - 카드 2 (동일)
  - 카드 3 (동일)
  → ~16 연산

호출 3 (카드 행 2 + Footer):
  - 행 프레임 생성
  - 카드 4, 5, 6
  - Footer 인스턴스 삽입
  → ~14 연산

호출 4 (이미지 생성 + 마무리):
  - G() 호출로 카드 이미지 (필요시)
  - placeholder 해제
  → ~2 연산
```

---

## 10. 실행 시 주의사항

### 10.1 ID 참조 체인

컴포넌트 생성 순서가 중요합니다. 각 `batch_design` 호출 결과로 반환되는 실제 ID를 다음 호출에서 사용해야 합니다.

```
PillButton 생성 → 실제 ID 기록
  ↓
DownloadItem 생성 (PillButton ref 사용)
  ↓
PublicationCard 생성 (DownloadItem ref 사용)
  ↓
HMG-Publications 화면 (PublicationCard ref 사용)
```

### 10.2 폰트 주의

`SpoqaHanSansNeo`는 .pen 내에서 사용 가능하지만, 실제 웹 구현 시 CDN 또는 로컬 폰트 설치가 필요합니다. .pen 디자인에서는 그대로 사용합니다.

### 10.3 placeholder 관리

- 컴포넌트/화면 작업 시작: `placeholder: true` 설정
- 작업 완료: `placeholder: false` 해제
- **동시에 2개 이상의 placeholder를 활성화하지 않음**

### 10.4 변수 활용 최대화

하드코딩 색상 대신 `$hmg-*` 변수를 사용하면:
- Dark 화면 복사 시 자동 전환
- 나중에 색상 일괄 변경 가능
- 일관성 유지

### 10.5 기존 화면 보호

- HMG 작업은 모두 **새 노드 생성** (Insert, Copy)
- 기존 위키 6개 화면과 6개 컴포넌트는 **절대 수정하지 않음**
- 기존 18개 변수는 `set_variables`의 merge 모드로 보존

---

## 11. 최종 산출물 요약

| 항목 | 수량 |
|------|------|
| **디자인 변수** | 36개 (기존 18 + HMG 18) |
| **재사용 컴포넌트** | 19개 (기존 6 + HMG 13) |
| **화면** | 14개 (기존 6 + HMG 8) |
| **`batch_design` 호출** | ~37회 |
| **`set_variables` 호출** | 1회 |
| **`get_screenshot` 호출** | ~21회 |
| **예상 소요 시간** | 3일 |

---

## 12. Phase별 체크리스트

### Phase 1 완료 기준
- [ ] `get_variables` 결과에 36개 변수 (기존 18 + HMG 18)
- [ ] 테마 축 `mode: [light, dark]` 유지

### Phase 2 완료 기준
- [ ] 13개 HMG 컴포넌트 생성 (x=-600 영역)
- [ ] 각 컴포넌트 `reusable: true`
- [ ] 각 컴포넌트 `get_screenshot` 정상 렌더링
- [ ] 모든 `placeholder: false`

### Phase 3 완료 기준
- [ ] 4개 Light 화면 (Y=2200 행)
- [ ] 각 화면에서 컴포넌트 인스턴스 정상 표시
- [ ] 카드 그리드, 2컬럼 레이아웃, StatCard 정렬
- [ ] `get_screenshot` 4회 통과

### Phase 4 완료 기준
- [ ] 4개 Dark 화면 (Y=3600 행)
- [ ] `theme: { mode: "dark" }` 적용
- [ ] 하드코딩 색상 수동 조정 완료
- [ ] `get_screenshot` 4회 통과

### Phase 5 완료 기준
- [ ] 기존 위키 6개 화면 변경 없음
- [ ] `snapshot_layout` 오버플로우/클리핑 없음
- [ ] 전체 14개 화면 스크린샷 정상
