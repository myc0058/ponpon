import { getTests, deleteTest } from '@/actions/test'
import Link from 'next/link'
import styles from './admin.module.css'
import { Plus, Trash2, Edit } from 'lucide-react'

export default async function AdminPage() {
    const tests = await getTests()

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admin Dashboard</h1>
                <Link href="/admin/create" className={styles.createButton}>
                    <Plus size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Create New Test
                </Link>
            </div>

            <div className={styles.grid}>
                {tests.map((test: any) => (
                    <div key={test.id} className={styles.card}>
                        {test.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={test.imageUrl} alt={test.title} className={styles.cardImage} />
                        ) : (
                            <div className={styles.cardImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                No Image
                            </div>
                        )}
                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>{test.title}</h2>
                            <p className={styles.cardDescription}>{test.description}</p>
                            <div className={styles.cardActions}>
                                <Link href={`/admin/${test.id}/edit`}>
                                    <button className={styles.actionButton} title="Edit Content">
                                        <Edit size={18} />
                                        <span style={{ marginLeft: '0.4rem', fontSize: '0.85rem' }}>Edit Content</span>
                                    </button>
                                </Link>
                                <Link href={`/admin/${test.id}/settings`}>
                                    <button className={styles.actionButton} title="Settings">
                                        ⚙️
                                        <span style={{ marginLeft: '0.4rem', fontSize: '0.85rem' }}>Settings</span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {tests.length === 0 && (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6b7280' }}>
                        No tests found. Create one to get started!
                    </p>
                )}
            </div>
        </div>
    )
}
