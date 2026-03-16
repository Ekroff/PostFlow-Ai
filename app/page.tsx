import Link from 'next/link';
import { Linkedin, Zap, CheckCircle, Clock, BarChart2, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#0077b5] p-1.5">
              <Linkedin className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">PostFlow AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-[#0077b5] px-4 py-2 text-sm font-medium text-white hover:bg-[#006097]"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm text-blue-700">
            <Zap className="h-3.5 w-3.5" />
            Powered by GPT-4o
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            LinkedIn content that
            <br />
            <span className="text-[#0077b5]">sounds like you</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600">
            Generate, review, approve, and auto-publish LinkedIn posts with AI that learns
            your brand voice. Built for teams and solo creators who want consistent, authentic
            content.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="rounded-xl bg-[#0077b5] px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-[#006097]"
            >
              Start for free — 5 posts/month
            </Link>
            <Link
              href="/sign-in"
              className="rounded-xl border border-gray-200 px-8 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Everything you need for LinkedIn success
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Zap className="h-6 w-6 text-[#0077b5]" />,
                title: 'AI Voice Matching',
                description:
                  'Paste your existing posts and our AI learns your unique tone, style, and phrasing. Every generated post sounds authentically you.',
              },
              {
                icon: <CheckCircle className="h-6 w-6 text-green-600" />,
                title: 'Approval Workflows',
                description:
                  'Built-in review flows with email notifications. Approve or request changes directly from your inbox — no login required.',
              },
              {
                icon: <Clock className="h-6 w-6 text-orange-500" />,
                title: 'Smart Scheduling',
                description:
                  'Schedule posts ahead of time and our cron job publishes them automatically to LinkedIn at the right moment.',
              },
              {
                icon: <BarChart2 className="h-6 w-6 text-purple-600" />,
                title: 'Content Calendar',
                description:
                  'Visual calendar view of all your scheduled and published content. Never miss a publishing date again.',
              },
              {
                icon: <Users className="h-6 w-6 text-indigo-600" />,
                title: 'Team Collaboration',
                description:
                  'Roles for admins, editors, reviewers and authors. Comment on posts, track versions, and collaborate seamlessly.',
              },
              {
                icon: <Linkedin className="h-6 w-6 text-[#0077b5]" />,
                title: 'Direct LinkedIn Publishing',
                description:
                  'Connect your LinkedIn account once and publish directly. No copy-paste, no manual posting.',
              },
            ].map((feature, i) => (
              <div key={i} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-lg bg-gray-50 p-2">{feature.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="mb-12 text-center text-gray-600">Start free. Upgrade when you need more.</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: 'Free',
                price: 0,
                features: ['5 posts/month', '1 LinkedIn account', 'Basic voice profile'],
                cta: 'Get started',
                highlight: false,
              },
              {
                name: 'Starter',
                price: 29,
                features: ['30 posts/month', '1 LinkedIn account', 'Full voice profiling', 'Email approvals'],
                cta: 'Start Starter',
                highlight: false,
              },
              {
                name: 'Growth',
                price: 79,
                features: ['150 posts/month', '5 team seats', '3 brand profiles', 'Priority support'],
                cta: 'Start Growth',
                highlight: true,
              },
              {
                name: 'Agency',
                price: 299,
                features: ['Unlimited posts', '50 team seats', '50 brand profiles', 'White-label ready'],
                cta: 'Contact us',
                highlight: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 ${plan.highlight ? 'bg-[#0077b5] text-white shadow-xl' : 'border border-gray-100 bg-white shadow-sm'}`}
              >
                <p className={`text-sm font-semibold uppercase tracking-wide ${plan.highlight ? 'text-blue-100' : 'text-gray-500'}`}>
                  {plan.name}
                </p>
                <p className={`mt-2 text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  ${plan.price}
                  <span className={`text-base font-normal ${plan.highlight ? 'text-blue-100' : 'text-gray-500'}`}>/mo</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-blue-50' : 'text-gray-600'}`}>
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`mt-8 block rounded-lg py-2.5 text-center text-sm font-semibold ${plan.highlight ? 'bg-white text-[#0077b5] hover:bg-blue-50' : 'bg-[#0077b5] text-white hover:bg-[#006097]'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-500">
        <div className="mb-2 flex items-center justify-center gap-2">
          <div className="rounded bg-[#0077b5] p-1">
            <Linkedin className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-gray-700">PostFlow AI</span>
        </div>
        <p>© {new Date().getFullYear()} PostFlow AI. Built with Next.js 15, Supabase &amp; OpenAI.</p>
      </footer>
    </div>
  );
}
