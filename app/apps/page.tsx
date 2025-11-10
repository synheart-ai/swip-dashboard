import type { Metadata } from 'next';
import { AppsExplorer } from '../../components/AppsExplorer';
import { prisma } from '../../src/lib/db';
import type { AppCatalogEntry } from '../../src/types';

export const metadata: Metadata = {
  title: 'Apps | SWIP Dashboard',
  description:
    'Browse the catalogue of SWIP-enabled applications, compare wellness impact scores, and explore ingestion activity.',
};

async function getAppCatalogue(): Promise<AppCatalogEntry[]> {
  const [apps, sessionGroups] = await Promise.all([
    prisma.app.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        leaderboardSnapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            avgScore: true,
            sessions: true,
          },
        },
      },
    }),
    prisma.appSession.groupBy({
      by: ['appInternalId', 'dataOnCloud'],
      _count: { _all: true },
    }),
  ]);

  const sessionMap = new Map<
    string,
    { total: number; swip: number; ingest: number }
  >();

  sessionGroups.forEach((group) => {
    const existing =
      sessionMap.get(group.appInternalId) ?? {
        total: 0,
        swip: 0,
        ingest: 0,
      };
    const count = group._count._all;

    if (group.dataOnCloud === 1) {
      existing.ingest += count;
    } else {
      existing.swip += count;
    }

    existing.total += count;
    sessionMap.set(group.appInternalId, existing);
  });

  return apps.map((app) => {
    const sessionStats =
      sessionMap.get(app.id) ?? { total: 0, swip: 0, ingest: 0 };
    const latestSnapshot = app.leaderboardSnapshots[0];
    const leaderboardSessions = latestSnapshot?.sessions ?? 0;
    const avgScore =
      latestSnapshot?.avgScore ?? app.avgSwipScore ?? 0;

    return {
      id: app.id,
      name: app.name,
      category: app.category,
      os: app.os,
      description: app.description,
      iconUrl: app.iconUrl,
      avgSwipScore: parseFloat(avgScore.toFixed(2)),
      totalSessions: Math.max(sessionStats.total, leaderboardSessions),
      swipUserSessions: sessionStats.swip,
      ingestionSessions: sessionStats.ingest,
      leaderboardSessions,
      claimable: app.claimable,
      createdVia: app.createdVia,
      ownerId: app.ownerId,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    };
  });
}

export default async function AppsPage() {
  const apps = await getAppCatalogue();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-10">
      <div className="mx-auto w-full max-w-[1700px] px-6 lg:px-12">
        <AppsExplorer apps={apps} />
      </div>
    </div>
  );
}


