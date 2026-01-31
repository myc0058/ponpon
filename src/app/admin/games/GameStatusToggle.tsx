'use client';

import { useState } from 'react';
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GameStatusToggleProps {
    gameId: string;
    initialFeatured: boolean;
    initialActive: boolean;
    onDelete?: () => void;
}

export default function GameStatusToggle({ gameId, initialFeatured, initialActive, onDelete }: GameStatusToggleProps) {
    const [isFeatured, setIsFeatured] = useState(initialFeatured);
    const [isActive, setIsActive] = useState(initialActive);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const toggleStatus = async (type: 'featured' | 'active') => {
        setIsLoading(true);
        const newValue = type === 'featured' ? !isFeatured : !isActive;

        try {
            const res = await fetch('/api/admin/games', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: gameId,
                    [type === 'featured' ? 'isFeatured' : 'isActive']: newValue,
                }),
            });

            if (res.ok) {
                if (type === 'featured') setIsFeatured(newValue);
                else setIsActive(newValue);
                router.refresh();
            } else {
                alert('변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('Update Toggle Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('정말로 이 게임을 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.')) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/games?id=${gameId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('삭제되었습니다.');
                if (onDelete) onDelete();
                router.refresh();
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Delete Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
                onClick={() => toggleStatus('featured')}
                disabled={isLoading}
                title={isFeatured ? '추천 해제' : '추천 설정'}
                style={{
                    padding: '0.4rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #e5e7eb',
                    background: isFeatured ? '#fef3c7' : '#f9fafb',
                    color: isFeatured ? '#d97706' : '#6b7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
            >
                <Star size={18} fill={isFeatured ? '#d97706' : 'none'} />
            </button>

            <button
                onClick={() => toggleStatus('active')}
                disabled={isLoading}
                title={isActive ? '비공개로 전환' : '공개로 전환'}
                style={{
                    padding: '0.4rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #e5e7eb',
                    background: isActive ? '#ecfdf5' : '#fef2f2',
                    color: isActive ? '#059669' : '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
            >
                {isActive ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>

            <button
                onClick={handleDelete}
                disabled={isLoading}
                title="삭제"
                style={{
                    padding: '0.4rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}
