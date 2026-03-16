'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Linkedin, Sparkles, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

const STEPS = ['Welcome', 'Brand Voice', 'LinkedIn'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [profile, setProfile] = useState({
    product_name: '',
    primary_audience: '',
    product_description: '',
    tone_score: 3,
  });

  const handleSyncUser = async () => {
    setSyncing(true);
    try {
      await fetch('/api/auth/sync', { method: 'POST' });
    } finally {
      setSyncing(false);
    }
  };

  const handleStart = async () => {
    await handleSyncUser();
    setStep(1);
  };

  const handleSaveProfile = async () => {
    if (profile.product_name || profile.primary_audience) {
      await fetch('/api/brand-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    }
    setStep(2);
  };

  const handleFinish = () => {
    router.push('/app/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  i < step
                    ? 'bg-green-500 text-white'
                    : i === step
                    ? 'bg-[#0077b5] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="h-px w-8 bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0077b5]">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-3 text-2xl font-bold text-gray-900">Welcome to PostFlow AI</h1>
            <p className="mb-8 text-gray-600">
              Let&apos;s set up your account in 3 quick steps. It takes under 2 minutes.
            </p>
            <button
              onClick={handleStart}
              disabled={syncing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0077b5] px-6 py-3.5 font-semibold text-white hover:bg-[#006097] disabled:opacity-60"
            >
              {syncing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Setting up...</>
              ) : (
                <>Get started <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        )}

        {/* Step 1: Brand Voice */}
        {step === 1 && (
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="mb-2 text-xl font-bold text-gray-900">Tell us about your brand</h2>
            <p className="mb-6 text-gray-500 text-sm">
              This helps our AI generate posts that sound like you.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Your name or company name
                </label>
                <input
                  type="text"
                  value={profile.product_name}
                  onChange={(e) => setProfile((p) => ({ ...p, product_name: e.target.value }))}
                  placeholder="e.g. Jane Smith / Acme Corp"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#0077b5] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Who is your target audience?
                </label>
                <input
                  type="text"
                  value={profile.primary_audience}
                  onChange={(e) => setProfile((p) => ({ ...p, primary_audience: e.target.value }))}
                  placeholder="e.g. B2B SaaS founders, marketing managers"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#0077b5] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  What do you do? (brief description)
                </label>
                <textarea
                  value={profile.product_description}
                  onChange={(e) => setProfile((p) => ({ ...p, product_description: e.target.value }))}
                  rows={3}
                  placeholder="e.g. We help SaaS companies grow through content marketing"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#0077b5] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Writing tone: {profile.tone_score === 1 ? 'Very formal' : profile.tone_score === 5 ? 'Very casual' : profile.tone_score <= 2 ? 'Formal' : profile.tone_score >= 4 ? 'Casual' : 'Balanced'}
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Formal</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={profile.tone_score}
                    onChange={(e) => setProfile((p) => ({ ...p, tone_score: parseInt(e.target.value) }))}
                    className="flex-1 accent-[#0077b5]"
                  />
                  <span className="text-xs text-gray-500">Casual</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Skip for now
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0077b5] py-3 font-semibold text-white hover:bg-[#006097]"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: LinkedIn */}
        {step === 2 && (
          <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0077b5]">
              <Linkedin className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Connect LinkedIn</h2>
            <p className="mb-8 text-gray-500 text-sm">
              Connect your LinkedIn account to auto-publish posts. You can always do this later in Settings.
            </p>
            <div className="space-y-3">
              <a
                href="/api/auth/linkedin"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0077b5] px-6 py-3.5 font-semibold text-white hover:bg-[#006097]"
              >
                <Linkedin className="h-5 w-5" />
                Connect LinkedIn Account
              </a>
              <button
                onClick={handleFinish}
                className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Skip and go to dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
