import SlugForm from '@/components/SlugForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <SlugForm />
      
      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>
          Powered by{' '}
          <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="text-[#4285F4] hover:underline">
            Next.js
          </a>
          {' '}&{' '}
          <a href="https://www.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-[#34A853] hover:underline">
            Cloudflare
          </a>
        </p>
      </footer>
    </div>
  );
}
