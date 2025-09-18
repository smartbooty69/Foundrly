import { Suspense } from 'react';
import AnalyticsPageClient from '@/components/AnalyticsPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const experimental_ppr = false;

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-white text-gray-900 flex items-center justify-center">Loading...</div>}>
      <AnalyticsPageClient />
    </Suspense>
  );
}
