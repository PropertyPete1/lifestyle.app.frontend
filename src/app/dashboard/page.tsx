import UpcomingScheduleClient from "@/components/UpcomingScheduleClient";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Upcoming Scheduled</h1>
      <UpcomingScheduleClient />
    </main>
  );
}
