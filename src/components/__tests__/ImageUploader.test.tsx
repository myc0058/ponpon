/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ImageUploader from '../ImageUploader'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
    supabase: {
        storage: {
            from: jest.fn().mockReturnThis(),
            upload: jest.fn(),
            getPublicUrl: jest.fn()
        }
    }
}))

// Mock window.alert
window.alert = jest.fn()

describe('ImageUploader', () => {
    const defaultProps = {
        name: 'test-image',
        bucketName: 'test-bucket'
    }

    beforeEach(() => {
        jest.clearAllMocks()
            // Reset storage mocks
            ; (supabase.storage.from as jest.Mock).mockClear()
            ; ((supabase.storage as any).upload as jest.Mock).mockReset()
            ; ((supabase.storage as any).getPublicUrl as jest.Mock).mockReset()
    })

    it('should render upload placeholder initially', () => {
        render(<ImageUploader {...defaultProps} />)

        expect(screen.getByText('이미지 업로드')).toBeInTheDocument()

        const hiddenInput = document.querySelector('input[name="test-image"]')
        expect(hiddenInput).toHaveValue('')
    })

    it('should render preview if defaultValue is provided', () => {
        render(<ImageUploader {...defaultProps} defaultValue="https://example.com/image.jpg" />)

        const img = screen.getByRole('img', { name: 'Preview' })
        expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')

        const hiddenInput = document.querySelector('input[name="test-image"]')
        expect(hiddenInput).toHaveValue('https://example.com/image.jpg')
    })

    it('should handle file upload successfully', async () => {
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })

        // Mock URL.createObjectURL and FileReader for image optimization
        const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

        // Mocking FileReader
        const originalFileReader = window.FileReader;
        (window as any).FileReader = jest.fn().mockImplementation(() => ({
            readAsDataURL: jest.fn().mockImplementation(function (this: any) {
                this.onload({ target: { result: mockDataUrl } })
            }),
        }));

        // Mocking Image and Canvas
        const originalImage = window.Image;
        (window as any).Image = jest.fn().mockImplementation(() => {
            const img = {
                onload: null as any,
                onerror: null as any,
                set src(s: string) {
                    setTimeout(() => { if (img.onload) img.onload() }, 0)
                },
                width: 100,
                height: 100
            };
            return img;
        });

        const originalCreateElement = document.createElement;
        document.createElement = jest.fn().mockImplementation((tagName) => {
            if (tagName === 'canvas') {
                return {
                    getContext: () => ({ drawImage: jest.fn() }),
                    toBlob: (cb: any) => cb(new Blob(['compressed'], { type: 'image/avif' })),
                    width: 0,
                    height: 0
                }
            }
            return originalCreateElement.call(document, tagName)
        })

        let resolveUpload: any
        const uploadPromise = new Promise((resolve) => { resolveUpload = resolve })

            // Mock upload with controlled promise
            ; ((supabase.storage as any).upload as jest.Mock).mockReturnValue(uploadPromise)

            // Mock public URL generation
            ; ((supabase.storage as any).getPublicUrl as jest.Mock).mockReturnValue({
                data: { publicUrl: 'https://supabase.co/storage/v1/object/public/test-bucket/path/to/image.avif' }
            })

        render(<ImageUploader {...defaultProps} />)

        const input = document.querySelector('input[type="file"]') as HTMLInputElement

        // Trigger file select
        fireEvent.change(input, { target: { files: [file] } })

        // Check loading state immediately (promise pending)
        expect(screen.getByText('업로드...')).toBeInTheDocument()

        // Resolve upload
        await act(async () => {
            resolveUpload({ data: { path: 'path/to/image.png' }, error: null })
        })

        // Verify successful state update
        await waitFor(() => {
            const img = screen.getByRole('img', { name: 'Preview' })
            expect(img).toHaveAttribute('src', 'https://supabase.co/storage/v1/object/public/test-bucket/path/to/image.avif')
        })

        // Check loading state removed
        expect(screen.queryByText('업로드...')).not.toBeInTheDocument()
    })

    it('should handle upload error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
        const file = new File(['(x_x)'], 'bad.png', { type: 'image/png' })

            ; ((supabase.storage as any).upload as jest.Mock).mockResolvedValue({
                data: null,
                error: new Error('Upload failed')
            })

        render(<ImageUploader {...defaultProps} />)

        const input = document.querySelector('input[type="file"]') as HTMLInputElement

        await act(async () => {
            fireEvent.change(input, { target: { files: [file] } })
        })

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('이미지 업로드에 실패했습니다.')
        })

        expect(screen.queryByRole('img', { name: 'Preview' })).not.toBeInTheDocument()

        consoleSpy.mockRestore()
    })

    it('should handle image removal', () => {
        render(<ImageUploader {...defaultProps} defaultValue="https://example.com/image.jpg" />)

        const removeButton = screen.getByTitle('이미지 삭제')

        fireEvent.click(removeButton)

        expect(screen.queryByRole('img', { name: 'Preview' })).not.toBeInTheDocument()
        expect(screen.getByText('이미지 업로드')).toBeInTheDocument()
    })
})
