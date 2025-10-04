'use client';

import { useState } from 'react';
import { createSlug, ApiError } from '@/lib/api';

export default function SlugForm() {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ slug: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await createSlug({ name, url });
      setResult({ slug: response.slug, url: response.url });
      // Reset form
      setName('');
      setUrl('');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.url) {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Logo & Title */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-[#4285F4]"></div>
            <div className="w-3 h-3 rounded-full bg-[#34A853]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FBBC05]"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Slug Generator</h1>
        </div>
        <p className="text-gray-600">Generate custom URLs untuk Google Apps Script Web Apps Anda</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama Aplikasi Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Aplikasi
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: My Awesome App"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent outline-none transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">Slug akan dibuat otomatis dari nama ini</p>
          </div>

          {/* URL Apps Script Input */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              URL Apps Script Web App
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34A853] focus:border-transparent outline-none transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">URL deployment dari Google Apps Script Anda</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Slug'
            )}
          </button>
        </form>
      </div>

      {/* Result Card */}
      {result && (
        <div className="mt-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-8 border border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">Slug berhasil dibuat!</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug:</label>
              <code className="block bg-white px-4 py-2 rounded-lg text-[#34A853] font-mono text-sm border border-gray-200">
                {result.slug}
              </code>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Custom:</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-white px-4 py-2 rounded-lg text-[#4285F4] font-mono text-sm border border-gray-200 overflow-x-auto">
                  {result.url}
                </code>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Sekarang Anda bisa mengakses aplikasi melalui URL custom di atas! 🎉
          </p>
        </div>
      )}
    </div>
  );
}
