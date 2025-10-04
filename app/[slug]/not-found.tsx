import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Slug Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-6">
            Maaf, slug yang Anda cari tidak ada dalam database kami.
          </p>

          {/* Action Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Home
          </Link>
        </div>
      </div>
    </div>
  );
}
