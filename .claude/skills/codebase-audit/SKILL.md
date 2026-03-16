---
name: codebase-audit
description: 프로젝트를 5개 영역(아키텍처, 코드 품질, 보안, 테스트, 빌드)으로 병렬 감사합니다. 각 영역별 점수와 CRITICAL/HIGH/MEDIUM 이슈를 산출합니다.
---

# Codebase Audit

5개 영역 병렬 감사로 프로젝트 건강도를 종합 평가합니다.

## 활성화 시점

- Phase 전환 시 품질 검증
- 정기 감사 (월 1회 권장)
- 대규모 PR 머지 전
- 기술 부채 해소 계획 수립 시

## 5영역 감사 체계

### 1. 아키텍처 (가중치 25%)

**측정 항목:**
- 패키지 의존성 순환 여부
- 파일 크기 (800줄 초과 파일 수)
- packages/ui 파일 수 (과대 여부)
- 앱 간 직접 import 여부 (금지)
- 디자인 토큰 일관성

**명령어:**
```bash
npx tsc --noEmit  # 타입 에러
find packages/ui/src -name "*.tsx" | wc -l  # UI 파일 수
```

### 2. 코드 품질 (가중치 20%)

**측정 항목:**
- `any` 타입 사용 수 (0개 목표)
- 중복 코드 (300줄 이내)
- 평균 파일 크기 (100줄 이하 권장)
- console.log 잔존 수
- 패턴 일관성 (Service Provider 패턴 준수)

**명령어:**
```bash
grep -r "any" packages/ui/src --include="*.ts" --include="*.tsx" -l
grep -rn "console\.log" packages/ui/src --include="*.ts" --include="*.tsx"
```

### 3. 보안 (가중치 25%)

**측정 항목:**
- 하드코딩된 시크릿 (API 키, 토큰)
- PII 노출 위험 코드
- Zod 검증 누락 엔드포인트
- CSP 헤더 설정 여부
- 블록리스트 적용 여부

**명령어:**
```bash
grep -rn "sk-\|AKIA\|password.*=.*'" packages/ apps/ --include="*.ts"
```

### 4. 테스트 (가중치 20%)

**측정 항목:**
- Statement 커버리지 (89.24% 현재)
- Branch 커버리지 (81.2% 현재)
- 테스트 파일 수 대 소스 파일 수 비율
- Flaky 테스트 비율
- E2E 통과율

**명령어:**
```bash
npx vitest run --reporter=json
npm run test:coverage -- --reporter=json
```

### 5. 빌드/인프라 (가중치 10%)

**측정 항목:**
- 빌드 성공률 (9/9 앱)
- 번들 크기 변화
- 타입 에러 수
- Turbo 캐시 히트율
- 빌드 시간

**명령어:**
```bash
npx turbo build --filter='@hchat/*'
```

## 병렬 실행 패턴

Agent tool로 5개 Worker를 병렬 실행:

```
PM (이 스킬)
  ├── Agent W1: "아키텍처 분석" (Grep, Glob으로 의존성/파일 크기 검사)
  ├── Agent W2: "코드 품질 분석" (Grep으로 any/console.log/중복 검사)
  ├── Agent W3: "보안 분석" (Grep으로 시크릿/PII 스캔)
  ├── Agent W4: "테스트 분석" (Bash로 커버리지 실행)
  └── Agent W5: "빌드 분석" (Bash로 빌드 실행)
→ PM이 5개 결과 통합 → 점수 + 이슈 목록
```

## 등급 기준

| 등급 | 점수 | 의미 |
|------|------|------|
| A | 90-100 | 우수 |
| B+ | 80-89 | 양호 |
| B | 70-79 | 보통 |
| C+ | 60-69 | 미흡 |
| C | 50-59 | 부족 |
| D/F | <50 | 위험 |

## 이슈 분류

| 분류 | 대응 시점 | 예시 |
|------|---------|------|
| **CRITICAL** | 즉시 수정 | 시크릿 노출, 인증 우회 |
| **HIGH** | 이번 스프린트 | 커버리지 임계값 미달, any 사용 |
| **MEDIUM** | 다음 스프린트 | 대형 파일, 중복 코드 |

## 참조 문서

- `docs/DEEP_ANALYSIS_REPORT_v3.md` — 이전 감사 결과
- `docs/DEEP_ANALYSIS_REPORT_2026-03-08.md` — 최신 감사 결과
