# 다국어 지원 (i18n)

H Chat의 다국어 지원 시스템 패키지입니다.

## 사용 앱

- 모든 앱 (wiki, hmg, admin, user)

## 설치

```bash
npm install @hchat/ui
```

## 사용 예시

### 1. 앱에 Provider 설정

```tsx
import { I18nProvider } from '@hchat/ui/i18n';

export default function RootLayout({ children }) {
  return (
    <I18nProvider defaultLocale="ko">
      {children}
    </I18nProvider>
  );
}
```

### 2. 컴포넌트에서 사용

```tsx
import { useI18n } from '@hchat/ui/i18n';

export default function MyComponent() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div>
      <h1>{t('common.title')}</h1>
      <button onClick={() => setLocale('en')}>
        {t('language.english')}
      </button>
    </div>
  );
}
```

### 3. 언어 토글

```tsx
import { LanguageToggle } from '@hchat/ui/i18n';

export default function Header() {
  return (
    <header>
      <LanguageToggle />
    </header>
  );
}
```

## 내보내기

| 항목 | 설명 |
|-----|------|
| **I18nProvider** | 다국어 Context Provider |
| **useI18n** | 다국어 Hook |
| **LanguageToggle** | 언어 선택 토글 컴포넌트 |
| **Locale** | 로케일 타입 |
| **TranslationKey** | 번역 키 타입 |

## 지원 언어

- **ko** — 한국어 (기본값)
- **en** — 영어

## 특징

- TypeScript 완전 지원
- 타입 안전 번역 키
- Context API 기반
- 번역 로드 불필요 (번들 포함)

## 구현 세부사항

번역은 `ko.ts`에서 관리되며 모든 언어 팩이 번들에 포함됩니다.

## 최근 업데이트

### Phase 23: 성능 최적화
- **Bundle Analysis**: 언어 팩 최적화로 번들 크기 최소화
- **Turbo Cache**: i18n 변경 시 필요한 앱만 리빌드

### Phase 24: CI/CD 파이프라인
- **Type Checking**: 번역 키 타입 안정성 CI 검증
- **코드 품질**: Prettier로 번역 파일 일관된 포맷팅

### Phase 25: 통합 테스트
- **E2E 테스트**: 다국어 전환 시나리오 검증

### Phase 26: Storybook 완성
- **103개 스토리**: 전체 UI 컴포넌트 97% 커버리지
- **Shared 카테고리**: LanguageToggle 스토리 포함
- **Storybook URL**: https://hchat-wiki-storybook.vercel.app
