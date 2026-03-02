# H Chat Wiki — HMG 디자인 가이드 형식 적용 설계 방안

## 1. 개요

현대자동차그룹(HMG) 공식 웹사이트(`hyundaimotorgroup.com/ko/about-us/publications`)와 **Brand Home 2.0** 내부 플랫폼(`bms.hmc.co.kr`)의 디자인 시스템을 분석하고, 현재 `wiki.pen`에 HMG 브랜드 가이드 스타일의 새 화면을 추가하는 설계 방안입니다.

### 목표

1. HMG 공식 사이트 + Brand Home 2.0의 디자인 언어를 wiki.pen에 반영
2. 기존 위키 화면(6개)과 독립적으로 HMG 스타일 화면 세트를 추가
3. Brand Home 2.0의 스텝 가이드 UI 패턴(번호 원형 + 2컬럼 레이아웃) 적용
4. 향후 코드 구현 시 HMG 브랜드 가이드라인 준수 가능하도록 토큰 정의

### 참고 소스

| 소스 | URL | 추출 항목 |
|------|-----|----------|
| HMG 공식 사이트 | `hyundaimotorgroup.com/ko/about-us/publications` | 레이아웃, 색상, 타이포, 카드 |
| HMG CSS (style.css) | `hyundaimotorgroup.com/resources/assets/css/style.css` | 컴포넌트, 버튼, 그리드 |
| **Brand Home 2.0 PDF** | `bms.hmc.co.kr/assets/doc/Brand Home2.0_Registration Process.pdf` | 스텝 UI, 폼, 대시보드 |

---

## 2. HMG 웹사이트 디자인 분석

### 2.1 추출된 디자인 속성 (style.css 기준)

#### 색상 팔레트

```
[브랜드/강조]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#002C5F    HMG 네이비 (로고, GNB)
#e15c39    포인트 오렌지레드 (CTA, 강조)
#3a5bc5    블루 (링크, 인포)
#118762    그린 (성공, 긍정)
#c98000    골드/브라운 (경고, 보조)

[배경]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#FFFFFF    페이지 배경
#f5f5f5    섹션 배경 (교대)
#f1f1f1    카드/테이블 배경
#f0f0f0    호버 배경

[텍스트]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#000000    제목 (h1-h2)
#111111    본문 (body)
#1f1f1f    부제목
#333333    보조 텍스트
#949494    메타/캡션

[보더/구분선]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#eaeaea    기본 보더
#e6e6e6    카드 보더
#d8d8d8    강한 구분선
#dddddd    테이블 보더
```

#### 타이포그래피

```
폰트 패밀리: 'SpoqaHanSansNeo', 'Malgun Gothic', '맑은 고딕', sans-serif
대체: Arial, Dotum, serif

크기 체계:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
40px    페이지 제목 (h1)                  weight: 700
32px    섹션 제목 (h2)                    weight: 700
24px    서브 제목 (h3)                    weight: 500
20px    body-text1 (큰 본문)             weight: 400
17px    body-text2 (기본 본문)            weight: 400
14px    보조 텍스트                        weight: 400
13px    caption-text (캡션)               weight: 300

line-height: 1.45 ~ 1.88
letter-spacing: 0 (기본), -0.5px (제목)
```

#### 레이아웃 시스템

```
컨테이너: max-width 1400px, padding 0 80px
그리드: Flexbox 기반, 2컬럼 (50:50)
섹션 간격: 80px ~ 120px
카드 내 간격: 20px ~ 40px
```

#### 컴포넌트 스타일

```
버튼:
  높이: 60px
  패딩: 0 30px
  라운드: 30px (pill shape)
  폰트: 20px / weight 500
  기본: 흰 배경, #333 텍스트
  강조(.btn-black): #333 배경 → hover #000
  라인(.btn-line): 1px 보더, 투명 배경
  태그(.btn-tag): rgba(0,0,0,0.06) 배경

카드/박스:
  라운드: 10px
  그림자: 0 0 10px rgba(0,0,0,0.1)
  보더: 1px solid #eaeaea

트랜지션:
  배경색: 0.5s ease
  전체: 0.3s ease
```

#### 반응형 브레이크포인트

```
1400px+       데스크톱 (px 단위)
900–1399px    태블릿 (vw 단위)
720–899px     모바일 대
720px 이하     모바일 소
```

### 2.2 Publications 페이지 특수 구조

```
┌─────────────────────────────────────────────────┐
│  GNB (Global Navigation Bar)                     │
│  로고 | 메뉴 | 검색 | 언어선택(KO/EN)            │
├─────────────────────────────────────────────────┤
│                                                   │
│  히어로 배너                                       │
│  "발행물" 타이틀 + 설명                            │
│                                                   │
├─────────────────────────────────────────────────┤
│  탭 필터 (카테고리별)                              │
│  ┌───────┬───────┬───────┬───────┐               │
│  │ 전체  │ 지속  │ 환경  │ 사회  │               │
│  └───────┴───────┴───────┴───────┘               │
├─────────────────────────────────────────────────┤
│                                                   │
│  .comm-sect (반복 섹션)                            │
│  ┌──────────────────────────────────────────┐    │
│  │  .title-block                             │    │
│  │  섹션 제목 + 설명                          │    │
│  │                                            │    │
│  │  ┌────────────┬──────────────────────┐    │    │
│  │  │ 대표 이미지  │  다운로드 리스트       │    │    │
│  │  │ (썸네일)    │  ├ 제목 + [KO] [EN]   │    │    │
│  │  │             │  ├ 제목 + [바로가기]    │    │    │
│  │  │             │  └ ...                 │    │    │
│  │  └────────────┴──────────────────────┘    │    │
│  │                                            │    │
│  │  [더보기] 버튼                              │    │
│  └──────────────────────────────────────────┘    │
│                                                   │
│  (다음 .comm-sect 반복)                            │
│                                                   │
├─────────────────────────────────────────────────┤
│  뉴스레터 구독                                     │
│  푸터 (그룹사 바로가기 + 소셜)                      │
└─────────────────────────────────────────────────┘
```

### 2.3 Brand Home 2.0 디자인 분석 (PDF 7페이지)

#### 전체 구조

Brand Home 2.0은 HMG 내부 브랜드 관리 플랫폼(BMS)의 등록/인증 프로세스 가이드 문서입니다. 7페이지 PDF에서 추출한 디자인 패턴:

#### 색상 팔레트 (Brand Home 고유)

```
[Brand Home 브랜드]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#00B4D8    틸/시안 (CTA 버튼, 스텝 번호, 하이라이트 박스, Save 버튼)
#002C5F    네이비 (Primary 버튼, "Create an account", GNB 로고)
#D5CEBF    베이지/샌드 (커버 페이지 배경, EOD 페이지)
#FFFFFF    콘텐츠 카드 배경, 페이지 본문 배경
#333333    버튼 텍스트, 제목 텍스트
#666666    설명 텍스트, placeholder
#F5F5F5    입력 필드 배경
#E0E0E0    입력 필드 보더

[상태 색상]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#00B4D8    확인/Confirm (틸)
#E53935    거부/Reject (레드)
#4CAF50    승인/Approve (그린)
```

#### 스텝 가이드 레이아웃 (핵심 패턴)

```
┌──────────────────────────────────────────────────────┐
│  섹션 제목 (Bold, 24px)                                │
│  ═══════════════════════ (틸 수평선)                    │
│                                                        │
│  ┌──────────────────┬──────────────────────────────┐  │
│  │ 좌: 스텝 설명     │ 우: UI 스크린샷               │  │
│  │                    │                              │  │
│  │ ① 스텝 제목       │  ┌─────────────────────┐    │  │
│  │   스텝 설명 텍스트  │  │                     │    │  │
│  │        ↓           │  │  브라우저/앱 스크린샷  │    │  │
│  │ ② 스텝 제목       │  │                     │    │  │
│  │   스텝 설명 텍스트  │  │  ┌───┐ 틸 하이라이트 │    │  │
│  │        ↓           │  │  └───┘ 박스 (callout)│    │  │
│  │ ③ 스텝 제목       │  │                     │    │  │
│  │   스텝 설명 텍스트  │  └─────────────────────┘    │  │
│  │                    │                              │  │
│  └──────────────────┴──────────────────────────────┘  │
└──────────────────────────────────────────────────────┘

속성:
- 2컬럼 레이아웃: 좌 40%, 우 60% (또는 좌 35%, 우 65%)
- 스텝 번호: 틸(#00B4D8) 원형, 흰색 숫자, 28px 직경
- 스텝 간 화살표: 틸 다운 화살표 (↓)
- 스텝 제목: 16px, #333, weight 600
- 스텝 설명: 14px, #666, weight 400
- 우측 스크린샷: 회색 보더 또는 그림자, 틸 점선/실선 callout 박스
- 섹션 구분: 틸(#00B4D8) 수평선 (2px)
```

#### Brand Home GNB (대시보드)

```
┌──────────────────────────────────────────────────────┐
│ [Hyundai 로고]  Brand Guidelines  Library  Review    │
│                 Tools  Brand Reports  My BMS  EN ▼   │
│ height: 64px, bg: #FFFFFF, border-bottom: 1px #E0E0E0│
└──────────────────────────────────────────────────────┘
```

#### Brand Home 대시보드 UI

```
┌──────────────────────────────────────────────────────┐
│  Welcome, [사용자명]                                   │
│                                                        │
│  ┌──────┬──────┬──────┬──────┐                        │
│  │Review │Free  │Down- │Book- │  상태 카드 (4개)       │
│  │in     │comment│load  │mark  │  배경: #F5F5F5         │
│  │progress│  0   │file  │  0   │  숫자: 32px, Bold      │
│  │  0    │      │  2   │      │  라벨: 13px, #666       │
│  └──────┴──────┴──────┴──────┘                        │
│                                                        │
│  ┌─────────────────────────────────────────┐          │
│  │  [검색 아이콘] Search                     │ 검색바    │
│  └─────────────────────────────────────────┘          │
│                                                        │
│  [Design Review Submission] ← 네이비 CTA 버튼          │
│                                                        │
│  히어로 캐러셀 (대형 이미지)                             │
└──────────────────────────────────────────────────────┘
```

#### 폼/입력 필드 패턴

```
입력 필드:
- 높이: 48px
- 배경: #F5F5F5
- 보더: 1px solid #E0E0E0
- 라운드: 4px (미세)
- placeholder: #999, 14px
- 포커스: 보더 #00B4D8

버튼 (Brand Home):
- Primary (네이비): bg #002C5F, color #FFF, height 48px, radius 4px
- Secondary (틸): bg #00B4D8, color #FFF, height 48px, radius 4px
- Outline: bg #FFF, border 1px #E0E0E0, color #333, height 48px, radius 4px
- Reject: bg #FFF, border 1px #E53935, color #E53935
- Approve: bg #00B4D8, color #FFF

라디오 버튼:
- Division 선택: RHQ, Corporation, Dealer, Partners, ETC
- 커스텀 스타일: 원형 라디오, 선택 시 틸 채움
```

#### 커버/엔딩 페이지

```
┌──────────────────────────────────────────────────────┐
│                                                        │
│  배경: #D5CEBF (베이지/샌드)                            │
│                                                        │
│  ┌────────────────────────────────────────────┐       │
│  │  흰색 카드 (800×500)                         │       │
│  │  라운드: 16px                                │       │
│  │                                              │       │
│  │  "Brand Home"        (32px, Bold, #333)      │       │
│  │  "Registration Process" (20px, #666)         │       │
│  │                                              │       │
│  │  ● Decision Making                           │       │
│  │  ● Information Sharing   (범례)              │       │
│  │  ● Directions                                │       │
│  │                                              │       │
│  └────────────────────────────────────────────┘       │
│                                                        │
│                              [Hyundai 로고] 우하단      │
└──────────────────────────────────────────────────────┘
```

---

## 3. wiki.pen 현재 상태

### 3.1 기존 화면 (6개)

| # | 화면 | ID | 테마 | 크기 |
|---|------|-----|------|------|
| 1 | WikiHome | `Oyw0e` | Light | 1440×900 |
| 2 | DocsPage - AI 채팅 | `Zzbmd` | Light | 1440×900 |
| 3 | QuickStartPage | `RfzE5` | Light | 1440×900 |
| 4 | WikiHome - Dark | `ZGhd9` | Dark | 1440×900 |
| 5 | DocsPage - AI 채팅 - Dark | `7symu` | Dark | 1440×900 |
| 6 | QuickStartPage - Dark | `DB4hd` | Dark | 1440×900 |

### 3.2 기존 재사용 컴포넌트 (6개)

| 컴포넌트 | ID | 유지/변경 |
|----------|-----|----------|
| `Wiki/NavItem` | `pKthN` | 유지 (기존 위키용) |
| `Wiki/NavGroupHeader` | `2ITpx` | 유지 |
| `Wiki/FeatureCard` | `ZUwkZ` | 유지 |
| `Wiki/Badge` | `iE8nD` | 유지 |
| `Wiki/Breadcrumb` | `b4345` | 유지 |
| `Wiki/SearchBar` | `7d4mW` | 유지 |

### 3.3 기존 디자인 변수 (18개)

현재 wiki.pen의 변수는 기존 위키 테마(blue primary, slate neutrals)입니다. HMG 화면은 **별도 테마 축**으로 추가하거나, 화면 내에서 직접 색상을 지정합니다.

---

## 4. 추가할 HMG 스타일 화면 (6개)

### 4.1 화면 목록

| # | 화면 | 테마 | 설명 | 참고 소스 |
|---|------|------|------|----------|
| 1 | HMG-Home | Light | HMG 스타일 메인 랜딩 (히어로 + 기능 그리드) | HMG 공식 사이트 |
| 2 | HMG-Publications | Light | 발행물 페이지 (탭 필터 + 다운로드 섹션) | HMG Publications |
| 3 | HMG-StepGuide | Light | **스텝 가이드** (Brand Home 스타일 2컬럼) | Brand Home 2.0 PDF |
| 4 | HMG-Dashboard | Light | **대시보드** (Brand Home 스타일 통계+검색) | Brand Home 2.0 PDF |
| 5 | HMG-Home-Dark | Dark | 다크 모드 메인 | |
| 6 | HMG-Publications-Dark | Dark | 다크 모드 발행물 | |
| 7 | HMG-StepGuide-Dark | Dark | 다크 모드 스텝 가이드 | |
| 8 | HMG-Dashboard-Dark | Dark | 다크 모드 대시보드 | |

### 4.2 캔버스 배치

```
[기존 위키 6화면]                              [HMG 8화면]
┌────────┬────────┬────────┐    ┌────────┬────────┬────────┬──────────┐
│WikiHome│DocsPage│QuickSt │    │HMG-Home│HMG-Pub │HMG-Step│HMG-Dash  │
│(Light) │(Light) │(Light) │    │(Light) │(Light) │(Light) │(Light)   │
└────────┴────────┴────────┘    └────────┴────────┴────────┴──────────┘
┌────────┬────────┬────────┐    ┌────────┬────────┬────────┬──────────┐
│WikiHome│DocsPage│QuickSt │    │HMG-Home│HMG-Pub │HMG-Step│HMG-Dash  │
│(Dark)  │(Dark)  │(Dark)  │    │(Dark)  │(Dark)  │(Dark)  │(Dark)    │
└────────┴────────┴────────┘    └────────┴────────┴────────┴──────────┘

Y=0 행: Light 테마
Y=1100 행: Dark 테마 (900 + 200 간격)
```

---

## 5. 새 재사용 컴포넌트 설계 (8개)

### 5.1 컴포넌트 목록

| # | 컴포넌트명 | 용도 | 참고 소스 |
|---|-----------|------|----------|
| 1 | `HMG/GNB` | 상단 글로벌 네비게이션 | HMG 공식 + Brand Home |
| 2 | `HMG/GNBItem` | GNB 메뉴 아이템 | HMG 공식 |
| 3 | `HMG/HeroBanner` | 히어로 배너 (제목 + 설명) | HMG 공식 |
| 4 | `HMG/TabFilter` | 탭 필터 바 | HMG Publications |
| 5 | `HMG/PublicationCard` | 발행물 카드 (이미지 + 다운로드) | HMG Publications |
| 6 | `HMG/DownloadItem` | 다운로드 항목 (제목 + 버튼) | HMG Publications |
| 7 | `HMG/PillButton` | 필 모양 버튼 | HMG 공식 |
| 8 | `HMG/Footer` | HMG 스타일 푸터 | HMG 공식 |
| 9 | **`HMG/StepNumber`** | 번호 원형 (틸 배경 + 흰 숫자) | **Brand Home 2.0** |
| 10 | **`HMG/StepItem`** | 스텝 항목 (번호 + 제목 + 설명 + 화살표) | **Brand Home 2.0** |
| 11 | **`HMG/StepGuideSection`** | 2컬럼 스텝 가이드 (좌: 스텝, 우: 스크린샷) | **Brand Home 2.0** |
| 12 | **`HMG/StatCard`** | 대시보드 통계 카드 (숫자 + 라벨) | **Brand Home 2.0** |
| 13 | **`HMG/CoverPage`** | 베이지 배경 커버/엔딩 페이지 | **Brand Home 2.0** |

### 5.2 컴포넌트 상세 설계

#### `HMG/GNB` — 글로벌 네비게이션 바

```
┌──────────────────────────────────────────────────────────┐
│  [HMG 로고]    회사소개  사업영역  기술혁신  지속가능경영    🔍  KO ▼  │
│  height: 80px, bg: #FFFFFF, border-bottom: 1px #eaeaea      │
└──────────────────────────────────────────────────────────┘

속성:
- 너비: 1440px (full width)
- 높이: 80px
- 배경: #FFFFFF
- 패딩: 0 80px (좌우 80px = 컨테이너 패딩)
- 하단 보더: 1px solid #eaeaea
- 로고: 좌측, HMG 텍스트 (17px, #002C5F, weight 700)
- 메뉴: 중앙, 17px, #333, weight 500, gap 40px
- 우측: 검색 아이콘 + 언어 선택 (14px, #949494)
```

#### `HMG/HeroBanner` — 히어로 배너

```
┌──────────────────────────────────────────────────────────┐
│                                                            │
│                     발행물                                  │
│           현대자동차그룹의 다양한 발행물을                    │
│           확인하실 수 있습니다.                              │
│                                                            │
│  height: 300px, bg: #f5f5f5                                │
└──────────────────────────────────────────────────────────┘

속성:
- 너비: fill_container
- 높이: 300px
- 배경: #f5f5f5
- 패딩: 80px (상하좌우)
- 제목: 40px, #000, weight 700, 중앙정렬
- 설명: 17px, #333, weight 400, 중앙정렬, 제목과 gap 20px
```

#### `HMG/TabFilter` — 탭 필터

```
┌──────────────────────────────────────────────────────────┐
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     │
│  │ 전체  │ │ 지속  │ │ 환경  │ │ 사회  │                     │
│  │ ━━━━ │ │      │ │      │ │      │                     │
│  └──────┘ └──────┘ └──────┘ └──────┘                     │
│  border-bottom: 1px #eaeaea                               │
└──────────────────────────────────────────────────────────┘

속성:
- 너비: fill_container
- 높이: 60px
- 패딩: 0 80px
- 하단 보더: 1px solid #eaeaea
- 탭 아이템: 17px, #949494, weight 400, gap 40px
- 활성 탭: #000, weight 500, 하단 2px solid #000
```

#### `HMG/PublicationCard` — 발행물 카드

```
┌──────────────────────────────────────────────────────────┐
│  섹션 제목                                                 │
│  섹션 설명 텍스트                                          │
│                                                            │
│  ┌─────────────┬──────────────────────────────────┐       │
│  │             │  제목 1              [KO] [EN]    │       │
│  │  대표 이미지  │  ───────────────────────────      │       │
│  │  (500×360)  │  제목 2              [바로가기]    │       │
│  │             │  ───────────────────────────      │       │
│  │  radius:10  │  제목 3              [KO] [EN]    │       │
│  │             │                                    │       │
│  └─────────────┴──────────────────────────────────┘       │
│                                                            │
│                      [더보기 ↓]                             │
└──────────────────────────────────────────────────────────┘

속성:
- 섹션 컨테이너: fill_container, padding 80px
- 제목: 32px, #000, weight 700
- 설명: 17px, #333, weight 400, margin-top 16px
- 카드 영역: margin-top 40px, flex row, gap 40px
  - 이미지 래퍼: 500px width, border-radius 10px, overflow hidden
  - 다운로드 리스트: fill_container, vertical, gap 0
    - 항목: padding 20px 0, border-bottom 1px #eaeaea
    - 항목 제목: 17px, #111, weight 400
    - 언어 버튼: pill shape, height 36px, padding 0 16px, 14px, #333
- 더보기 버튼: 중앙정렬, margin-top 40px, pill shape
```

#### `HMG/DownloadItem` — 다운로드 항목

```
┌──────────────────────────────────────────────────────────┐
│  [제목 텍스트]                           [KO]  [EN]  [CN]  │
│  border-bottom: 1px solid #eaeaea                         │
└──────────────────────────────────────────────────────────┘

속성:
- 높이: auto (내용에 따라)
- 패딩: 20px 0
- flex row, justify-content space-between, align-items center
- 제목: 17px, #111, weight 400
- 버튼 그룹: flex row, gap 8px
  - 버튼: height 36px, padding 0 16px, border 1px #eaeaea
  - 텍스트: 14px, #333, weight 500
  - border-radius: 18px (pill)
  - hover: bg #f0f0f0
```

#### `HMG/PillButton` — 필 모양 버튼

```
속성:
- 높이: 60px (대형) / 36px (소형)
- 패딩: 0 30px (대형) / 0 16px (소형)
- border-radius: 30px (대형) / 18px (소형)
- 폰트: 20px weight 500 (대형) / 14px weight 500 (소형)

변형 (variant):
  default: bg #FFF, border 1px #eaeaea, color #333
  black:   bg #333, border none, color #FFF  →  hover bg #000
  line:    bg transparent, border 1px #333, color #333
  tag:     bg rgba(0,0,0,0.06), border none, color #333
```

#### `HMG/Footer` — 푸터

```
┌──────────────────────────────────────────────────────────┐
│  뉴스레터 구독                             [이메일 입력] [→] │
├──────────────────────────────────────────────────────────┤
│  현대자동차  기아  제네시스  현대모비스  현대건설기계  ...      │
├──────────────────────────────────────────────────────────┤
│  이용약관 | 개인정보처리방침           [FB] [TW] [IG] [YT]  │
│  © Hyundai Motor Group                                    │
└──────────────────────────────────────────────────────────┘

속성:
- 너비: fill_container
- 배경: #1f1f1f (다크)
- 텍스트: #949494 (기본), #FFFFFF (강조)
- 패딩: 60px 80px
- 그룹사 로고: flex wrap, gap 20px
- 소셜: 24px 아이콘, gap 16px
- 저작권: 13px, #949494, margin-top 40px
```

#### `HMG/StepNumber` — 번호 원형 (Brand Home 2.0)

```
  ┌───┐
  │ 1 │   28px × 28px 원형
  └───┘   bg: #00B4D8 (틸), color: #FFF, 14px, weight 600

속성:
- 크기: 28 × 28
- border-radius: 50%
- 배경: #00B4D8
- 텍스트: #FFFFFF, 14px, weight 600, 중앙정렬
- 변형: active (틸), inactive (#E0E0E0)
```

#### `HMG/StepItem` — 스텝 항목 (Brand Home 2.0)

```
  ① 스텝 제목
     스텝 설명 텍스트가 여기에 들어갑니다.
        ↓ (틸 화살표)

속성:
- flex row, gap 12px
- 번호: HMG/StepNumber (28px)
- 제목: 16px, #333, weight 600
- 설명: 14px, #666, weight 400, padding-left 40px (번호 너비 + gap)
- 하단 화살표: 틸(#00B4D8), 16px, margin 8px 0, padding-left 12px
```

#### `HMG/StepGuideSection` — 2컬럼 스텝 가이드 (Brand Home 2.0)

```
┌──────────────────────────────────────────────────────┐
│  섹션 제목 (24px, Bold)                                │
│  ═══════════════════════ (틸 2px 수평선)                │
│                                                        │
│  ┌──────── 35% ────────┬────────── 65% ─────────────┐ │
│  │                      │                              │ │
│  │  ① Access the URL    │   ┌──────────────────┐      │ │
│  │     Open your...     │   │                  │      │ │
│  │          ↓           │   │  스크린샷 영역     │      │ │
│  │  ② Sign up           │   │  bg: #F5F5F5     │      │ │
│  │     Click the...     │   │  radius: 8px     │      │ │
│  │          ↓           │   │  ┌──┐ 틸 callout  │      │ │
│  │  ③ Fill in form      │   │  └──┘            │      │ │
│  │     Complete all...  │   │                  │      │ │
│  │                      │   └──────────────────┘      │ │
│  └──────────────────────┴──────────────────────────┘ │
└──────────────────────────────────────────────────────┘

속성:
- 너비: fill_container
- 패딩: 60px 80px
- 섹션 제목: 24px, #333, weight 700
- 제목 하단 구분선: 2px solid #00B4D8, margin-top 12px
- 2컬럼 영역: margin-top 40px, flex row, gap 48px
  - 좌측 (스텝 목록): width 35%, vertical, gap 0
  - 우측 (스크린샷): width 65%, bg #F5F5F5, radius 8px, padding 24px
    - callout 박스: border 2px dashed #00B4D8 또는 solid, radius 4px
```

#### `HMG/StatCard` — 대시보드 통계 카드 (Brand Home 2.0)

```
┌──────────────┐
│   Review in   │
│   progress    │  라벨: 13px, #666
│               │
│      0        │  숫자: 32px, #333, Bold
└──────────────┘

속성:
- 크기: fill_container (4컬럼 그리드에서 균등)
- 높이: 120px
- 배경: #F5F5F5
- 라운드: 8px
- 패딩: 20px
- 텍스트 정렬: 중앙
- 라벨: 13px, #666, weight 400
- 숫자: 32px, #333, weight 700
- gap (라벨↔숫자): 8px
```

#### `HMG/CoverPage` — 커버/엔딩 페이지 (Brand Home 2.0)

```
┌──────────────────────────────────────────────────────┐
│  배경: #D5CEBF (베이지/샌드)                            │
│                                                        │
│  ┌────────────────────────────────────────────┐       │
│  │  흰색 카드                                    │       │
│  │  width: 800px, padding: 60px                 │       │
│  │  radius: 16px                                │       │
│  │                                              │       │
│  │  "H Chat"                (32px, Bold, #333)  │       │
│  │  "사용 가이드"            (20px, #666)         │       │
│  │                                              │       │
│  │  ● Decision Making       (범례, 14px)         │       │
│  │  ● Information Sharing                       │       │
│  │  ● Directions                                │       │
│  └────────────────────────────────────────────┘       │
│                                                        │
│                                  [Hyundai 로고] 우하단  │
└──────────────────────────────────────────────────────┘

속성:
- 전체: 1440 × 900, bg #D5CEBF
- 카드: width 800px, bg #FFF, radius 16px, padding 60px, 중앙정렬
- 범례 원형: 8px, 각각 다른 색상 (#00B4D8, #FF9800, #4CAF50)
- 로고: 우하단, padding 40px
```

---

## 6. 디자인 변수 (HMG 테마)

### 6.1 새 테마 축 추가

기존 `mode: [light, dark]`에 추가로 HMG 색상을 변수로 정의합니다.

```
[새 변수 — HMG 공식 사이트]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hmg-navy          #002C5F    (HMG 브랜드 네이비, 로고/GNB)
hmg-accent        #e15c39    (포인트 오렌지레드, CTA)
hmg-blue          #3a5bc5    (링크/인포 블루)
hmg-green         #118762    (성공 그린)
hmg-bg-section    light: #f5f5f5 / dark: #1a1a1a
hmg-bg-card       light: #FFFFFF / dark: #2a2a2a
hmg-text-title    light: #000000 / dark: #f1f1f1
hmg-text-body     light: #111111 / dark: #e0e0e0
hmg-text-caption  light: #949494 / dark: #666666
hmg-border        light: #eaeaea / dark: #333333
hmg-footer-bg     light: #1f1f1f / dark: #0a0a0a

[새 변수 — Brand Home 2.0]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
hmg-teal          #00B4D8    (Brand Home CTA, 스텝 번호, 하이라이트)
hmg-teal-light    light: #E0F7FA / dark: #004D5A  (틸 배경 tint)
hmg-cover-bg      #D5CEBF    (베이지/샌드 커버 배경)
hmg-input-bg      light: #F5F5F5 / dark: #2a2a2a  (입력 필드 배경)
hmg-input-border  light: #E0E0E0 / dark: #444444  (입력 필드 보더)
hmg-reject        #E53935    (거부/에러)
hmg-approve       #4CAF50    (승인/성공)
```

### 6.2 기존 위키 변수와의 관계

| 역할 | 기존 위키 변수 | HMG 변수 |
|------|--------------|----------|
| 페이지 배경 | `bg-page` (#FFF) | #FFFFFF (동일) |
| 강조색 | `primary` (#2563EB) | `hmg-navy` (#002C5F) |
| CTA | `primary` | `hmg-accent` (#e15c39) |
| 본문 텍스트 | `text-primary` (#0F172A) | `hmg-text-body` (#111) |
| 보더 | `border` (#E2E8F0) | `hmg-border` (#eaeaea) |

---

## 7. 화면별 상세 설계

### 7.1 HMG-Home (Light)

H Chat 위키를 HMG 공식 사이트 스타일로 재해석한 메인 페이지.

```
1440 × 1200 (스크롤 필요 → 디자인에서는 1200px 높이)
┌──────────────────────────────────────┐
│  HMG/GNB                             │  80px
├──────────────────────────────────────┤
│                                        │
│  HMG/HeroBanner                       │  300px
│  "H Chat 사용 가이드"                   │
│  "멀티 AI 어시스턴트의 모든 기능"        │
│                                        │
├──────────────────────────────────────┤
│                                        │
│  기능 카드 그리드 (3×2)                 │
│  ┌─────────┬─────────┬─────────┐     │
│  │ 멀티 AI  │ 크로스   │ YouTube  │     │  카드: 400×240
│  │ 프로바이더│ 모델토론 │ 분석    │     │  gap: 24px
│  ├─────────┼─────────┼─────────┤     │  padding: 80px
│  │ PDF 채팅 │ 검색AI   │ 글쓰기   │     │  radius: 10px
│  │          │ 카드     │ 어시스턴트│     │  shadow: 0 0 10px rgba(0,0,0,0.1)
│  └─────────┴─────────┴─────────┘     │
│                                        │
├──────────────────────────────────────┤
│  HMG/Footer                           │
└──────────────────────────────────────┘
```

**카드 디자인 (HMG 스타일)**:
- 크기: 약 400×240px (3컬럼 균등)
- 배경: #FFFFFF
- 보더: 1px solid #eaeaea
- 라운드: 10px
- 그림자: 0 0 10px rgba(0,0,0,0.1)
- 패딩: 32px
- 아이콘: 40px, #002C5F
- 제목: 20px, #000, weight 600
- 설명: 14px, #333, weight 400

### 7.2 HMG-Publications (Light)

HMG 발행물 페이지를 H Chat 문서 다운로드에 응용.

```
1440 × 1400
┌──────────────────────────────────────┐
│  HMG/GNB                             │
├──────────────────────────────────────┤
│  HMG/HeroBanner "H Chat 발행물"       │
├──────────────────────────────────────┤
│  HMG/TabFilter                        │
│  [전체] [가이드] [릴리즈 노트] [기술 문서] │
├──────────────────────────────────────┤
│                                        │
│  섹션 1: 사용 가이드                    │
│  ┌─────────────┬──────────────────┐  │
│  │             │ 빠른 시작 가이드    │  │
│  │  가이드     │ ────────────────   │  │
│  │  커버 이미지 │ AI 채팅 가이드     │  │
│  │             │ ────────────────   │  │
│  │  500×360    │ 그룹 채팅 가이드    │  │
│  │  radius:10  │ ────────────────   │  │
│  │             │ 도구 패널 가이드    │  │
│  └─────────────┴──────────────────┘  │
│                                        │
│  섹션 2: 릴리즈 노트                    │
│  ┌─────────────┬──────────────────┐  │
│  │             │ v3.0.0 릴리즈 노트  │  │
│  │  릴리즈     │ ────────────────   │  │
│  │  커버 이미지 │ v2.5.0 릴리즈 노트  │  │
│  │             │ ────────────────   │  │
│  └─────────────┴──────────────────┘  │
│                                        │
├──────────────────────────────────────┤
│  HMG/Footer                           │
└──────────────────────────────────────┘
```

### 7.3 HMG-DocsPage (Light)

HMG 타이포그래피 + 클린 레이아웃으로 문서 상세.

```
1440 × 900
┌──────────────────────────────────────┐
│  HMG/GNB                             │
├──────────────────────────────────────┤
│ ┌────────┬──────────────────┬──────┐ │
│ │        │                    │      │ │
│ │ 사이드  │  문서 콘텐츠        │ TOC  │ │
│ │ 네비   │                    │      │ │
│ │        │  ─ 제목 (40px)     │ 목차  │ │
│ │ 240px  │  ─ 뱃지            │ 이전  │ │
│ │        │  ─ 본문 (17px)     │ 다음  │ │
│ │ HMG    │  ─ 코드블록         │      │ │
│ │ navy   │  ─ 표              │ 200px│ │
│ │ 스타일  │                    │      │ │
│ │        │  fill_container    │      │ │
│ └────────┴──────────────────┴──────┘ │
└──────────────────────────────────────┘
```

**사이드바 HMG 스타일**:
- 배경: #FFFFFF (기존 #F8FAFC 대신)
- 우측 보더: 1px solid #eaeaea
- 메뉴 텍스트: 14px, #333, SpoqaHanSansNeo
- 활성 메뉴: #002C5F, weight 500, 좌측 3px 네이비 바
- 그룹 헤더: 13px, #949494, letter-spacing 0.3px, uppercase

### 7.4 HMG-StepGuide (Light) — Brand Home 2.0 스타일

H Chat 빠른 시작 가이드를 Brand Home 2.0 Registration Process 스타일로 재해석.

```
1440 × 1200
┌──────────────────────────────────────┐
│  HMG/GNB                             │
├──────────────────────────────────────┤
│  HMG/HeroBanner                       │
│  "H Chat 빠른 시작 가이드"              │
│  "설치부터 첫 대화까지 5단계"            │
├──────────────────────────────────────┤
│                                        │
│  Access & Sign up (섹션 제목)          │
│  ════════════════ (틸 수평선)           │
│                                        │
│  ┌─── 35% ───┬──── 65% ────────────┐ │
│  │            │                       │ │
│  │ ① 설치     │  ┌─────────────────┐ │ │
│  │   Chrome   │  │ Chrome 웹스토어  │ │ │
│  │   웹스토어  │  │ 설치 화면        │ │ │
│  │   접속     │  │ 스크린샷         │ │ │
│  │     ↓      │  │                 │ │ │
│  │ ② API 설정 │  │ ┌──┐ 틸 callout │ │ │
│  │   Settings │  │ └──┘           │ │ │
│  │   → API Key│  └─────────────────┘ │ │
│  │     ↓      │                       │ │
│  │ ③ 모델 선택│                       │ │
│  │     ↓      │                       │ │
│  │ ④ 첫 대화  │                       │ │
│  │     ↓      │                       │ │
│  │ ⑤ 기능탐색 │                       │ │
│  │            │                       │ │
│  └────────────┴───────────────────┘ │
│                                        │
├──────────────────────────────────────┤
│  HMG/Footer                           │
└──────────────────────────────────────┘
```

### 7.5 HMG-Dashboard (Light) — Brand Home 2.0 스타일

H Chat 사용 현황 대시보드를 Brand Home Welcome 화면 스타일로 재해석.

```
1440 × 900
┌──────────────────────────────────────┐
│  HMG/GNB (Brand Home 변형)            │
│  [H Chat 로고]  기능  가이드  설정     │
├──────────────────────────────────────┤
│                                        │
│  Welcome, 사용자님  (24px, #333)       │
│  H Chat v3.0.0 사용 현황 대시보드       │
│                                        │
│  ┌──────┬──────┬──────┬──────┐       │
│  │AI 채팅│그룹  │도구   │북마크 │       │  HMG/StatCard × 4
│  │      │채팅  │사용   │      │       │  4컬럼 그리드, gap 20px
│  │ 128  │  42  │  89  │  15  │       │
│  └──────┴──────┴──────┴──────┘       │
│                                        │
│  ┌─────────────────────────────┐     │
│  │  [🔍] H Chat 기능 검색...     │     │  검색바
│  └─────────────────────────────┘     │
│                                        │
│  [빠른 시작 가이드] ← 네이비 CTA        │
│  [문서 전체 보기]   ← 틸 Secondary     │
│                                        │
│  ┌──────────────────────────────┐    │
│  │                                │    │  히어로 이미지/캐러셀
│  │  H Chat v3 — 멀티 AI 어시스턴트 │    │  bg: #F5F5F5
│  │  7개 AI 모델, 12+ 도구          │    │  radius: 10px
│  │                                │    │  height: 320px
│  └──────────────────────────────┘    │
│                                        │
└──────────────────────────────────────┘
```

---

## 8. 다크 모드 대응

### 8.1 HMG 다크 모드 색상 매핑

| 역할 | Light | Dark |
|------|-------|------|
| 페이지 배경 | #FFFFFF | #111111 |
| 섹션 배경 | #f5f5f5 | #1a1a1a |
| 카드 배경 | #FFFFFF | #2a2a2a |
| GNB 배경 | #FFFFFF | #1f1f1f |
| 네이비 | #002C5F | #5B8FD4 (밝은 네이비) |
| 포인트 | #e15c39 | #FF7F5C (밝은 오렌지) |
| 제목 | #000000 | #f1f1f1 |
| 본문 | #111111 | #e0e0e0 |
| 캡션 | #949494 | #666666 |
| 보더 | #eaeaea | #333333 |
| 그림자 | rgba(0,0,0,0.1) | rgba(0,0,0,0.4) |
| 푸터 배경 | #1f1f1f | #0a0a0a |

### 8.2 다크 모드 화면 설정

.pen에서 각 Dark 화면은 `theme: { mode: "dark" }` 속성으로 변수 자동 전환됩니다. HMG 전용 변수를 테마 축으로 등록하면 Light/Dark 화면에서 자동 적용됩니다.

---

## 9. 구현 단계

### Phase 1: 변수 + 컴포넌트 정의 (1일)

| # | 작업 | 산출물 |
|---|------|--------|
| 1-1 | HMG 디자인 변수 18개 등록 (`set_variables`) | 테마 변수 (공식 11 + BH 7) |
| 1-2 | `HMG/PillButton` 컴포넌트 생성 | 재사용 컴포넌트 |
| 1-3 | `HMG/DownloadItem` 컴포넌트 생성 | 재사용 컴포넌트 |
| 1-4 | `HMG/TabFilter` 컴포넌트 생성 | 재사용 컴포넌트 |
| 1-5 | `HMG/GNBItem` 컴포넌트 생성 | 재사용 컴포넌트 |
| 1-6 | `HMG/GNB` 컴포넌트 생성 | 재사용 컴포넌트 |
| 1-7 | `HMG/HeroBanner` 컴포넌트 생성 | 재사용 컴포넌트 |
| 1-8 | `HMG/PublicationCard` 컴포넌트 생성 | 재사용 컴포넌트 |
| 1-9 | `HMG/Footer` 컴포넌트 생성 | 재사용 컴포넌트 |
| 1-10 | `HMG/StepNumber` 컴포넌트 생성 | Brand Home 스타일 |
| 1-11 | `HMG/StepItem` 컴포넌트 생성 | Brand Home 스타일 |
| 1-12 | `HMG/StepGuideSection` 컴포넌트 생성 | Brand Home 스타일 |
| 1-13 | `HMG/StatCard` 컴포넌트 생성 | Brand Home 스타일 |
| 1-14 | `HMG/CoverPage` 컴포넌트 생성 | Brand Home 스타일 |

### Phase 2: Light 화면 4개 (1.5일)

| # | 작업 | 산출물 |
|---|------|--------|
| 2-1 | `HMG-Home` 화면 조립 | GNB + Hero + 6카드 + Footer |
| 2-2 | `HMG-Publications` 화면 조립 | GNB + Hero + Tab + 2섹션 + Footer |
| 2-3 | `HMG-StepGuide` 화면 조립 | GNB + Hero + 2컬럼 스텝 가이드 + Footer |
| 2-4 | `HMG-Dashboard` 화면 조립 | GNB + Welcome + StatCards + 검색 + CTA |
| 2-5 | 스크린샷 검증 4회 | 시각적 품질 확인 |

### Phase 3: Dark 화면 4개 + 검증 (0.5일)

| # | 작업 | 산출물 |
|---|------|--------|
| 3-1 | Light 4화면 복제 → Dark 테마 적용 | 4개 Dark 화면 |
| 3-2 | 다크 모드 색상 미세 조정 (틸/네이비 밝기) | 가독성 최적화 |
| 3-3 | 전체 14화면 최종 검증 | 기존 6 + HMG 8 |

---

## 10. 기존 위키 ↔ HMG 스타일 비교

| 요소 | 기존 위키 | HMG 스타일 |
|------|----------|-----------|
| **강조색** | #2563EB (Blue) | #002C5F (Navy) + #e15c39 (Orange) |
| **폰트** | Inter | SpoqaHanSansNeo |
| **제목 크기** | 24-32px | 32-40px |
| **본문 크기** | 14px | 17px |
| **카드 라운드** | 8px | 10px |
| **카드 그림자** | 없음 | 0 0 10px rgba(0,0,0,0.1) |
| **버튼** | 사각형 (radius 8px) | 필 형태 (radius 30px) |
| **컨테이너** | padding 48-80px | padding 80px, max-width 1400px |
| **사이드바** | #F8FAFC bg, blue active | #FFF bg, navy active + 좌측 바 |
| **보더** | #E2E8F0 | #eaeaea |
| **다크 배경** | #111827 | #111111 |
| **GNB** | 없음 (사이드바만) | 80px 상단 고정 네비게이션 |

---

## 11. 예상 산출물 요약

| 항목 | 수량 |
|------|------|
| 새 디자인 변수 | 18개 (HMG 공식 11 + Brand Home 7) |
| 새 재사용 컴포넌트 | 13개 (HMG 공식 8 + Brand Home 5) |
| 새 화면 (Light + Dark) | 8개 (4 Light + 4 Dark) |
| wiki.pen 총 화면 수 | 14개 (기존 6 + HMG 8) |
| wiki.pen 총 재사용 컴포넌트 | 19개 (기존 6 + HMG 13) |
| 예상 소요 시간 | **3일** |

---

## 12. 디자인 소스별 적용 매핑

### 12.1 HMG 공식 사이트 → 적용 화면

| HMG 공식 요소 | 적용 화면 | 적용 컴포넌트 |
|--------------|----------|-------------|
| GNB (상단 네비) | 모든 HMG 화면 | `HMG/GNB`, `HMG/GNBItem` |
| 히어로 배너 (#f5f5f5) | HMG-Home, HMG-Publications | `HMG/HeroBanner` |
| 탭 필터 (하단 2px 활성) | HMG-Publications | `HMG/TabFilter` |
| 발행물 2컬럼 (이미지+리스트) | HMG-Publications | `HMG/PublicationCard`, `HMG/DownloadItem` |
| 필 버튼 (radius 30px) | 모든 HMG 화면 | `HMG/PillButton` |
| 다크 푸터 (#1f1f1f) | 모든 HMG 화면 | `HMG/Footer` |
| 카드 (radius 10px, 그림자) | HMG-Home | 인라인 |

### 12.2 Brand Home 2.0 → 적용 화면

| Brand Home 요소 | 적용 화면 | 적용 컴포넌트 |
|----------------|----------|-------------|
| 틸 스텝 번호 (원형 #00B4D8) | HMG-StepGuide | `HMG/StepNumber` |
| 스텝 항목 (번호+제목+설명+↓) | HMG-StepGuide | `HMG/StepItem` |
| 2컬럼 가이드 (좌 스텝, 우 스크린샷) | HMG-StepGuide | `HMG/StepGuideSection` |
| 섹션 제목 + 틸 수평선 | HMG-StepGuide | `HMG/StepGuideSection` 내부 |
| 통계 카드 (숫자+라벨) | HMG-Dashboard | `HMG/StatCard` |
| Welcome 대시보드 레이아웃 | HMG-Dashboard | 인라인 조합 |
| 베이지 커버/엔딩 (#D5CEBF) | 추후 확장 가능 | `HMG/CoverPage` |
| 네이비 Primary 버튼 (#002C5F) | HMG-Dashboard | `HMG/PillButton` variant |
| 틸 Secondary 버튼 (#00B4D8) | HMG-StepGuide, Dashboard | `HMG/PillButton` variant |

---

## 13. 참고: 디자인 소스 출처

### HMG 공식 사이트
- `hyundaimotorgroup.com/resources/assets/css/common.css` — 리셋, 폰트(SpoqaHanSansNeo), 타이포 클래스
- `hyundaimotorgroup.com/resources/assets/css/style.css` — 컴포넌트, 색상, 레이아웃, 버튼, 그리드
- `hyundaimotorgroup.com/ko/about-us/publications` — HTML 구조, JS 렌더링 로직
- HMG 브랜드 네이비 #002C5F — 공식 로고/GNB에서 추출

### Brand Home 2.0
- `bms.hmc.co.kr/assets/doc/Brand Home2.0_Registration Process.pdf` — 7페이지 PDF
  - p1: 커버 페이지 (베이지 #D5CEBF + 흰 카드)
  - p2: Access & Sign up (5스텝 + 2컬럼 레이아웃 + 틸 하이라이트)
  - p3: Activate account (이메일 인증 + Save 버튼 틸)
  - p4: Login OTP (Confirm 버튼 틸 + 입력 필드 스타일)
  - p5: Access Complete (대시보드: GNB + StatCards + 검색 + 히어로)
  - p6: Appendix External (라디오 버튼 + 승인/거부 버튼 패턴)
  - p7: EOD (엔딩 페이지, 베이지 배경)
