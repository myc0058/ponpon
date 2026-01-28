'use client'

import { Trash2 } from 'lucide-react'
import styles from '../edit/editor.module.css'

interface DeleteTestButtonProps {
    onDelete: () => Promise<void>;
}

export default function DeleteTestButton({ onDelete }: DeleteTestButtonProps) {
    return (
        <button
            type="button"
            className={styles.button}
            style={{
                backgroundColor: '#ef4444',
                color: 'white',
                width: 'auto',
                padding: '0.75rem 1.5rem',
                marginTop: '1rem'
            }}
            onClick={async () => {
                if (confirm('정말로 이 테스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                    await onDelete()
                }
            }}
        >
            <Trash2 size={16} /> 테스트 삭제
        </button>
    )
}
