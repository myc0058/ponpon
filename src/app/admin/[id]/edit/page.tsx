import { getQuizWithDetails, createQuestion, deleteQuestion, createOption, deleteOption, createResult, deleteResult } from '@/actions/quiz'
import styles from './editor.module.css'
import Link from 'next/link'
import { ArrowLeft, Trash2, Plus } from 'lucide-react'

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const quiz = await getQuizWithDetails(id)

    if (!quiz) {
        return <div>Quiz not found</div>
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin">
                    <ArrowLeft />
                </Link>
                <h1 className={styles.title}>Edit: {quiz.title}</h1>
                <Link
                    href={`/admin/${quiz.id}/settings`}
                    className={styles.button}
                    style={{ marginLeft: 'auto' }}
                >
                    ⚙️ 설정
                </Link>
            </div>

            {/* 도움말 섹션 */}
            {quiz.resultType === 'SCORE_BASED' ? (
                <div className={styles.section} style={{ backgroundColor: '#eff6ff', border: '2px solid #3b82f6', borderRadius: '8px', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        💡 점수 기반 결과 시스템 사용 방법
                    </h3>
                    <div style={{ fontSize: '0.95rem', color: '#1e3a8a', lineHeight: '1.8' }}>
                        <p style={{ marginBottom: '0.5rem' }}><strong>1. 질문 추가:</strong> 각 질문에 여러 개의 선택지(옵션)를 추가합니다.</p>
                        <p style={{ marginBottom: '0.5rem' }}><strong>2. 옵션 점수 설정:</strong> 각 선택지에 점수를 부여합니다 (예: 0~10점).</p>
                        <p style={{ marginBottom: '0.5rem' }}><strong>3. 결과 범위 설정:</strong> 총점에 따라 어떤 결과가 나올지 범위를 지정합니다.</p>
                        <div style={{ backgroundColor: '#dbeafe', padding: '1rem', borderRadius: '6px', marginTop: '1rem', fontSize: '0.85rem' }}>
                            <strong>📊 예시:</strong> 질문 3개(최대 10점씩) → 총점 0-30점<br />
                            • 결과 A: 0-10점 / 결과 B: 11-20점 / 결과 C: 21-30점
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.section} style={{ backgroundColor: '#f0fdf4', border: '2px solid #22c55e', borderRadius: '8px', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        💡 조합형 타입 시스템 사용 방법
                    </h3>
                    <div style={{ fontSize: '0.95rem', color: '#14532d', lineHeight: '1.8' }}>
                        <p style={{ marginBottom: '0.5rem' }}><strong>1. 옵션 코드 부여:</strong> 각 선택지에 성향 코드(A, B, 1, 2 등)를 입력합니다.</p>
                        <p style={{ marginBottom: '0.5rem' }}><strong>2. 결과 조합 설정:</strong> 결과 데이터에 코드 조합(예: A1, B2)을 입력합니다.</p>
                        <p style={{ marginBottom: '0.5rem' }}><strong>3. 결과 정산:</strong> 사용자가 선택한 각 위치(자릿수)별로 가장 많이 나온 코드를 합쳐 최종 결과를 결정합니다.</p>
                        <div style={{ backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '6px', marginTop: '1rem', fontSize: '0.85rem' }}>
                            <strong>📊 활용 팁:</strong> MBTI(4자리)뿐만 아니라 2자리, 3자리 등 자유로운 조합이 가능합니다.<br />
                            (예: '동물(A/B) + 과일(1/2)' 형식으로 'A1', 'B2' 등의 결과 매칭 가능)
                        </div>
                    </div>
                </div>
            )}

            {/* 질문 섹션 */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>질문 관리</h2>
                <div className={styles.list}>
                    {quiz.questions.map((q) => (
                        <div key={q.id} className={styles.item}>
                            <div className={styles.itemHeader}>
                                <span className={styles.itemContent}>Q{q.order}: {q.content}</span>
                                <form action={deleteQuestion.bind(null, q.id, quiz.id)}>
                                    <button type="submit" className={`${styles.button} ${styles.deleteButton}`}>
                                        <Trash2 size={16} />
                                    </button>
                                </form>
                            </div>

                            {/* 옵션 리스트 */}
                            <div className={styles.optionsList}>
                                {q.options.map((opt) => (
                                    <div key={opt.id} className={styles.optionItem}>
                                        <span>
                                            {opt.content}
                                            {quiz.resultType === 'TYPE_BASED' && opt.resultTypeCode && (
                                                <span className={styles.badge}>타입: {opt.resultTypeCode}</span>
                                            )}
                                            {quiz.resultType === 'SCORE_BASED' && (
                                                <span className={styles.badge}>점수: {opt.score}</span>
                                            )}
                                        </span>
                                        <form action={deleteOption.bind(null, opt.id, quiz.id)}>
                                            <button type="submit" className={`${styles.button} ${styles.deleteButton}`}>
                                                <Trash2 size={14} />
                                            </button>
                                        </form>
                                    </div>
                                ))}

                                {/* 옵션 추가 폼 */}
                                <form action={createOption.bind(null, q.id, quiz.id)} className={styles.form}>
                                    <input name="content" placeholder="옵션 내용" className={styles.input} required />
                                    {quiz.resultType === 'SCORE_BASED' ? (
                                        <input name="score" type="number" placeholder="점수" className={styles.input} defaultValue={0} style={{ width: '80px' }} />
                                    ) : (
                                        <input name="resultTypeCode" placeholder="코드 (E/I)" className={styles.input} style={{ width: '100px' }} />
                                    )}
                                    <button type="submit" className={styles.button}>옵션 추가</button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 질문 추가 폼 */}
                <form action={createQuestion.bind(null, quiz.id)} className={styles.form} style={{ marginTop: '2rem' }}>
                    <h4>새 질문 추가</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
                        <input name="order" type="number" placeholder="순서" className={styles.input} style={{ width: '70px' }} defaultValue={quiz.questions.length + 1} />
                        <input name="content" placeholder="질문 내용을 입력하세요" className={styles.input} style={{ flex: 1, minWidth: '200px' }} required />
                        <input name="imageUrl" placeholder="이미지 URL (선택 사항)" className={styles.input} style={{ flex: 1, minWidth: '200px' }} />
                        <button type="submit" className={styles.button}><Plus size={16} /> 질문 추가</button>
                    </div>
                </form>
            </div>

            {/* 결과 섹션 */}
            <div className={styles.section} style={{
                backgroundColor: quiz.resultType === 'SCORE_BASED' ? '#fef3c7' : '#f0f9ff',
                border: `2px solid ${quiz.resultType === 'SCORE_BASED' ? '#f59e0b' : '#3b82f6'}`,
                borderRadius: '8px', padding: '1rem', marginBottom: '1rem'
            }}>
                <p style={{ fontSize: '0.9rem', color: quiz.resultType === 'SCORE_BASED' ? '#92400e' : '#1e40af', margin: 0 }}>
                    {quiz.resultType === 'SCORE_BASED' ? (
                        <><strong>⚠️ 점수 범위 설정:</strong> 결과 범위(Min~Max)가 겹치지 않게 주의하세요.</>
                    ) : (
                        <><strong>ℹ️ 타입 매칭:</strong> 결과 코드가 옵션에서 사용된 코드들과 일치해야 결과가 도출됩니다.</>
                    )}
                </p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>결과 관리</h2>
                <div className={styles.list}>
                    {quiz.results.map((r) => (
                        <div key={r.id} className={styles.item}>
                            <div className={styles.itemHeader}>
                                <span className={styles.itemContent}>{r.title}</span>
                                <div>
                                    {quiz.resultType === 'TYPE_BASED' ? (
                                        <span className={styles.badge}>타입: {r.typeCode || '미지정'}</span>
                                    ) : (
                                        <span className={styles.badge}>범위: {r.minScore} - {r.maxScore}</span>
                                    )}
                                    {r.isPremium && <span className={`${styles.badge} ${styles.premiumBadge}`}>프리미엄</span>}
                                </div>
                                <form action={deleteResult.bind(null, r.id, quiz.id)}>
                                    <button type="submit" className={`${styles.button} ${styles.deleteButton}`}>
                                        <Trash2 size={16} />
                                    </button>
                                </form>
                            </div>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>{r.description}</p>
                        </div>
                    ))}
                </div>

                {/* 결과 추가 폼 */}
                <form action={createResult.bind(null, quiz.id)} className={styles.form} style={{ marginTop: '2rem' }}>
                    <h4>새 결과 추가</h4>
                    <div style={{ display: 'grid', gap: '0.75rem', width: '100%', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <input name="title" placeholder="결과 제목" className={styles.input} required />
                        <input name="imageUrl" placeholder="결과 이미지 URL" className={styles.input} />
                        <textarea name="description" placeholder="결과에 대한 자세한 설명을 입력하세요" className={styles.input} style={{ gridColumn: '1 / -1' }} required />

                        {quiz.resultType === 'SCORE_BASED' ? (
                            <>
                                <input name="minScore" type="number" placeholder="최소 점수" className={styles.input} required />
                                <input name="maxScore" type="number" placeholder="최대 점수" className={styles.input} required />
                            </>
                        ) : (
                            <input name="typeCode" placeholder="타입 코드 (예: INTJ, ENFP)" className={styles.input} style={{ gridColumn: '1 / -1' }} required />
                        )}

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', gridColumn: '1 / -1' }}>
                            <input type="checkbox" name="isPremium" /> 프리미엄 결과로 설정 (결제 필요)
                        </label>
                        <button type="submit" className={styles.button} style={{ gridColumn: '1 / -1' }}>결과 추가</button>
                    </div>
                </form>
            </div>

        </div >
    )
}
