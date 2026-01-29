import { getQuizzes } from '@/actions/quiz'
import Link from 'next/link'
import styles from './admin.module.css'
import { Plus, Edit, Star } from 'lucide-react'
import FeaturedToggle from './FeaturedToggle'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    // Fetch quizzes (ensure latest data)
    const quizzes = await getQuizzes({ includeHidden: true })

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admin Dashboard</h1>
                <Link href="/admin/create" className={styles.createButton}>
                    <Plus size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Create New Quiz
                </Link>
            </div>

            <div className={styles.grid}>
                {quizzes.map((quiz: any) => (
                    <div key={quiz.id} className={styles.card}>
                        {quiz.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={quiz.imageUrl} alt={quiz.title} className={styles.cardImage} />
                        ) : (
                            <div className={styles.cardImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                No Image
                            </div>
                        )}
                        <div className={styles.cardContent}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <h2 className={styles.cardTitle} style={{ margin: 0 }}>{quiz.title}</h2>
                                {quiz.isFeatured && (
                                    <span style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <Star size={12} fill="white" />
                                        Featured
                                    </span>
                                )}
                                {!quiz.isVisible && (
                                    <span style={{
                                        backgroundColor: '#f3f4f6',
                                        color: '#6b7280',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        비공개 (접근 가능)
                                    </span>
                                )}
                            </div>
                            <p className={styles.cardDescription}>{quiz.description}</p>
                            <div className={styles.cardActions}>
                                <FeaturedToggle quizId={quiz.id} initialFeatured={quiz.isFeatured} />
                                <Link href={`/admin/${quiz.id}/edit`}>
                                    <button className={styles.actionButton} title="Edit Content">
                                        <Edit size={18} />
                                        <span style={{ marginLeft: '0.4rem', fontSize: '0.85rem' }}>Edit Content</span>
                                    </button>
                                </Link>
                                <Link href={`/admin/${quiz.id}/settings`}>
                                    <button className={styles.actionButton} title="Settings">
                                        ⚙️
                                        <span style={{ marginLeft: '0.4rem', fontSize: '0.85rem' }}>Settings</span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {quizzes.length === 0 && (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6b7280' }}>
                        No quizzes found. Create one to get started!
                    </p>
                )}
            </div>
        </div>
    )
}
