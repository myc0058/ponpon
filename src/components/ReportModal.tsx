'use client'

import React, { useState, useEffect } from 'react'
import styles from './ReportModal.module.css'
import { X, AlertCircle } from 'lucide-react'
import { createReport } from '@/actions/report'
import { useToast } from '@/components/Toast'

interface ReportModalProps {
    isOpen: boolean
    onClose: () => void
    quizId: string
    resultId?: string
}

const REASONS = [
    { value: 'INCORRECT_RESULT', label: '결과가 정확하지 않아요' },
    { value: 'UI_ERROR', label: '화면이 깨지거나 작동이 안 돼요' },
    { value: 'OFFENSIVE', label: '부적절한 내용이 포함되어 있어요' },
    { value: 'OTHER', label: '기타' },
]

export default function ReportModal({ isOpen, onClose, quizId, resultId }: ReportModalProps) {
    const [reason, setReason] = useState('')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { showToast } = useToast()

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
            setReason('')
            setContent('')
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reason) {
            showToast('신고 사유를 선택해주세요.', 'error')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await createReport({
                quizId,
                resultId,
                reason,
                content,
            })

            if (res.success) {
                showToast('신고가 성공적으로 제출되었습니다. 감사합니다!', 'success')
                onClose()
            } else {
                showToast(res.error || '신고 제출에 실패했습니다.', 'error')
            }
        } catch (error) {
            showToast('신고 제출 중 시스템 오류가 발생했습니다.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.titleWrapper}>
                        <AlertCircle className={styles.icon} size={20} />
                        <h3 className={styles.title}>문제 신고하기</h3>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.section}>
                        <label className={styles.label}>신고 사유 <span className={styles.required}>*</span></label>
                        <div className={styles.radioGroup}>
                            {REASONS.map((r) => (
                                <label key={r.value} className={`${styles.radioItem} ${reason === r.value ? styles.active : ''}`}>
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r.value}
                                        checked={reason === r.value}
                                        onChange={(e) => setReason(e.target.value)}
                                        className={styles.hiddenRadio}
                                    />
                                    <div className={styles.radioCircle}>
                                        {reason === r.value && <div className={styles.radioInner} />}
                                    </div>
                                    <span className={styles.radioLabel}>{r.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <label className={styles.label}>상세 내용 (선택사항)</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="문제에 대해 더 자세히 알려주세요."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting || !reason}
                    >
                        {isSubmitting ? '제출 중...' : '신고 제출하기'}
                    </button>
                </form>
            </div>
        </div>
    )
}
