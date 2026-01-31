'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';
import { Plus, Play, ExternalLink, Gamepad2 } from 'lucide-react';
import GameStatusToggle from './GameStatusToggle';

interface Game {
    id: string;
    slug: string;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    isActive: boolean;
    isFeatured: boolean;
}

export default function AdminGamesPage() {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        slug: '',
        title: '',
        description: '',
        thumbnailUrl: '',
    });

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/games');
            const data = await res.json();
            setGames(data);
        } catch (error) {
            console.error('Fetch Games Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('게임이 생성되었습니다!');
                setFormData({ slug: '', title: '', description: '', thumbnailUrl: '' });
                setShowForm(false);
                fetchGames();
            } else {
                alert('게임 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('Create Game Error:', error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Game Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={styles.createButton}
                    style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    <Plus size={20} style={{ marginRight: '0.5rem' }} />
                    {showForm ? 'Cancel' : 'Add New Game'}
                </button>
            </div>

            {showForm && (
                <div style={{ marginBottom: '3rem', animation: 'fadeIn 0.3s ease-out' }}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <h2 className={styles.label} style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>새 게임 등록</h2>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>슬러그 (영문/숫자/하이픈)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className={styles.input}
                                placeholder="예: jump-hero"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>게임 제목</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className={styles.input}
                                placeholder="게임 이름을 입력하세요"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>상세 설명</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className={styles.textarea}
                                placeholder="게임에 대한 간단한 설명을 작성하세요"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>썸네일 URL (선택)</label>
                            <input
                                type="text"
                                value={formData.thumbnailUrl}
                                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                className={styles.input}
                                placeholder="https://..."
                            />
                        </div>
                        <button type="submit" className={styles.submitButton}>등록하기</button>
                    </form>
                </div>
            )}

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>불러오는 중...</div>
            ) : (
                <div className={styles.grid}>
                    {games.map((game) => (
                        <div key={game.id} className={styles.card}>
                            {game.thumbnailUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={game.thumbnailUrl} alt={game.title} className={styles.cardImage} />
                            ) : (
                                <div className={styles.cardImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                                    <Gamepad2 size={48} color="#cbd5e1" />
                                </div>
                            )}
                            <div className={styles.cardContent}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <h2 className={styles.cardTitle} style={{ margin: 0 }}>{game.title}</h2>
                                    {game.isFeatured && (
                                        <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 800 }}>FEATURED</span>
                                    )}
                                    {!game.isActive && (
                                        <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 800 }}>HIDDEN</span>
                                    )}
                                </div>
                                <p className={styles.cardDescription}>{game.description}</p>
                                <div className={styles.cardActions}>
                                    <GameStatusToggle
                                        gameId={game.id}
                                        initialFeatured={game.isFeatured}
                                        initialActive={game.isActive}
                                        onDelete={fetchGames}
                                    />
                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                                        <Link href={`/games/${game.slug}`} target="_blank" className={styles.actionButton}>
                                            <Play size={16} style={{ marginRight: '4px' }} /> Play
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {games.length === 0 && (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>등록된 게임이 없습니다.</p>
                    )}
                </div>
            )}
        </div>
    );
}
