'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './HeroCarousel.module.css'
import { Quiz } from '@/types'

interface HeroCarouselProps {
    quizzes: Quiz[]
}

export default function HeroCarousel({ quizzes }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(1) // Start at 1 for cloned slide
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [dragOffset, setDragOffset] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const carouselRef = useRef<HTMLDivElement>(null)

    // Create infinite loop by cloning first and last slides
    const extendedQuizzes = quizzes.length > 1
        ? [quizzes[quizzes.length - 1], ...quizzes, quizzes[0]]
        : quizzes

    useEffect(() => {
        if (quizzes.length <= 1) return

        const interval = setInterval(() => {
            if (!isDragging) {
                handleSlideChange(currentIndex + 1)
            }
        }, 4000)

        return () => clearInterval(interval)
    }, [quizzes.length, isDragging, currentIndex])

    const handleSlideChange = (newIndex: number) => {
        setIsTransitioning(true)
        setCurrentIndex(newIndex)

        // Reset to real slide after transition
        if (newIndex === 0) {
            setTimeout(() => {
                setIsTransitioning(false)
                setCurrentIndex(quizzes.length)
            }, 500)
        } else if (newIndex === quizzes.length + 1) {
            setTimeout(() => {
                setIsTransitioning(false)
                setCurrentIndex(1)
            }, 500)
        }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        setStartX(e.pageX)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true)
        setStartX(e.touches[0].pageX)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        const currentX = e.pageX
        const diff = currentX - startX
        setDragOffset(diff)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return
        const currentX = e.touches[0].pageX
        const diff = currentX - startX
        setDragOffset(diff)
    }

    const handleDragEnd = () => {
        setIsDragging(false)

        if (Math.abs(dragOffset) > 50) {
            if (dragOffset > 0) {
                handleSlideChange(currentIndex - 1)
            } else {
                handleSlideChange(currentIndex + 1)
            }
        }

        setDragOffset(0)
    }

    const goToSlide = (index: number) => {
        handleSlideChange(index + 1) // +1 for cloned first slide
    }

    if (quizzes.length === 0) {
        return null
    }

    // Calculate actual index for dots
    const actualIndex = quizzes.length > 1
        ? (currentIndex - 1 + quizzes.length) % quizzes.length
        : 0

    return (
        <div className={styles.heroContainer}>
            <div
                ref={carouselRef}
                className={styles.carouselWrapper}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleDragEnd}
                style={{
                    cursor: isDragging ? 'grabbing' : 'grab'
                }}
            >
                <div
                    className={styles.slidesContainer}
                    style={{
                        transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
                        transition: (isDragging || !isTransitioning) ? 'none' : 'transform 0.5s ease-out'
                    }}
                >
                    {extendedQuizzes.map((quiz, index) => (
                        <Link
                            key={`${quiz.id}-${index}`}
                            href={`/quiz/${quiz.id}`}
                            className={styles.slideContent}
                            onClick={(e) => {
                                if (isDragging || Math.abs(dragOffset) > 5) {
                                    e.preventDefault()
                                }
                            }}
                        >
                            <div className={styles.imageContainer}>
                                {quiz.imageUrl ? (
                                    <Image
                                        src={quiz.imageUrl}
                                        alt={quiz.title}
                                        fill
                                        className={styles.heroImage}
                                        draggable={false}
                                        sizes="(max-width: 768px) 100vw, 1200px"
                                        priority={index === 1} // Index 1 is the first real slide because of cloning
                                    />
                                ) : (
                                    <div className={styles.placeholderImage}>
                                        <span>No Image</span>
                                    </div>
                                )}
                                <div className={styles.overlay} />
                            </div>
                            <div className={styles.textContent}>
                                <h2 className={styles.heroTitle}>{quiz.title}</h2>
                                <p className={styles.heroDescription}>{quiz.description}</p>
                                <button className={styles.playButton} onClick={(e) => e.preventDefault()}>
                                    지금 시작하기 →
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>

                {quizzes.length > 1 && (
                    <div className={styles.dots}>
                        {quizzes.map((_, index) => (
                            <button
                                key={index}
                                className={`${styles.dot} ${index === actualIndex ? styles.dotActive : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    goToSlide(index)
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
