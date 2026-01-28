'use client'

import { createQuiz } from '@/actions/quiz'
import styles from '../admin.module.css'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CreateQuizPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/admin" className={styles.actionButton}>
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className={styles.title}>Create New Quiz</h1>
                </div>
            </div>

            <form action={createQuiz} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="title" className={styles.label}>Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        className={styles.input}
                        required
                        placeholder="e.g. What Christmas Gift are you?"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description" className={styles.label}>Description</label>
                    <textarea
                        id="description"
                        name="description"
                        className={styles.textarea}
                        required
                        placeholder="A short description of the quiz..."
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="imageUrl" className={styles.label}>Cover Image URL</label>
                    <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        className={styles.input}
                        placeholder="https://example.com/image.jpg"
                    />
                </div>

                <button type="submit" className={styles.submitButton}>
                    Create Quiz
                </button>
            </form>
        </div>
    )
}
