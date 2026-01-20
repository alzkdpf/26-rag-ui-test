# SDUI+RAG+Gemini 프로젝트

shadcn/ui 기반 카드 리스트와 모달을 RAG와 Gemini Function Calling으로 동적 생성하는 Server-Driven UI 시스템입니다.

## 실행 방법

### 1. 환경 설정

```bash
# .env.local 파일 생성 (.env.local.example 참고)
cp .env.local.example .env.local

# GEMINI_API_KEY 설정
# https://aistudio.google.com/app/apikey 에서 키 발급
```

### 2. Qdrant 실행 (로컬 Docker)

```bash
docker-compose up -d
```

Qdrant 대시보드: http://localhost:6333/dashboard

### 3. RAG 데이터 시딩

```bash
npm run seed:qdrant
```

이 스크립트는 다음을 Qdrant에 저장합니다:
- **Component Specs**: shadcn Card, Dialog 컴포넌트
- **Capability Manifests**: modal.open, modal.close, state.set
- **Interaction Examples**: 카드 클릭→모달 패턴

### 4. 개발 서버 실행

```bash
npm run dev
```

- 메인 페이지: http://localhost:3000
- 정적 데모: http://localhost:3000/demo/static

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                      # Gemini 동적 UI 생성 페이지
│   ├── demo/static/page.tsx          # 정적 SDUI 데모
│   └── api/generate-ui/route.ts      # Gemini API 엔드포인트
├── components/
│   ├── sdui/
│   │   ├── Renderer.tsx              # SDUI JSON → React 렌더러
│   │   └── ActionDispatcher.tsx      # Capability 실행 엔진
│   └── ui/                           # shadcn 컴포넌트
├── lib/
│   ├── qdrant/
│   │   ├── schema.ts                 # 컬렉션 정의
│   │   └── client.ts                 # Qdrant 클라이언트
│   └── gemini/
│       ├── tools.ts                  # Function Calling 도구
│       └── client.ts                 # Gemini 생성 로직
├── hooks/
│   └── useSDUIState.ts               # SDUI 상태 관리
└── types/
    └── sdui.ts                       # SDUI 타입 정의
```

## 핵심 개념

### 1. SDUI (Server-Driven UI)
서버에서 JSON으로 UI 명세를 내려주면 클라이언트가 렌더링하는 방식입니다.

### 2. RAG (Retrieval-Augmented Generation)
Qdrant에 저장된 3가지 데이터로 Gemini가 정확한 UI를 생성합니다:
- Component Specs, Capability Manifests, Interaction Examples

### 3. Gemini Function Calling
Gemini가 `qdrant_search` 툴로 RAG 데이터를 검색하고 최종 JSON을 생성합니다.
