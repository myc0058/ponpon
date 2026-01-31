import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createGameSchema = z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    thumbnailUrl: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

const updateGameSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export async function GET() {
    try {
        const games = await prisma.miniGame.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(games);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = createGameSchema.parse(body);

        const game = await prisma.miniGame.create({
            data,
        });

        return NextResponse.json(game);
    } catch (error) {
        console.error('Create game error:', error);
        return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const data = updateGameSchema.parse(updateData);

        const game = await prisma.miniGame.update({
            where: { id },
            data,
        });

        return NextResponse.json(game);
    } catch (error) {
        console.error('Update game error:', error);
        return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.miniGame.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete game error:', error);
        return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
    }
}
