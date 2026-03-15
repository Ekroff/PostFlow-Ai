'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Check } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    product_name: '',
    product_description: '',
    primary_audience: '',
    website_url: '',
    tone_score: 3,
    emoji_usage: 'minimal',
    cta_style: 'direct',
    workspace_name: '',
  });

  async function handleComplete() {
    setLoading(true);
    try {
      // Sync user with Supabase
      await fetch('/api/auth/sync', { method: 'POST' });

      // Save brand profile
      await fetch('/api/brand-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      router.push('/app/dashboard');
    } catch {
      setLoading(false);
    }
  }

  const steps = [
    { num: 1, label: 'Your product' },
    { num: 2, label: 'Voice style' },
    { num: 3, label: 'Ready!' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-700 mb-1">PostFlow AI</h1>
          <p className="text-gray-500">Set up your workspace in 2 minutes</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                step > s.num
                  ? 'bg-green-500 text-white'
                  : step === s.num
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span className={`text-sm ${step === s.num ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Tell us about your product</h2>
                <p className="text-sm text-gray-500">This helps the AI generate posts that resonate with your audience.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product / Company name *</label>
                <input
                  type="text"
                  value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                  placeholder="e.g. Acme SaaS"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">What does it do? *</label>
                <textarea
                  value={form.product_description}
                  onChange={(e) => setForm({ ...form, product_description: e.target.value })}
                  placeholder="e.g. We help B2B sales teams automate their follow-up sequences"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Primary audience *</label>
                <input
                  type="text"
                  value={form.primary_audience}
                  onChange={(e) => setForm({ ...form, primary_audience: e.target.value })}
                  placeholder="e.g. B2B SaaS founders and sales leaders"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!form.product_name || !form.product_description || !form.primary_audience}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">What&apos;s your writing style?</h2>
                <p className="text-sm text-gray-500">The AI will match your voice on every post.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tone: <span className="text-blue-700">{form.tone_score === 1 ? 'Very formal' : form.tone_score === 2 ? 'Formal' : form.tone_score === 3 ? 'Balanced' : form.tone_score === 4 ? 'Casual' : 'Very casual'}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={form.tone_score}
                  onChange={(e) => setForm({ ...form, tone_score: parseInt(e.target.value) })}
                  className="w-full accent-blue-700"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Formal</span>
                  <span>Casual</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Emoji usage</label>
                <div className="grid grid-cols-4 gap-2">
                  {['none', 'minimal', 'moderate', 'heavy'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm({ ...form, emoji_usage: v })}
                      className={`py-2 text-sm rounded-lg border font-medium transition-colors ${
                        form.emoji_usage === v
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Call-to-action style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'soft', label: 'Soft', desc: '"Would love your thoughts"' },
                    { v: 'direct', label: 'Direct', desc: '"Book a call here"' },
                    { v: 'question', label: 'Question', desc: '"What do you think?"' },
                  ].map(({ v, label, desc }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm({ ...form, cta_style: v })}
                      className={`py-3 px-2 text-sm rounded-lg border font-medium text-left transition-colors ${
                        form.cta_style === v
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">{label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="text-6xl">🚀</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">You&apos;re all set, {form.product_name}!</h2>
                <p className="text-gray-500 text-sm">
                  Your voice profile is ready. Generate your first LinkedIn post in seconds.
                </p>
              </div>
              <ul className="text-left space-y-2 text-sm text-gray-600">
                {[
                  'AI generates posts matching your voice',
                  'Team review queue ready to use',
                  'LinkedIn auto-publish once connected',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check size={15} className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
