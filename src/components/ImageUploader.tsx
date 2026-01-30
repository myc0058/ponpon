'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react'
import { getBustedImageUrl } from '@/lib/image-utils'

interface ImageUploaderProps {
    defaultValue?: string | null
    name: string
    bucketName?: string
    placeholder?: string
}

export default function ImageUploader({
    defaultValue,
    name,
    bucketName = 'quiz-images',
    placeholder = '이미지 업로드'
}: ImageUploaderProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(defaultValue ? getBustedImageUrl(defaultValue) : null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            // 이미지 압축 및 WebP 변환
            const optimizedFile = await optimizeImage(file)

            // 파일명 생성: 날짜 + 랜덤문자열 + 확장자 (.webp로 고정)
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`
            const filePath = `${fileName}`

            // Supabase 스토리지에 업로드
            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, optimizedFile, {
                    contentType: 'image/webp',
                    upsert: true
                })

            if (uploadError) {
                throw uploadError
            }

            // 공개 URL 가져오기
            const { data } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath)

            setImageUrl(getBustedImageUrl(data.publicUrl))
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('이미지 업로드에 실패했습니다.')
        } finally {
            setIsUploading(false)
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    // 클라이언트 사이드 이미지 최적화 함수
    const optimizeImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = (event) => {
                const img = new Image()
                img.src = event.target?.result as string
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    const MAX_WIDTH = 1200
                    const MAX_HEIGHT = 1200
                    let width = img.width
                    let height = img.height

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width
                            width = MAX_WIDTH
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height
                            height = MAX_HEIGHT
                        }
                    }

                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext('2d')
                    ctx?.drawImage(img, 0, 0, width, height)

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob)
                            } else {
                                reject(new Error('Canvas toBlob failed'))
                            }
                        },
                        'image/webp',
                        0.8 // 품질 설정
                    )
                }
                img.onerror = (err) => reject(err)
            }
            reader.onerror = (err) => reject(err)
        })
    }

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault() // 폼 제출 방지
        setImageUrl(null)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            <input type="hidden" name={name} value={imageUrl || ''} />

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                padding: '0.5rem',
                backgroundColor: 'white'
            }}>
                {imageUrl ? (
                    <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={getBustedImageUrl(imageUrl)}
                            alt="Preview"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '0.25rem'
                            }}
                        />
                        <button
                            onClick={handleRemove}
                            style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                background: '#ef4444',
                                color: 'white',
                                borderRadius: '50%',
                                width: '16px',
                                height: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0
                            }}
                            title="이미지 삭제"
                        >
                            <X size={10} />
                        </button>
                    </div>
                ) : (
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8'
                    }}>
                        <ImageIcon size={20} />
                    </div>
                )}

                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {imageUrl ? imageUrl.split('?')[0].split('/').pop() : placeholder}
                    </div>
                </div>

                <div style={{ position: 'relative' }}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                            zIndex: 10
                        }}
                        disabled={isUploading}
                    />
                    <button
                        type="button"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            background: isUploading ? '#cbd5e1' : '#eff6ff',
                            color: isUploading ? '#64748b' : '#2563eb',
                            border: 'none',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: isUploading ? 'default' : 'pointer'
                        }}
                    >
                        {isUploading ? (
                            <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <Upload size={14} />
                        )}
                        {isUploading ? '업로드...' : '업로드'}
                    </button>
                </div>
            </div>
            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
