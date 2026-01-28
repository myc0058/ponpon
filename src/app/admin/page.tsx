import { getQuizzes } from '@/actions/quiz'
import Link from 'next/link'
import styles from './admin.module.css'
import { Plus, Edit } from 'lucide-react'

export default async function AdminPage() {
    const quizzes = await getQuizzes()

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
                            <h2 className={styles.cardTitle}>{quiz.title}</h2>
                            <p className={styles.cardDescription}>{quiz.description}</p>
                            <div className={styles.cardActions}>
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
