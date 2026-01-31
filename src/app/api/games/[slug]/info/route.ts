import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const slug = (await params).slug;

        const game = await prisma.miniGame.findUnique({
            where: { slug },
        });

        if (!game) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        if (!game.isActive) {
            return NextResponse.json({ error: 'Game is inactive' }, { status: 403 });
        }

        return NextResponse.json(game);
    } catch (error) {
        console.error('Game info fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch game info' },
            { status: 500 }
        );
    }
}
