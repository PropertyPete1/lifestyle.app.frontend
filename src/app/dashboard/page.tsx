import dyn from "next/dynamic";
export const dynamic = "force-dynamic";

const SchedulePanel = dyn(() => import("@/components/SchedulePanel"), { ssr: false });

export default function DashboardPage() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Upcoming Scheduled</h1>
      <SchedulePanel />
    </main>
  );
}
