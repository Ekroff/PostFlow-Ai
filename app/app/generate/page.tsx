'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, Send } from 'lucide-react';

const FORMATS = ['Insight post', 'Story post', 'List post', 'Controversial take', 'How-to guide', 'Thread'];
const TONES = ['Professional', 'Conversational', 'Inspirational', 'Educational', 'Bold'];
const LENGTHS = [
  { value: 'short', label: 'Short (<150w)' },
  { value: 'medium', label: 'Medium (150–300w)' },
  { value: 'long', label: 'Long (300–500w)' },
];
const HOOKS = ['Personal story', 'Bold statement', 'Question', 'Data/stat', 'Contrarian'];

interface PostVariation {
  id: number;
  content: string;
  char_count: number;
  hook_type: string;
  hashtags: string[];
}

interface GeneratedPost {
  id?: string;
  content: string;
}

export default function GeneratePage() {
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState(FORMATS[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState('medium');
  const [hookStyle, setHookStyle] = useState('');
  const [sourceContent, setSourceContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [variations, setVariations] = useState<PostVariation[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, format, tone, length, hookStyle, sourceContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setPosts(data.posts || []);
      setVariations(data.variations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content: string, idx: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitForReview = async (postId: string) => {
    await fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_review' }),
    });
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: 'in_review' } : p))
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Generate Posts</h1>
        <p className="mt-1 text-gray-600">
          Create AI-powered LinkedIn posts that match your brand voice.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Topic / Idea *
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What do you want to post about? e.g. 'Why cold outreach fails' or 'Our product launch lessons'"
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0077b5] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Format</label>
                <div className="flex flex-wrap gap-2">
                  {FORMATS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${format === f ? 'bg-[#0077b5] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tone === t ? 'bg-[#0077b5] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Length</label>
                <div className="flex gap-2">
                  {LENGTHS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLength(l.value)}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${length === l.value ? 'bg-[#0077b5] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Hook style (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {HOOKS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHookStyle(hookStyle === h ? '' : h)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${hookStyle === h ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Source content (optional)
                </label>
                <textarea
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  placeholder="Paste an article, blog post, or notes to draw content from..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0077b5] focus:outline-none"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0077b5] px-4 py-3 font-semibold text-white hover:bg-[#006097] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate 3 Variations
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {posts.length === 0 && !loading && (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white text-center">
              <Sparkles className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-gray-500">Your generated posts will appear here</p>
              <p className="mt-1 text-sm text-gray-400">Fill in the form and click Generate</p>
            </div>
          )}

          {loading && (
            <div className="flex h-64 items-center justify-center rounded-xl bg-white">
              <div className="text-center">
                <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#0077b5]" />
                <p className="text-gray-600">Generating your posts...</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {posts.map((post, idx) => {
              const variation = variations[idx];
              return (
                <div key={post.id || idx} className="rounded-xl bg-white p-6 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#0077b5]">
                        Variation {idx + 1}
                      </span>
                      {variation?.hook_type && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                          {variation.hook_type.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {variation?.char_count || post.content.length} chars
                    </span>
                  </div>

                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                    {post.content}
                  </pre>

                  {variation?.hashtags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {variation.hashtags.map((tag, ti) => (
                        <span key={ti} className="text-xs text-[#0077b5]">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleCopy(post.content, idx)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      {copiedId === idx ? (
                        <><Check className="h-3.5 w-3.5 text-green-600" /> Copied</>
                      ) : (
                        <><Copy className="h-3.5 w-3.5" /> Copy</>
                      )}
                    </button>
                    {post.id && (
                      <button
                        onClick={() => handleSubmitForReview(post.id!)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#0077b5] px-3 py-1.5 text-sm text-white hover:bg-[#006097]"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Submit for review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
