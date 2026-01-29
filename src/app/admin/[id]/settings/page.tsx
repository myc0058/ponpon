import { getQuizWithDetails, updateQuiz, deleteQuiz } from '@/actions/quiz'
import styles from '../edit/editor.module.css'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { redirect } from 'next/navigation'
import DeleteQuizButton from './DeleteQuizButton'
import ImageUploader from '@/components/ImageUploader'

export const dynamic = 'force-dynamic'

export default async function QuizSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const quiz = await getQuizWithDetails(id)

    // Forced refresh at 2026-01-28 11:18
    if (!quiz) {
        return <div>Quiz not found</div>
    }

    console.log(`[SettingsPage Render] ID: ${id}, typeCodeLimit: ${quiz.typeCodeLimit}, isVisible: ${quiz.isVisible}`)

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
                                대표 이미지
                            </label>
                            <ImageUploader
                                name="imageUrl"
                                defaultValue={quiz.imageUrl}
                                placeholder="퀴즈 썸네일 이미지 업로드"
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
                        <div>
                            <label className={styles.label}>
                                결과 도출 코드 개수 (조합형 전용)
                            </label>
                            <input
                                name="typeCodeLimit"
                                type="number"
                                defaultValue={quiz.typeCodeLimit}
                                className={styles.input}
                                min={1}
                                max={10}
                            />
                            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                                선택된 답변 중 빈도수가 높은 상위 N개의 코드를 합쳐 결과를 만듭니다. (예: 2 설정 시 'E'+'T' = 'ET')
                            </p>
                        </div>
                        <div>
                            <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="isVisible"
                                    defaultChecked={quiz.isVisible}
                                    style={{ width: '1.2rem', height: '1.2rem' }}
                                />
                                공개 설정 (체크 시 메인 목록에 노출)
                            </label>
                            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', marginLeft: '1.8rem' }}>
                                해제 시 링크를 아는 사람만 접근할 수 있습니다 (테스트 용도).
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
