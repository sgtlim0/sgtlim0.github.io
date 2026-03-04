# 배포 가이드

## 배포 구성

| 앱 | 플랫폼 | URL | 빌드 출력 |
|---|---|---|---|
| Wiki | GitHub Pages | https://sgtlim0.github.io | apps/wiki/out/ |
| Admin | Vercel | https://hchat-admin.vercel.app | apps/admin/out/ |
| HMG | Vercel | https://hchat-hmg.vercel.app | apps/hmg/out/ |
| User | Vercel | https://hchat-user.vercel.app | apps/user/out/ |
| LLM Router | Vercel | https://hchat-llm-router.vercel.app | apps/llm-router/out/ |
| Storybook | Vercel | https://hchat-wiki-storybook.vercel.app | apps/storybook/storybook-static/ |
| Desktop | Vercel | https://hchat-desktop.vercel.app | 별도 레포 |

## GitHub Pages (Wiki)

자동 배포: `main` 브랜치 push 시 GitHub Actions 실행

```yaml
# .github/workflows/deploy.yml
# 1. npm ci → npm run build:wiki
# 2. apps/wiki/out/ 업로드
# 3. GitHub Pages 배포
```

수동 배포:
```bash
npm run build:wiki
# apps/wiki/out/ 디렉터리를 GitHub Pages로 배포
```

## Vercel 배포

### 프로젝트 설정

각 앱의 Vercel 프로젝트에서:

| 설정 | 값 |
|------|-----|
| Framework Preset | Next.js |
| Root Directory | `apps/{app-name}` |
| Build Command | `cd ../.. && npm run build:{app-name}` |
| Output Directory | `out` (Storybook: `storybook-static`) |
| Install Command | `cd ../.. && npm install` |
| Node.js Version | 20.x |

### Vercel 프로젝트 ID

| 앱 | Project ID |
|---|---|
| Admin | prj_BtEKO3x5YbouoVzbBpRz0UwUGX0T |
| HMG | prj_fIbBTBn8ZcGboUA7Qoh4hKSN7W4D |
| Storybook | prj_ph1s0WIzDD26kTiCjdk5ziS4o6O6 |
| User | prj_fJMm97bMqLg7OaGvncRz2ZptuCeY |
| LLM Router | prj_Zj2K8lV0kDLAbMudNWSTaIDQI4U1 |

Organization ID: `team_iAudQ49Wg9oLaasQxlbsMV7o`

### 자동 배포 흐름

```
git push origin main
  → Vercel 감지
  → 각 프로젝트별 빌드
  → 배포 완료 (보통 1-2분)
```

### 수동 배포

```bash
# Vercel CLI 사용
npx vercel --prod
```

## Static Export 설정

모든 Next.js 앱은 Static Export 모드 사용:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',          // Static HTML 생성 (앱 레벨 package.json에서 설정)
  images: { unoptimized: true }, // Static Export 시 이미지 최적화 불가
  transpilePackages: ['@hchat/ui', '@hchat/tokens'],
}
```

## 환경 변수

현재 필수 환경 변수 없음 (모든 데이터가 mock).

향후 API 연동 시:
```env
# Admin
NEXT_PUBLIC_API_URL=https://api.hchat.ai
API_SECRET_KEY=sk-xxx

# LLM Router
NEXT_PUBLIC_LLM_API_URL=https://llm.hchat.ai
```

## 문제 해결

### Vercel 빌드 실패
1. Root Directory 설정 확인 (`apps/{app-name}`)
2. Install Command가 모노레포 루트에서 실행되는지 확인
3. Node.js 버전 20.x 확인

### 일일 배포 한도
Vercel 무료 플랜은 일일 배포 횟수 제한. 한도 초과 시 다음 날 자동 리셋 후 재배포.

### 캐시 문제
```bash
# Turbo 캐시 초기화
npx turbo run build --force
```
