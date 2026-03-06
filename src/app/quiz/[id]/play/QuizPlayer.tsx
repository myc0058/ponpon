'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './play.module.css'
import { calculateTypeResult } from '@/lib/quiz-logic'
import { getBustedImageUrl } from '@/lib/image-utils'
import { formatContentJSX } from '@/lib/string-utils'
import ReportModal from '@/components/ReportModal'
import AdPopup from '@/components/AdPopup'
import { Flag, Heart, Briefcase, Search } from 'lucide-react'


type Option = {
    id: string
    content: string
    score: number
    resultTypeCode: string | null
    nextQuestionId: string | null
    targetResultId: string | null
    stateChanges: any | null
    conditions: any | null
}

type Question = {
    id: string
    content: string
    imageUrl: string | null
    order: number
    options: Option[]
}

type Quiz = {
    id: string
    title: string
    resultType: 'SCORE_BASED' | 'TYPE_BASED' | 'BRANCHING'
    typeCodeLimit: number
    questions: Question[]
    initialState: any | null
    results: {
        id: string
        typeCode: string | null
    }[]
}

export default function QuizPlayer({ quiz }: { quiz: Quiz }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [totalScore, setTotalScore] = useState(0)
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [weightedScores, setWeightedScores] = useState<Record<string, number>>({})
    const progressRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const [isReportOpen, setIsReportOpen] = useState(false)
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [pendingAnswer, setPendingAnswer] = useState<Option | null>(null)

    // RPG System State
    const [playerState, setPlayerState] = useState<any>(() => {
        // Parse initial state if exists
        try {
            return quiz.initialState || { hp: 100, inventory: [] }
        } catch (e) {
            return { hp: 100, inventory: [] }
        }
    })





    // Scroll to progress bar when question changes
    useEffect(() => {
        if (progressRef.current) {
            progressRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [currentQuestionIndex])

    // Track Quiz Start
    useEffect(() => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'Lead', {
                content_name: quiz.title,
                content_category: 'Quiz',
                content_ids: [quiz.id]
            })
        }
    }, [])

    // Safety check: if no questions, show error
    if (!quiz.questions || quiz.questions.length === 0) {
        return (
            <main className={styles.container}>
                <div className={styles.questionCard}>
                    <h2 style={{ textAlign: 'center', color: '#ef4444' }}>
                        이 퀴즈에는 아직 질문이 없습니다.
                    </h2>
                    <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                        관리자 페이지에서 질문을 추가해주세요.
                    </p>
                </div>
            </main>
        )
    }

    const currentQuestion = quiz.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

    const handleAnswer = (option: Option) => {
        // 30% chance to show popup ad (Disabled for now)
        /*
        if (Math.random() < 0.3 && !isPopupOpen) {
            setPendingAnswer(option)
            setIsPopupOpen(true)
            return
        }
        */

        processAnswer(option)
    }

    const processAnswer = (option: Option) => {
        const nextIndex = currentQuestionIndex + 1
        const isLastQuestion = nextIndex === quiz.questions.length

        let newScore = totalScore
        let newTypes = [...selectedTypes]
        let newWeightedScores = { ...weightedScores }

        if (quiz.resultType === 'SCORE_BASED') {
            newScore = totalScore + option.score
        } else {
            if (option.resultTypeCode) {
                newTypes.push(option.resultTypeCode)
                const scoreToAdd = option.score ?? 1
                newWeightedScores[option.resultTypeCode] = (newWeightedScores[option.resultTypeCode] || 0) + scoreToAdd
            }
        }

        if (quiz.resultType === 'BRANCHING') {
            // Apply RPG State Changes
            if (option.stateChanges) {
                const changes = option.stateChanges as any
                setPlayerState((prev: any) => {
                    const newState = { ...prev }
                    if (changes.hp !== undefined) newState.hp = Math.max(0, (newState.hp || 0) + changes.hp)
                    if (changes.items && Array.isArray(changes.items)) {
                        newState.inventory = Array.from(new Set([...(newState.inventory || []), ...changes.items]))
                    }
                    return newState
                })
            }

            // Check if player is dead
            if (playerState.hp <= 0 && quiz.results.length > 0) {
                // Find a "death" or failure result if possible, or just the first result as fallback
                const deathResult = quiz.results.find(r => r.id.includes('death') || r.id.includes('bad')) || quiz.results[0]
                sessionStorage.setItem(`quiz_result_${quiz.id}`, JSON.stringify({
                    type: 'BRANCHING',
                    resultId: deathResult.id
                }))
                router.push(`/quiz/${quiz.id}/analyzing`)
                return
            }

            if (option.targetResultId) {
                sessionStorage.setItem(`quiz_result_${quiz.id}`, JSON.stringify({
                    type: 'BRANCHING',
                    resultId: option.targetResultId
                }))
                router.push(`/quiz/${quiz.id}/analyzing`)
                return
            }

            // check conditions for branching
            if (option.conditions && Array.isArray(option.conditions)) {
                for (const cond of option.conditions) {
                    let met = true
                    if (cond.requiredItems && Array.isArray(cond.requiredItems)) {
                        if (!cond.requiredItems.every((item: string) => playerState.inventory?.includes(item))) {
                            met = false
                        }
                    }
                    if (cond.minHp !== undefined && playerState.hp < cond.minHp) {
                        met = false
                    }

                    if (met && (cond.nextQuestionId || cond.targetResultId)) {
                        if (cond.targetResultId) {
                            sessionStorage.setItem(`quiz_result_${quiz.id}`, JSON.stringify({
                                type: 'BRANCHING',
                                resultId: cond.targetResultId
                            }))
                            router.push(`/quiz/${quiz.id}/analyzing`)
                            return
                        }
                        if (cond.nextQuestionId) {
                            const nextIdx = quiz.questions.findIndex(q => q.id === cond.nextQuestionId)
                            if (nextIdx !== -1) {
                                setCurrentQuestionIndex(nextIdx)
                                return
                            }
                        }
                    }
                }
            }

            if (option.nextQuestionId) {
                const nextQuestionIndex = quiz.questions.findIndex(q => q.id === option.nextQuestionId)
                if (nextQuestionIndex !== -1) {
                    setCurrentQuestionIndex(nextQuestionIndex)
                } else {
                    // Fallback to next question if ID not found
                    if (!isLastQuestion) {
                        setCurrentQuestionIndex(nextIndex)
                    } else {
                        // End of quiz fallback
                        sessionStorage.setItem(`quiz_result_${quiz.id}`, JSON.stringify({
                            type: 'BRANCHING',
                            resultId: quiz.results[0]?.id || 'error'
                        }))
                        router.push(`/quiz/${quiz.id}/analyzing`)
                    }
                }
                return
            }

            // If no jump info, just move to next or finish
            if (!isLastQuestion) {
                setCurrentQuestionIndex(nextIndex)
            } else {
                sessionStorage.setItem(`quiz_result_${quiz.id}`, JSON.stringify({
                    type: 'BRANCHING',
                    resultId: quiz.results[0]?.id || 'error'
                }))
                router.push(`/quiz/${quiz.id}/analyzing`)
            }
            return
        }

        if (!isLastQuestion) {
            if (quiz.resultType === 'SCORE_BASED') {
                setTotalScore(newScore)
            } else {
                setSelectedTypes(newTypes)
                setWeightedScores(newWeightedScores)
            }
            setCurrentQuestionIndex(nextIndex)
        } else {
            // Determine final result and save to session storage
            if (quiz.resultType === 'SCORE_BASED') {
                sessionStorage.setItem(`quiz_result_${quiz.id}`, JSON.stringify({
                    type: 'SCORE',
                    score: newScore
                }))
            } else if (quiz.resultType === 'TYPE_BASED') {
                const validCodes = quiz.results.map(r => r.typeCode).filter(Boolean) as string[]
                const finalType = calculateTypeResult(newTypes, quiz.typeCodeLimit, validCodes, newWeightedScores)

                sessionStorage.setItem(`quiz_result_${quiz.id}`, JSON.stringify({
                    type: 'TYPE',
                    resultType: finalType
                }))
            }

            router.push(`/quiz/${quiz.id}/analyzing`)
        }
    }



    // useEffect(() => {
    //     setIsImageLoaded(false)
    // }, [currentQuestionIndex])

    // ... (rest of code)

    return (
        <main className={styles.container}>
            <div className={styles.questionCard}>
                <div className={styles.progressSection} ref={progressRef}>
                    <div className={styles.progressText}>
                        <span className={styles.currentStep}>{currentQuestionIndex + 1}</span>
                        <span className={styles.totalStep}>/{quiz.questions.length}</span>
                    </div>
                    <div className={styles.customProgressBar}>
                        <div
                            className={styles.customProgressFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {quiz.resultType === 'BRANCHING' && (
                    <div className={styles.statusOverlay}>
                        <div className={styles.statusItem}>
                            <div className={styles.statusLabel}>
                                <Heart size={14} className={styles.statusIcon} />
                                <span>HP</span>
                            </div>
                            <div className={styles.hpBarBackground}>
                                <div
                                    className={styles.hpBarFill}
                                    style={{ width: `${playerState.hp || 0}%` }}
                                />
                            </div>
                        </div>

                        <div className={styles.statusDivider} />

                        <div className={styles.statusItem}>
                            <div className={styles.statusLabel}>
                                <Briefcase size={14} className={styles.statusIcon} />
                                <span>소지품</span>
                            </div>
                            <div className={styles.inventoryList}>
                                {playerState.inventory && playerState.inventory.length > 0 ? (
                                    playerState.inventory.map((item: string, idx: number) => (
                                        <span key={idx} className={styles.inventoryBadge}>{item}</span>
                                    ))
                                ) : (
                                    <span className={styles.emptyInventory}>비어있음</span>
                                )}
                            </div>
                        </div>

                        {playerState.evidence !== undefined && (
                            <>
                                <div className={styles.statusDivider} />
                                <div className={styles.statusItem}>
                                    <div className={styles.statusLabel}>
                                        <Search size={14} className={styles.statusIcon} />
                                        <span>단서</span>
                                    </div>
                                    <div className={styles.evidenceBadge}>
                                        {playerState.evidence}개
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {currentQuestion.imageUrl && (
                    <div className={styles.imageWrapper}>
                        <Image
                            src={getBustedImageUrl(currentQuestion.imageUrl)}
                            alt="Question"
                            className={styles.questionImage}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            priority
                        />
                    </div>
                )}

                <div className={styles.contentAnimation} key={currentQuestion.id}>
                    <h2 className={styles.questionText}>{formatContentJSX(currentQuestion.content)}</h2>

                    <div className={styles.options}>
                        {currentQuestion.options.map((option) => (
                            <button
                                key={option.id}
                                className={styles.optionButton}
                                onClick={() => handleAnswer(option)}
                            >
                                {formatContentJSX(option.content)}
                            </button>
                        ))}
                    </div>

                    {/* 구글 애드센스 - 보기 하단 (숨김 처리) */}
                    {/* 
                    <div style={{ marginTop: '2rem', minHeight: '100px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#666' }}>
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <p>구글 애드센스 (사각/피드형)</p>
                            <ins className="adsbygoogle"
                                style={{ display: 'block' }}
                                data-ad-client="ca-pub-9702335674400881"
                                data-ad-slot="QUIZ_PLAY_BOTTOM_SLOT"
                                data-ad-format="auto"
                                data-full-width-responsive="true"></ins>
                        </div>
                    </div>
                    */}
                </div>

                {/* Preload next image */}
                {/* Preload next image with exact same props as main image to ensure cache hit */}
                {quiz.questions[currentQuestionIndex + 1]?.imageUrl && (
                    <div style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
                        <Image
                            src={getBustedImageUrl(quiz.questions[currentQuestionIndex + 1].imageUrl)!}
                            alt="preload"
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            priority
                        />
                    </div>
                )}

                <button
                    className={styles.reportButton}
                    onClick={() => setIsReportOpen(true)}
                >
                    <Flag size={14} />
                    문제가 있나요? 신고하기
                </button>
            </div>

            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                quizId={quiz.id}
            />

            <AdPopup
                isOpen={isPopupOpen}
                onClose={() => {
                    setIsPopupOpen(false)
                    if (pendingAnswer) {
                        processAnswer(pendingAnswer)
                        setPendingAnswer(null)
                    }
                }}
            />
        </main>

    )
}
