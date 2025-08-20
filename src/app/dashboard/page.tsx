export const dynamic = "force-dynamic";
import SchedulePanel from "@/components/SchedulePanel";

export default function DashboardPage() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Upcoming Scheduled</h1>
      <SchedulePanel />
    </main>
  );
}
