import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })

if (typeof global.Request === 'undefined') {
    global.Request = class Request {
        url: string;
        method: string;
        headers: Headers;
        constructor(input: string | { url: string }, init?: any) {
            this.url = typeof input === 'string' ? input : input.url;
            this.method = init?.method || 'GET';
            this.headers = new Headers(init?.headers);
        }
    } as any;
}

if (typeof global.Headers === 'undefined') {
    global.Headers = class Headers extends Map {
        append(name: string, value: string) {
            this.set(name, value);
        }
        get(name: string) {
            return super.get(name) || null;
        }
    } as any;
}

if (typeof global.Response === 'undefined') {
    global.Response = class Response {
        status: number;
        constructor(body?: any, init?: any) {
            this.status = init?.status || 200;
        }
    } as any;
}
