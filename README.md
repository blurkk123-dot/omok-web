# Omok Web

React, TypeScript, Vite로 만든 1인용 오목 웹앱입니다.

배포 주소: https://blurkk123-dot.github.io/omok-web/

## 기능

- 15x15 오목판
- 사용자 흑돌 vs AI 백돌
- 난이도: 초급, 중급, 고급
- 흑돌 33 금지, 44 금지, 장목 금지
- 정확히 5목일 때만 승리
- 마지막 착수 위치 하이라이트
- 반응형 SaaS 스타일 UI
- GitHub Pages 자동 배포 워크플로 포함

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

빌드 결과는 `dist` 폴더에 생성됩니다.

## GitHub Pages 설정

이 프로젝트는 저장소명이 `omok-web`인 경우를 기준으로 Vite `base`가 `/omok-web/`로 설정되어 있습니다.

1. GitHub 저장소 `Settings > Pages`로 이동합니다.
2. `Build and deployment` 소스를 `GitHub Actions`로 설정합니다.
3. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 빌드 및 배포합니다.

## 저장소 Push

```bash
git init
git branch -M main
git remote add origin https://github.com/blurkk123-dot/omok-web.git
git add .
git commit -m "Initial omok web app"
git push -u origin main
```
