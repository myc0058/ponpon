'use server';

import { createShortUrl } from '@/lib/url-shortener';

export async function generateShortUrl(url: string) {
    try {
        const id = await createShortUrl(url);
        return { success: true, id };
    } catch (error) {
        console.error('Failed to create short URL:', error);
        return { success: false, error: 'Failed to shorten URL' };
    }
}
