'use client';

import { useState } from 'react';
import { Zap, Copy, Check, ArrowRight, Loader2 } from 'lucide-react';

type PostFormat = 'story' | 'insight' | 'list' | 'hot_take' | 'how_to' | 'behind_the_scenes' | 'poll' | 'engagement';
type PostTone = 'professional' | 'conversational' | 'bold' | 'inspirational' | 'educational';
type PostLength = 'short' | 'medium' | 'long' | 'thread';

interface Variation {
  id: number;
  content: string;
  char_count: number;
  hook_type: string;
  hashtags: string[];
}

interface GenerateResult {
  variations: Variation[];
  voice_match_score: number;
  usage?: { current: number; limit: number };
}

export default function GeneratePage() {
  const [form, setForm] = useState({
    post_format: 'insight' as PostFormat,
    topic_text: '',
    tone: 'professional' as PostTone,
    length: 'medium' as PostLength,
    source_content: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.topic_text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSelectedVariation(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Generation failed');
      } else {
        setResult(data);
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendForReview(variation: Variation) {
    setSaving(true);
    try {
      // Save as draft
      const createRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: variation.content,
          format_type: form.post_format,
          topic_text: form.topic_text,
          hashtags: variation.hashtags,
          char_count: variation.char_count,
        }),
      });
      const { post } = await createRes.json();

      // Move to in_review
      await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_review' }),
      });

      setSaved(true);
    } catch {
      setError('Failed to save post');
    } finally {
      setSaving(false);
    }
  }

  function handleCopy(variation: Variation) {
    navigator.clipboard.writeText(variation.content);
    setCopiedId(variation.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="text-blue-700" size={24} /> Generate LinkedIn Post
        </h1>
        <p className="text-gray-500 mt-1">
          AI creates 3 post variations tailored to your voice profile.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Post Format
              </label>
              <select
                value={form.post_format}
                onChange={(e) => setForm({ ...form, post_format: e.target.value as PostFormat })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(['story', 'insight', 'list', 'hot_take', 'how_to', 'behind_the_scenes', 'poll', 'engagement'] as PostFormat[]).map((f) => (
                  <option key={f} value={f}>
                    {f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Topic / Idea <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.topic_text}
                onChange={(e) => setForm({ ...form, topic_text: e.target.value })}
                placeholder="e.g. 'How we doubled our demo-to-close rate by fixing our follow-up sequence'"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-400 mt-1">{form.topic_text.length}/500</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tone</label>
                <select
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value as PostTone })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['professional', 'conversational', 'bold', 'inspirational', 'educational'].map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Length</label>
                <select
                  value={form.length}
                  onChange={(e) => setForm({ ...form, length: e.target.value as PostLength })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="short">Short (&lt;150 words)</option>
                  <option value="medium">Medium (150–300)</option>
                  <option value="long">Long (300–500)</option>
                  <option value="thread">Thread (5–7 posts)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Source content <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.source_content}
                onChange={(e) => setForm({ ...form, source_content: e.target.value })}
                placeholder="Paste an article, quote, data point, or URL to use as context..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.topic_text.trim()}
              className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating 3 variations...
                </>
              ) : (
                <>
                  <Zap size={18} /> Generate Post
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-gray-500 text-sm">
                Fill in the form and click Generate to see 3 AI-crafted post variations.
              </p>
            </div>
          )}

          {result && (
            <>
              {result.usage && (
                <div className="text-xs text-gray-500 text-right">
                  Usage: {result.usage.current}/{result.usage.limit} this month
                </div>
              )}

              {result.variations?.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVariation(v.id === selectedVariation?.id ? null : v)}
                  className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                    selectedVariation?.id === v.id
                      ? 'border-blue-600 shadow-md shadow-blue-100'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Variation {v.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        v.char_count > 3000 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {v.char_count} chars
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(v); }}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {copiedId === v.id ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap line-clamp-6">
                    {v.content}
                  </p>
                  {v.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {v.hashtags.map((h) => (
                        <span key={h} className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}

                  {selectedVariation?.id === v.id && (
                    <div className="mt-4 pt-4 border-t border-blue-100">
                      {saved ? (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                          <Check size={16} /> Sent to review queue!
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSendForReview(v); }}
                          disabled={saving}
                          className="flex items-center gap-2 bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
                        >
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                          Send for review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
