import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { z } from 'zod';

const schema = z.object({
    nickname: z.string().min(1).max(20),
    score: z.number().int(),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const slug = (await params).slug;
        const body = await req.json();
        const { nickname, score } = schema.parse(body);

        const key = `leaderboard:${slug}`;

        // ZADD with GT updates only if the new score is greater than the existing score
        await redis.zadd(key, { gt: true }, { score, member: nickname });

        // Get the user's rank (0-based index, so add 1)
        // ZREVRANK returns the rank from high to low
        const rank = await redis.zrevrank(key, nickname);
        const safeRank = rank !== null ? rank + 1 : null;

        // Get total count for percentile handling if needed
        const total = await redis.zcard(key);

        return NextResponse.json({
            success: true,
            rank: safeRank,
            totalPlayers: total,
        });
    } catch (error) {
        console.error('Score submission error:', error);
        return NextResponse.json(
            { error: 'Failed to submit score' },
            { status: 500 }
        );
    }
}
