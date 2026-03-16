'use client';

import { useState, useEffect } from 'react';
import { Linkedin, Loader2, CheckCircle, XCircle, Save } from 'lucide-react';
import type { BrandProfile } from '@/types/database';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Partial<BrandProfile>>({});
  const [samplePosts, setSamplePosts] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [analyzeSuccess, setAnalyzeSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/brand-profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setProfile(d.profile);
          setSamplePosts(d.profile.sample_posts_raw || '');
        }
      });
  }, []);

  const handleAnalyze = async () => {
    if (!samplePosts.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/voice/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samplePosts }),
      });
      const data = await res.json();
      if (data.profile) {
        setProfile((prev) => ({ ...prev, ...data.profile, sample_posts_raw: samplePosts }));
        setAnalyzeSuccess(true);
        setTimeout(() => setAnalyzeSuccess(false), 3000);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/brand-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, sample_posts_raw: samplePosts }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Check LinkedIn connection status from URL params
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const linkedinStatus = searchParams?.get('linkedin');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Configure your brand voice and integrations.</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* LinkedIn Connection */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Linkedin className="h-5 w-5 text-[#0077b5]" />
            LinkedIn Connection
          </h2>
          {linkedinStatus === 'connected' && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              LinkedIn connected successfully!
            </div>
          )}
          {linkedinStatus === 'error' && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <XCircle className="h-4 w-4" />
              Failed to connect LinkedIn. Please try again.
            </div>
          )}
          <a
            href="/api/auth/linkedin"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0077b5] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#006097]"
          >
            <Linkedin className="h-4 w-4" />
            {linkedinStatus === 'connected' ? 'Reconnect LinkedIn' : 'Connect LinkedIn Account'}
          </a>
        </div>

        {/* Brand Voice Profile */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">Brand Voice Profile</h2>
          <p className="mb-5 text-sm text-gray-500">
            Help our AI match your writing style by providing sample posts and profile details.
          </p>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Product/Company Name
                </label>
                <input
                  type="text"
                  value={profile.product_name || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, product_name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0077b5] focus:outline-none"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Primary Audience
                </label>
                <input
                  type="text"
                  value={profile.primary_audience || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, primary_audience: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0077b5] focus:outline-none"
                  placeholder="B2B SaaS founders"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Product Description
              </label>
              <textarea
                value={profile.product_description || ''}
                onChange={(e) => setProfile((p) => ({ ...p, product_description: e.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0077b5] focus:outline-none"
                placeholder="What does your product/company do?"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Tone (1 = Formal, 5 = Casual)
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Formal</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={profile.tone_score || 3}
                  onChange={(e) => setProfile((p) => ({ ...p, tone_score: parseInt(e.target.value) }))}
                  className="flex-1 accent-[#0077b5]"
                />
                <span className="text-xs text-gray-500">Casual</span>
                <span className="w-6 text-center text-sm font-semibold text-[#0077b5]">
                  {profile.tone_score || 3}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Sentence Length
                </label>
                <select
                  value={profile.avg_sentence_length || 'medium'}
                  onChange={(e) => setProfile((p) => ({ ...p, avg_sentence_length: e.target.value as 'short' | 'medium' | 'long' }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0077b5] focus:outline-none"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Emoji Usage</label>
                <select
                  value={profile.emoji_usage || 'minimal'}
                  onChange={(e) => setProfile((p) => ({ ...p, emoji_usage: e.target.value as 'none' | 'minimal' | 'moderate' | 'heavy' }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0077b5] focus:outline-none"
                >
                  <option value="none">None</option>
                  <option value="minimal">Minimal</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">CTA Style</label>
                <select
                  value={profile.cta_style || 'soft'}
                  onChange={(e) => setProfile((p) => ({ ...p, cta_style: e.target.value as 'soft' | 'direct' | 'question' }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0077b5] focus:outline-none"
                >
                  <option value="soft">Soft</option>
                  <option value="direct">Direct</option>
                  <option value="question">Question</option>
                </select>
              </div>
            </div>

            {/* Sample posts for AI analysis */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Sample LinkedIn Posts (for AI voice analysis)
              </label>
              <textarea
                value={samplePosts}
                onChange={(e) => setSamplePosts(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0077b5] focus:outline-none"
                placeholder="Paste 3-10 of your best LinkedIn posts here. Separate them with blank lines or '---'. Our AI will analyze your writing style."
              />
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !samplePosts.trim()}
                className="mt-2 flex items-center gap-2 rounded-lg border border-[#0077b5] px-4 py-2 text-sm font-medium text-[#0077b5] hover:bg-blue-50 disabled:opacity-50"
              >
                {analyzing ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...</>
                ) : analyzeSuccess ? (
                  <><CheckCircle className="h-3.5 w-3.5 text-green-600" /> Voice profile updated!</>
                ) : (
                  '✨ Analyze my voice'
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#0077b5] px-6 py-2.5 font-semibold text-white hover:bg-[#006097] disabled:opacity-60"
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                ) : saved ? (
                  <><CheckCircle className="h-4 w-4" /> Saved!</>
                ) : (
                  <><Save className="h-4 w-4" /> Save Profile</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
