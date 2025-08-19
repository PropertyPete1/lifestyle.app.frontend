import YTMetricsClient from '@/components/YTMetricsClient';

export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">YT Metrics</h1>
      <YTMetricsClient />
    </main>
  );
}
