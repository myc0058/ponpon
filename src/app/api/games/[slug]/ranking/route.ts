import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const slug = (await params).slug;
        const key = `leaderboard:${slug}`;

        // Get top 100 scores
        // rev: true for descending order (highest score first)
        // withScores: true to include scores in the response
        const rawRanking = await redis.zrange(key, 0, 99, {
            rev: true,
            withScores: true,
        });

        // Parse the raw response which is [member, score, member, score, ...]
        const ranking = [];
        for (let i = 0; i < rawRanking.length; i += 2) {
            ranking.push({
                nickname: rawRanking[i],
                score: Number(rawRanking[i + 1]),
                rank: i / 2 + 1,
            });
        }

        return NextResponse.json({ ranking });
    } catch (error) {
        console.error('Ranking fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ranking' },
            { status: 500 }
        );
    }
}
