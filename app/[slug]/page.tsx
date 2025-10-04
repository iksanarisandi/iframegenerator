import { notFound } from 'next/navigation';
import { getSlugData } from '@/lib/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const data = await getSlugData(slug);

    return (
      <div className="w-screen h-screen m-0 p-0 overflow-hidden">
        <iframe
          src={data.url}
          className="w-full h-full border-0"
          title={data.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  } catch (error) {
    // Jika slug tidak ditemukan, tampilkan 404
    notFound();
  }
}

// Metadata dinamis
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  try {
    const data = await getSlugData(slug);
    return {
      title: data.name,
      description: `Access ${data.name} via custom slug`,
    };
  } catch {
    return {
      title: 'Not Found',
      description: 'This slug does not exist',
    };
  }
}
