import { getQuizWithDetails, updateQuiz, deleteQuiz } from '@/actions/quiz'
import styles from '../edit/editor.module.css'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { redirect } from 'next/navigation'
import DeleteQuizButton from './DeleteQuizButton'

export default async function QuizSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const quiz = await getQuizWithDetails(id)

    if (!quiz) {
        return <div>Quiz not found</div>
    }

    async function handleDelete() {
        'use server'
        await deleteQuiz(id)
        redirect('/admin')
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href={`/admin/${id}/edit`}>
                    <ArrowLeft />
                </Link>
                <h1 className={styles.title}>퀴즈 설정</h1>
            </div>

            {/* Quiz Metadata Form */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>기본 정보</h2>
                <form action={updateQuiz.bind(null, id)} className={styles.form}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label className={styles.label}>
                                제목
                            </label>
                            <input
                                name="title"
                                defaultValue={quiz.title}
                                className={styles.input}
                                required
                            />
                        </div>
                        <div>
                            <label className={styles.label}>
                                설명
                            </label>
                            <textarea
                                name="description"
                                defaultValue={quiz.description}
                                className={styles.input}
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className={styles.label}>
                                이미지 URL
                            </label>
                            <input
                                name="imageUrl"
                                defaultValue={quiz.imageUrl || ''}
                                className={styles.input}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        <div>
                            <label className={styles.label}>
                                결과 타입
                            </label>
                            <select
                                name="resultType"
                                defaultValue={quiz.resultType}
                                className={styles.input}
                                style={{ padding: '0.75rem' }}
                            >
                                <option value="SCORE_BASED">점수 기반 (기본)</option>
                                <option value="TYPE_BASED">타입 기반 (MBTI 스타일)</option>
                            </select>
                            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                                ⚠️ 결과 타입을 변경하면 기존 질문/결과 설정을 다시 확인해야 합니다.
                            </p>
                        </div>
                        <button type="submit" className={styles.button} style={{ alignSelf: 'flex-start' }}>
                            <Save size={16} /> 저장
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className={styles.section} style={{
                backgroundColor: '#fef2f2',
                border: '2px solid #ef4444',
                borderRadius: '8px',
                padding: '1.5rem'
            }}>
                <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>위험 구역</h2>
                <p style={{ marginBottom: '1rem', color: '#7f1d1d' }}>
                    퀴즈를 삭제하면 모든 질문, 옵션, 결과가 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                </p>
                <DeleteQuizButton onDelete={handleDelete} />
            </div>
        </div>
    )
}
