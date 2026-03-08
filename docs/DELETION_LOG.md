# 코드 삭제 로그

## [2024-03-08] 리팩토링 세션 - 루트 레벨 중복 제거

### 삭제된 사용되지 않는 파일
#### 루트 components/ 디렉토리 (17개 파일)
- components/Badge.tsx - 중복: apps/wiki/components/Badge.tsx와 동일
- components/Breadcrumb.tsx - 중복: apps/wiki/components/Breadcrumb.tsx와 동일
- components/DocsLayout.tsx - 중복: apps/wiki/components/DocsLayout.tsx와 동일
- components/FeatureCard.tsx - 중복: apps/wiki/components/FeatureCard.tsx와 동일
- components/HomePage.tsx - 중복: apps/wiki/components/HomePage.tsx와 동일
- components/MarkdownRenderer.tsx - 중복: apps/wiki/components/MarkdownRenderer.tsx와 동일
- components/NavGroupHeader.tsx - 중복: apps/wiki/components/NavGroupHeader.tsx와 동일
- components/NavItem.tsx - 중복: apps/wiki/components/NavItem.tsx와 동일
- components/PageNavigation.tsx - 중복: apps/wiki/components/PageNavigation.tsx와 동일
- components/SearchBar.tsx - 중복: apps/wiki/components/SearchBar.tsx와 동일
- components/Sidebar.tsx - 중복: apps/wiki/components/Sidebar.tsx와 동일
- components/TableOfContents.tsx - 중복: apps/wiki/components/TableOfContents.tsx와 동일
- components/ThemeProvider.tsx - 중복: apps/wiki/components/ThemeProvider.tsx와 동일
- components/ThemeToggle.tsx - 중복: apps/wiki/components/ThemeToggle.tsx와 동일
- components/admin/ - 디렉토리 전체 (미사용, packages/ui/src/admin에 이미 존재)

#### 루트 stories/ 디렉토리 (하위 파일 포함)
- stories/atoms/ - 전체 디렉토리 (apps/storybook/stories/atoms/와 중복)
- stories/molecules/ - 전체 디렉토리 (apps/storybook/stories/molecules/와 중복)
- stories/organisms/ - 전체 디렉토리 (apps/storybook/stories/organisms/와 중복)
- stories/admin/ - 전체 디렉토리 (apps/storybook/stories/admin/와 중복)
- stories/fixtures/ - 전체 디렉토리 (미사용)

### 통합된 중복 코드
- 루트 components/ → apps/wiki/components/ (wiki 앱이 실제 사용)
- 루트 stories/ → apps/storybook/stories/ (storybook 앱이 실제 사용)
- 이유: 모노레포 전환 시 남은 잔재물, 실제로는 각 앱 디렉토리의 파일만 사용됨

### 영향
- 삭제된 파일: ~40개
- 제거된 코드 라인: ~2,000
- 디렉토리 구조 간소화
- 빌드 시간 개선 예상

### 테스팅
- [x] Wiki 빌드 성공 (Next.js 16.1.6, 31개 페이지)
- [x] HMG 빌드 성공 (6개 페이지)
- [x] Admin 빌드 성공 (30개 페이지)
- [x] User 빌드 성공 (7개 페이지)
- [x] 빌드 시간 개선: wiki 5.878s → 3.701s (37% 개선)
- [ ] 모든 단위 테스트 통과
- [ ] 모든 통합 테스트 통과
- [ ] 수동 테스트 완료

### 제거된 사용되지 않는 의존성
- @hchat/wiki package.json: @hchat/ui 제거 (자체 컴포넌트만 사용)
  - wiki 앱은 자체 components/ 디렉토리의 컴포넌트만 사용
  - 다른 앱들은 @hchat/ui 정상 사용 중

### 미사용 의존성 분석 결과
- @hchat/wiki: @hchat/ui 성공적으로 제거
- 빌드 시간: 5.878s → 3.701s (37% 개선)