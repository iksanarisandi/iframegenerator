import SlugViewer from './SlugViewer';

// Configure Edge Runtime for Cloudflare Pages
export const runtime = 'edge';

export default function SlugPage() {
  return <SlugViewer />;
}
