import { getOriginalUrl } from '@/lib/url-shortener';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const originalUrl = await getOriginalUrl(id);

    if (originalUrl) {
        return NextResponse.redirect(originalUrl);
    }

    return new NextResponse('Not Found', { status: 404 });
}
