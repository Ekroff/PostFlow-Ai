import Link from 'next/link';
import { ArrowRight, Zap, CheckCircle, Users, Calendar, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <span className="text-xl font-bold text-blue-700">PostFlow AI</span>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <Zap size={14} />
          AI-powered LinkedIn content for B2B teams
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          From idea to published
          <br />
          <span className="text-blue-700">LinkedIn post in minutes</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          PostFlow AI is the only tool that combines AI post generation, team review, one-click
          approval, and auto-scheduling — built for B2B teams of 3–15 people.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200"
          >
            Start for free <ArrowRight size={20} />
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-300 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            The complete LinkedIn content workflow
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            Five stages. One tool. No more Slack approvals, Notion drafts, or manual copy-pasting.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { step: '1', label: 'Generate', desc: 'AI creates 3 post variations from your topic + voice profile', icon: '✨' },
              { step: '2', label: 'Review', desc: 'Team reviews drafts in a shared Kanban queue', icon: '👀' },
              { step: '3', label: 'Approve', desc: 'One-click email approval — no login required', icon: '✅' },
              { step: '4', label: 'Calendar', desc: 'Drag-and-drop scheduling at optimal times', icon: '📅' },
              { step: '5', label: 'Publish', desc: 'Auto-published to LinkedIn at scheduled time', icon: '🚀' },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-2xl p-6 border border-gray-100 text-center shadow-sm">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Step {s.step}</div>
                <div className="font-bold text-gray-900 mb-2">{s.label}</div>
                <div className="text-sm text-gray-500">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">
            Everything your team needs
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="text-blue-700" size={24} />, title: 'AI Post Generator', desc: 'GPT-4o generates 3 variations per topic, matching each author\'s unique voice profile.' },
              { icon: <Users className="text-blue-700" size={24} />, title: 'Team Approval Workflow', desc: 'Review queue with Kanban board, inline comments, and one-click email approvals.' },
              { icon: <Calendar className="text-blue-700" size={24} />, title: 'Content Calendar', desc: 'Visual scheduling with drag-and-drop and AI-suggested optimal posting times.' },
              { icon: <CheckCircle className="text-blue-700" size={24} />, title: 'Auto-Publish', desc: 'Posts publish automatically to LinkedIn at the scheduled time — no manual posting.' },
              { icon: <BarChart3 className="text-blue-700" size={24} />, title: 'Voice Profile Builder', desc: 'Analyse existing posts to build a locked-in voice profile per team member.' },
              { icon: <Users className="text-blue-700" size={24} />, title: 'Team Roles', desc: 'Admin, Editor, Reviewer, and Author roles with Supabase RLS enforcement.' },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all">
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple pricing</h2>
          <p className="text-gray-500 text-center mb-14">Start free, upgrade when you need your team.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Starter', price: '$29', seats: '1 user', gens: '30 AI posts/mo', highlight: false },
              { name: 'Growth', price: '$79', seats: 'Up to 5 users', gens: '150 AI posts/mo', highlight: false },
              { name: 'Pro', price: '$149', seats: 'Up to 15 users', gens: '500 AI posts/mo', highlight: true },
              { name: 'Agency', price: '$299+', seats: 'Up to 50 users', gens: 'Unlimited posts', highlight: false },
            ].map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-6 border ${
                  p.highlight
                    ? 'border-blue-600 bg-blue-700 text-white shadow-xl shadow-blue-200'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {p.highlight && (
                  <div className="text-xs font-bold uppercase tracking-wide text-blue-200 mb-2">Most popular</div>
                )}
                <div className={`font-bold text-lg mb-1 ${p.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {p.name}
                </div>
                <div className={`text-3xl font-extrabold mb-4 ${p.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {p.price}<span className="text-base font-normal opacity-70">/mo</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {[p.seats, p.gens, 'Review queue', 'Auto-publish', 'Team roles'].map((f) => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${p.highlight ? 'text-blue-100' : 'text-gray-600'}`}>
                      <CheckCircle size={14} className={p.highlight ? 'text-blue-300' : 'text-green-500'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`block text-center py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    p.highlight
                      ? 'bg-white text-blue-700 hover:bg-blue-50'
                      : 'bg-blue-700 text-white hover:bg-blue-800'
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-blue-700">PostFlow AI</span>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} PostFlow AI. LinkedIn AI post generation for B2B teams.
          </p>
        </div>
      </footer>
    </div>
  );
}
