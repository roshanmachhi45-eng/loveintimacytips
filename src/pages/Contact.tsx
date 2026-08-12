
import { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  User,
  MessageSquare,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import Seo from '../components/Seo';
import PageLayout from '../components/PageLayout';

import { BRAND } from '../lib/brand';

const CONTACT_EMAIL = 'contact.loveons@gmail.com';

interface FormState {
  name: string;
  email: string;
  message: string;
}

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    message: '',
  });

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sending) return;

    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error || 'Unable to send your message. Please try again.'
        );
      }

      setSent(true);

      setForm({
        name: '',
        email: '',
        message: '',
      });
    } catch (err) {
      console.error('Contact form error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Seo
        title="Contact Us — Loveons"
        description="Get in touch with the Loveons team. Send us your questions, feedback, or suggestions about our relationship tools."
        path="/contact"
      />

      <PageLayout
        title="Contact Us"
        subtitle="Have a question or feedback? We'd love to hear from you."
      >
        <div className="space-y-6">

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-rose-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-rose-500" />
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium">
                Email us at
              </p>

              <p className="text-sm font-semibold text-gray-700">
                {CONTACT_EMAIL}
              </p>
            </div>
          </a>

          {sent ? (
            <div className="flex flex-col items-center text-center py-8 fade-in">

              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>

              <h2 className="font-display text-lg font-bold text-gray-800 mb-1">
                Message Sent!
              </h2>

              <p className="text-sm text-gray-500 max-w-xs">
                Thank you for reaching out. We'll get back to you as soon as
                possible.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setError('');
                }}
                className="mt-4 px-5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-semibold text-sm hover:bg-rose-100 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1"
                >
                  Your Name
                </label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1"
                >
                  Your Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1"
                >
                  Your Message
                </label>

                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-300" />

                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    maxLength={5000}
                    value={form.message}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        message: e.target.value,
                      })
                    }
                    placeholder="Write your message here..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm transition-all resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />

                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3.5 rounded-2xl shimmer-btn text-white font-semibold text-sm shadow-lg shadow-rose-200 hover:shadow-rose-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>

            </form>
          )}
        </div>
      </PageLayout>
    </>
  );
}
