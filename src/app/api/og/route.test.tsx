import { GET } from './route'
import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
    prisma: {
        result: {
            findUnique: jest.fn()
        }
    }
}))

// Mock decompressData
jest.mock('@/lib/compression', () => ({
    decompressData: jest.fn((data) => {
        if (data === 'valid_compressed_data') {
            return {
                t: 'Test Title',
                d: 'Test Description',
                q: 'Quiz Title',
                i: '/test-image.jpg'
            }
        }
        return null
    })
}))

// Mock ImageResponse
// We mock it to capture the JSX element passed to it
jest.mock('next/og', () => ({
    ImageResponse: jest.fn().mockImplementation((element) => {
        return {
            element, // Save element for inspection
            status: 200,
            headers: new Headers({ 'content-type': 'image/png' })
        }
    })
}))

describe('OG Image Generation', () => {
    it('should generate default OG image correctly', async () => {
        const req = new Request('http://localhost:3000/api/og') as any as NextRequest
        const res: any = await GET(req)

        expect(res.status).toBe(200)

        // Inspect the captured element
        const containerStyle = res.element.props.style

        // Verify background gradient
        expect(containerStyle.background).toContain('linear-gradient')
    })

    it('should handle compressed data correctly', async () => {
        const req = new Request('http://localhost:3000/api/og?o=valid_compressed_data') as any as NextRequest
        const res: any = await GET(req)

        expect(res.status).toBe(200)
    })

    it('should include width/height in img tag for result layout', async () => {
        const req = new Request('http://localhost:3000/api/og?layoutType=result&imageUrl=https://example.com/image.jpg') as any as NextRequest
        const res: any = await GET(req)

        expect(res.status).toBe(200)

        // The element should be the one from lines 60-96 in route.tsx
        const container = res.element

        // React children structure verification
        // container children: [background_div, img]
        let children = container.props.children
        if (!Array.isArray(children)) {
            children = [children]
        }

        // Find img tag - simplified check since we are in node environment mocking react elements
        // The img tag is the second child in the layout
        const img = children[1]

        expect(img).toBeDefined()
        expect(img.type).toBe('img')
        expect(img.props.src).toBe('https://example.com/image.jpg')
        // Important Check: width/height must be present
        expect(img.props.width).toBe('800')
        expect(img.props.height).toBe('630')
    })
})
