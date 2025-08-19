import UpcomingScheduleClient from "@/components/UpcomingScheduleClient";
import nextDynamic from "next/dynamic";
const YTMetricsClient = nextDynamic(() => import("@/components/YTMetricsClient"), { ssr: false });

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Upcoming Scheduled</h1>
      <UpcomingScheduleClient />
      <div className="pt-4">
        <YTMetricsClient windowDays={30} />
      </div>
    </main>
  );
}
