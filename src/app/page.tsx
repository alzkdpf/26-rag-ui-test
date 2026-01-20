/**
 * Main Demo Page
 * Generate UI dynamically with Gemini + RAG
 */

'use client';

import { useState } from 'react';
import { SDUIRenderer } from '@/components/sdui/Renderer';
import { Button } from '@/components/ui/button';
import type { SDUIPage } from '@/types/sdui';

export default function HomePage() {
  const [prompt, setPrompt] = useState('카드 리스트를 만들고, 카드를 클릭하면 모달로 상세 정보를 보여줘');
  const [loading, setLoading] = useState(false);
  const [sduiSpec, setSduiSpec] = useState<SDUIPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<string>('');

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setReasoning('');

    try {
      const response = await fetch('/api/generate-ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate UI');
      }

      setSduiSpec(data.sduiSpec);
      setReasoning(data.reasoning);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-zinc-900 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SDUI + RAG + Gemini
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Server-Driven UI with Qdrant RAG and Gemini Function Calling
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <a
              href="/demo/static"
              className="text-sm px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              📦 Static Demo
            </a>
            <a
              href="http://localhost:6333/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              🗄️ Qdrant Dashboard
            </a>
          </div>
        </div>

        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8">
            <label className="block text-sm font-medium mb-3">UI 요청사항</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
              rows={3}
              placeholder="예: 상품 카드 리스트를 만들고, 클릭하면 모달로 상세를 보여줘"
            />

            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full mt-4 h-12 text-base font-medium"
            >
              {loading ? '⚙️ Generating with Gemini...' : '✨ Generate UI with RAG'}
            </Button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">❌ {error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {sduiSpec && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">🎨 생성된 UI</h2>
            <SDUIRenderer spec={sduiSpec} />

            {/* Debug Info */}
            {reasoning && (
              <details className="mt-8 bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-lg">
                <summary className="font-medium cursor-pointer">🔍 Gemini Reasoning & Tool Calls</summary>
                <pre className="mt-4 text-xs overflow-auto bg-zinc-100 dark:bg-zinc-800 p-4 rounded">
                  {reasoning}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Setup Instructions */}
        {!sduiSpec && !loading && (
          <div className="max-w-2xl mx-auto mt-12 bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-lg">
            <h3 className="font-semibold mb-3">📋 시작하기</h3>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Qdrant 실행: <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">docker-compose up -d</code></li>
              <li>RAG 데이터 시딩: <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">npm run seed:qdrant</code></li>
              <li>.env.local 설정 (GEMINI_API_KEY 필수)</li>
              <li>위 입력창에 UI 요청사항을 입력하고 생성!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

