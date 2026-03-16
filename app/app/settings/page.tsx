'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, ExternalLink } from 'lucide-react';

interface BrandProfile {
  product_name: string;
  product_description: string;
  primary_audience: string;
  tone_score: number;
  avg_sentence_length: string;
  emoji_usage: string;
  cta_style: string;
  website_url: string;
  avoid_phrases: string[];
  brand_voice_keywords: string[];
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Partial<BrandProfile>>({
    product_name: '',
    product_description: '',
    primary_audience: '',
    tone_score: 3,
    avg_sentence_length: 'medium',
    emoji_usage: 'minimal',
    cta_style: 'direct',
    website_url: '',
  });
  const [samplePosts, setSamplePosts] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [analysed, setAnalysed] = useState(false);
  const [linkedInStatus, setLinkedInStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  useEffect(() => {
    // Load existing profile
    fetch('/api/brand-profile')
      .then((r) => r.json())
      .then(({ profile: p }) => {
        if (p) setProfile(p);
      });

    // Check LinkedIn status from URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('linkedin') === 'connected') setLinkedInStatus('connected');
    if (params.get('linkedin') === 'error') setLinkedInStatus('disconnected');
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/brand-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyse() {
    if (!samplePosts.trim()) return;
    setAnalysing(true);
    try {
      const res = await fetch('/api/voice/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample_posts: samplePosts }),
      });
      const data = await res.json();
      if (data.profile) {
        setProfile((prev) => ({ ...prev, ...data.profile }));
        setAnalysed(true);
      }
    } finally {
      setAnalysing(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your voice profile and integrations.</p>
      </div>

      {/* LinkedIn Connection */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-1">LinkedIn Connection</h2>
        <p className="text-sm text-gray-500 mb-4">Connect your LinkedIn account to enable auto-publishing.</p>
        {linkedInStatus === 'connected' ? (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <Check size={16} /> LinkedIn connected successfully
          </div>
        ) : (
          <a
            href="/api/auth/linkedin"
            className="inline-flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            <ExternalLink size={14} /> Connect LinkedIn
          </a>
        )}
      </div>

      {/* Voice Profile Builder */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-1">Voice Profile Builder</h2>
        <p className="text-sm text-gray-500 mb-6">
          Paste up to 20 of your existing LinkedIn posts so AI can learn your writing style.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Sample LinkedIn Posts
          </label>
          <textarea
            value={samplePosts}
            onChange={(e) => setSamplePosts(e.target.value)}
            placeholder="Paste 3–20 of your best LinkedIn posts here, separated by blank lines..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={6}
          />
        </div>
        <button
          onClick={handleAnalyse}
          disabled={analysing || !samplePosts.trim()}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {analysing ? <Loader2 size={14} className="animate-spin" /> : null}
          {analysed ? '✓ Voice profile updated' : 'Analyse my writing style'}
        </button>
      </div>

      {/* Brand Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <h2 className="font-bold text-gray-900">Brand Profile</h2>

        {[
          { key: 'product_name', label: 'Product / Company Name', placeholder: 'e.g. Acme SaaS' },
          { key: 'product_description', label: 'What does your product do?', placeholder: 'e.g. We help B2B sales teams automate their follow-up sequences' },
          { key: 'primary_audience', label: 'Primary audience', placeholder: 'e.g. B2B SaaS founders and sales leaders' },
          { key: 'website_url', label: 'Website URL', placeholder: 'https://yourcompany.com' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            <input
              type="text"
              value={(profile[key as keyof BrandProfile] as string) ?? ''}
              onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tone (1 = formal, 5 = casual)
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={profile.tone_score ?? 3}
              onChange={(e) => setProfile({ ...profile, tone_score: parseInt(e.target.value) })}
              className="w-full accent-blue-700"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Formal</span>
              <span className="font-semibold text-blue-700">{profile.tone_score ?? 3}</span>
              <span>Casual</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Emoji usage</label>
            <select
              value={profile.emoji_usage ?? 'minimal'}
              onChange={(e) => setProfile({ ...profile, emoji_usage: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['none', 'minimal', 'moderate', 'heavy'].map((v) => (
                <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
          {saved ? 'Saved!' : 'Save profile'}
        </button>
      </form>

      {/* Plan info */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <h2 className="font-bold text-gray-900 mb-1">Plan &amp; Billing</h2>
        <p className="text-sm text-gray-600 mb-3">
          Billing is managed through RevenueCat. Contact support to change your plan.
        </p>
        <a
          href="mailto:support@postflow.ai"
          className="text-sm text-blue-700 font-semibold hover:underline"
        >
          Contact support →
        </a>
      </div>
    </div>
  );
}
