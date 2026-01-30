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

        // Check if v already exists, if not append default version
        if (!urlObj.searchParams.has('v')) {
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
        if (url.includes('v=')) {
            return url;
        }
        const linkChar = url.includes('?') ? '&' : '?';
        return `${url}${linkChar}v=${version}`;
    }
}
