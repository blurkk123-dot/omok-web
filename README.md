# Omok Web

React, TypeScript, Vite로 만든 1인용 오목 웹앱입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 로컬 빌드

```bash
npm run build
```

로컬 개발, 로컬 빌드, Vercel 배포에서는 Vite `base`가 `/`로 동작합니다.

## GitHub Pages 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 빌드하고 GitHub Pages에 배포합니다.

배포 주소:

https://blurkk123-dot.github.io/omok-web/

GitHub Pages 빌드에서는 워크플로가 `GITHUB_PAGES=true` 환경변수를 설정하므로 Vite `base`가 `/omok-web/`로 바뀝니다.

GitHub 저장소에서 `Settings > Pages > Build and deployment > Source`를 `GitHub Actions`로 설정해야 합니다.

## Vercel 배포

1. Vercel에서 `Import Git Repository`를 선택합니다.
2. GitHub App 권한이 필요하면 Vercel 화면에서 `Install`을 눌러 `blurkk123-dot` 계정의 `omok-web` 저장소 접근 권한을 허용합니다.
3. `Framework Preset`: `Vite`
4. `Build Command`: `npm run build`
5. `Output Directory`: `dist`

별도 환경변수를 설정하지 않으면 Vercel에서는 Vite `base`가 `/`로 유지됩니다.

## 기능

- 15x15 오목판
- 사용자 흑돌 vs AI 백돌
- 난이도: 초급, 중급, 고급
- 흑돌 33 금지, 44 금지, 장목 금지
- 정확히 5목일 때만 승리
- 마지막 착수 위치 하이라이트
- 반응형 SaaS 스타일 UI
- GitHub Pages 자동 배포 워크플로 포함
