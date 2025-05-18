
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect('/');

  const [stats, recent] = await Promise.all([
    prisma.gameSession.aggregate({
      _count: true,
      _sum: { score: true },
      where: { userId: session.userId, status: 'FINISHED' }
    }),
    prisma.gameSession.findMany({
      where: { userId: session.userId, status: 'FINISHED' },
      orderBy: { endedAt: 'desc' },
      take: 10,
      select: { id: true, score: true, moves: true, endedAt: true }
    })
  ]);

  const gamesPlayed = stats._count;
  const totalScore = stats._sum.score ?? 0;
  const avgScore = gamesPlayed ? Math.round(totalScore / gamesPlayed) : 0;

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Your Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Games</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-3xl font-bold">
            {gamesPlayed}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Best Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-3xl font-bold">
            {recent.length ? Math.max(...recent.map(r => r.score)) : '--'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Avg Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-3xl font-bold">
            {avgScore}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold">Recent Games</h2>
      <table className="w-full text-sm">
        <thead className="border-b">
          <tr>
            <th className="py-2 text-left">Date</th>
            <th className="py-2 text-center">Score</th>
            <th className="py-2 text-center">Moves</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((g) => (
            <tr key={g.id} className="border-b last:border-none">
              <td className="py-2 pr-4">
                {g.endedAt?.toLocaleDateString()}
              </td>
              <td className="py-2 text-center font-medium">{g.score}</td>
              <td className="py-2 text-center">{g.moves}</td>
            </tr>
          ))}
          {recent.length === 0 && (
            <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">No finished games yet</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}