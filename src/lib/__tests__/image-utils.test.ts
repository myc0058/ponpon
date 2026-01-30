import { getBustedImageUrl } from '../image-utils';
import { IMAGE_VERSION } from '../constants';

describe('getBustedImageUrl', () => {
    it('returns empty string for null/undefined/empty input', () => {
        expect(getBustedImageUrl(null)).toBe('');
        expect(getBustedImageUrl(undefined)).toBe('');
        expect(getBustedImageUrl('')).toBe('');
    });

    it('returns original URL for data: and blob: URLs', () => {
        const dataUrl = 'data:image/png;base64,abcdef';
        const blobUrl = 'blob:http://example.com/uuid';
        expect(getBustedImageUrl(dataUrl)).toBe(dataUrl);
        expect(getBustedImageUrl(blobUrl)).toBe(blobUrl);
    });

    it('appends version to simple URL', () => {
        const url = 'https://example.com/image.png';
        const result = getBustedImageUrl(url);
        expect(result).toBe(`${url}?v=${IMAGE_VERSION}`);
    });

    it('appends version to URL with existing query params', () => {
        const url = 'https://example.com/image.png?width=100';
        const result = getBustedImageUrl(url);
        expect(result).toContain('?width=100');
        expect(result).toContain(`&v=${IMAGE_VERSION}`);
    });

    it('respects existing version if present', () => {
        const url = 'https://example.com/image.png?v=99';
        const result = getBustedImageUrl(url, '1');
        expect(result).toBe('https://example.com/image.png?v=99');
    });

    it('handles relative URLs correctly', () => {
        const url = '/images/logo.png';
        const result = getBustedImageUrl(url);
        expect(result).toBe(`${url}?v=${IMAGE_VERSION}`);
    });

    it('handles relative URLs with params correctly', () => {
        const url = '/images/logo.png?foo=bar';
        const result = getBustedImageUrl(url);
        expect(result).toContain('?foo=bar');
        expect(result).toContain(`&v=${IMAGE_VERSION}`);
    });
});
