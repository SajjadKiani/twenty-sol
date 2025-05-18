
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function LeaderboardPage() {
  const top = await prisma.score.findMany({
    orderBy: { value: 'desc' },
    take: 50,
    include: { user: { select: { username: true, wallet: true } } }
  });

  return (
    <main className="mx-auto max-w-xl space-y-6 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Leaderboard – Top 50</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="py-2 text-left">Rank</th>
                <th className="py-2">Player</th>
                <th className="py-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {top.map((row, i) => (
                <tr key={row.id} className="border-b last:border-none">
                  <td className="py-2 pr-4">{i + 1}</td>
                  <td className="py-2">{row.user.username ?? row.user.wallet.slice(0, 4) + '…'}</td>
                  <td className="py-2 text-right font-medium">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}