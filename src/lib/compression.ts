import zlib from 'zlib';

/**
 * 데이터를 GZIP으로 압축하고 Base64로 인코딩합니다. (URL 안전하게 변환)
 */
export function compressData(data: any): string {
    try {
        const str = JSON.stringify(data);
        const compressed = zlib.gzipSync(Buffer.from(str, 'utf-8'));
        return compressed.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    } catch (e) {
        console.error('Compression failed:', e);
        return '';
    }
}

/**
 * Base64(URL 안전) 문자열을 디코딩하고 GZIP 압축을 해제합니다.
 */
export function decompressData(compressed: string): any {
    try {
        // Restore standard base64
        let base64 = compressed
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // Add padding
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }

        const buffer = Buffer.from(base64, 'base64');
        const decompressed = zlib.gunzipSync(buffer);
        return JSON.parse(decompressed.toString('utf-8'));
    } catch (e) {
        console.error('Decompression failed:', e);
        return null;
    }
}
