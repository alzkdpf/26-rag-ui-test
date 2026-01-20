# SDUI+RAG+Gemini 프로젝트

shadcn/ui 기반 카드 리스트와 모달을 RAG와 Gemini Function Calling으로 동적 생성하는 Server-Driven UI 시스템입니다.

## 실행 방법

### 1. Ollama 설치 및 임베딩 모델 설정

```bash
# Ollama 설치 (macOS)
brew install ollama

# 임베딩 모델 다운로드 (nomic-embed-text, 768차원)
ollama pull nomic-embed-text

# Ollama 서버 확인
ollama list
```

### 2. 환경 설정

```bash
# .env.local 파일 생성 (.env.local.example 참고)
cp .env.local.example .env.local

# Ollama URL은 기본값 사용 (localhost:11434)
# Gemini API 키는 동적 생성 기능 사용 시에만 필요
```

### 3. Qdrant 실행 (로컬 Docker)

```bash
docker-compose up -d
```

Qdrant 대시보드: http://localhost:6333/dashboard

### 4. RAG 데이터 시딩

```bash
npm run seed:qdrant
```

이 스크립트는 다음을 Qdrant에 저장합니다:
- **Component Specs**: shadcn Card, Dialog 컴포넌트 (4개)
- **Capability Manifests**: modal.open, modal.close, state.set (3개)
- **Interaction Examples**: 카드 클릭→모달 패턴 (1개)
- **Embeddings**: Ollama nomic-embed-text 로컬 생성 (768차원)

### 5. 개발 서버 실행

```bash
npm run dev
```

- 메인 페이지: http://localhost:3000
- 정적 데모: http://localhost:3000/demo/static

## 핵심 개념

### 1. SDUI (Server-Driven UI)
서버에서 JSON으로 UI 명세를 내려주면 클라이언트가 렌더링하는 방식입니다.

### 2. RAG (Retrieval-Augmented Generation)
Qdrant에 저장된 3가지 데이터로 Gemini가 정확한 UI를 생성합니다:
- Component Specs, Capability Manifests, Interaction Examples

### 3. Ollama Local Embeddings
**완전히 로컬에서 동작**, API 키 불필요:
- nomic-embed-text 모델 (768 dimensions)
- HTTP API로 간편한 통합
- 무료, 빠른 응답속도

