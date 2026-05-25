# 26-rag-ui-test

rag 를 주입 받아서 ai 기반으로 컴포넌트 생성 테스트

## Overview

- Repository: [alzkdpf/26-rag-ui-test](https://github.com/alzkdpf/26-rag-ui-test)
- Visibility: Public
- Last updated: 2026-01-20
- Main stack: TypeScript, Node.js, Next.js, React, Docker

## Project Structure

```text
.gitignore
README.md
components.json
docker-compose.yml
eslint.config.mjs
next.config.ts
package-lock.json
package.json
postcss.config.mjs
public/file.svg
public/globe.svg
public/next.svg
public/vercel.svg
public/window.svg
scripts/debug-env.ts
scripts/seed-qdrant.ts
scripts/test-gemini.ts
spec.md
src/app/favicon.ico
src/app/globals.css
src/app/layout.tsx
src/app/page.tsx
src/hooks/useSDUIState.ts
src/lib/utils.ts
src/types/sdui.ts
tsconfig.json
```

## Getting Started

Install dependencies or prepare the project:

```bash
npm install
```

Run the common development command:

```bash
npm run dev
```

## Available Scripts

- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`
- `lint`: `eslint`
- `seed:qdrant`: `tsx scripts/seed-qdrant.ts`

## Notes

- This README was generated from the repository metadata and file structure.
- Update this document when setup steps, deployment targets, or project ownership changes.
