import { IMAGE_VERSION } from './constants';

/**
 * Appends a version query parameter to an image URL to force cache refreshing.
 * @param url The image URL.
 * @param version The version string to append. Defaults to the global IMAGE_VERSION.
 * @returns The URL with the version parameter appended.
 */
export function getBustedImageUrl(url: string | null | undefined, version: string = IMAGE_VERSION): string {
    if (!url) return '';

    // Don't append version to data URLs or blob URLs
    if (url.startsWith('data:') || url.startsWith('blob:')) {
        return url;
    }

    try {
        const urlObj = new URL(url, 'http://dummy-base.com'); // Use a dummy base for relative URLs

        // If it's a relative URL, we need to handle it carefully to avoid adding the dummy base to the output
        const isRelative = !url.startsWith('http://') && !url.startsWith('https://');

        if (url.includes('?')) {
            // Already has params, check if v already exists to avoid duplication? 
            // For simplicity, we'll append. But better to use URLSearchParams
            // If the original URL was relative, urlObj.searchParams works relative to the dummy base
            if (urlObj.searchParams.has('v')) {
                urlObj.searchParams.set('v', version);
            } else {
                urlObj.searchParams.append('v', version);
            }
        } else {
            urlObj.searchParams.append('v', version);
        }

        if (isRelative) {
            // Reconstruct relative URL
            // pathname + search + hash
            return urlObj.pathname + urlObj.search + urlObj.hash;
        } else {
            return urlObj.toString();
        }

    } catch (e) {
        // If URL parsing fails, fall back to simple string appending
        // This handles cases that might trip up the URL constructor or edge cases
        const linkChar = url.includes('?') ? '&' : '?';
        return `${url}${linkChar}v=${version}`;
    }
}
