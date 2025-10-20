import { prisma } from "../../src/lib/db";

export default async function LeaderboardPage() {
  // NOTE: Stub query; if no DB, will fail. Wrap in try/catch to display empty state.
  let rows: Array<{ app: { name: string }, avgScore: number, sessions: number }> = [];
  try {
    const snapshots = await prisma.leaderboardSnapshot.findMany({
      take: 50,
      orderBy: { avgScore: "desc" },
      include: { app: true }
    });
    rows = snapshots.map((s: { app: { name: string }, avgScore: number, sessions: number }) => ({ app: { name: s.app.name }, avgScore: s.avgScore, sessions: s.sessions }));
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Global Leaderboard</h1>
      <table className="w-full text-sm synheart-table">
        <thead>
          <tr>
            <th className="text-left p-3">#</th>
            <th className="text-left p-3">App</th>
            <th className="text-left p-3">Avg SWIP (30d)</th>
            <th className="text-left p-3">Sessions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr key="empty"><td colSpan={4} className="p-4 text-gray-400">No data yet.</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={`${r.app.name}-${i}`}>
              <td className="p-3">{i + 1}</td>
              <td className="p-3">{r.app.name}</td>
              <td className="p-3">
                <span className={`synheart-badge ${
                  r.avgScore >= 70
                    ? "synheart-badge-success"
                    : r.avgScore >= 50
                    ? "synheart-badge-warning"
                    : "synheart-badge-error"
                }`}>
                  {r.avgScore.toFixed(1)}
                </span>
              </td>
              <td className="p-3">{r.sessions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
