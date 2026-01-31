'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './login.module.css';
import { Lock, User, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/admin';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password }),
            });

            const data = await res.json();

            if (data.success) {
                router.push(from);
                router.refresh(); // Refresh to update middleware state
            } else {
                setError(data.message || '인증에 실패했습니다.');
            }
        } catch (err) {
            setError('오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <Lock size={32} />
                    </div>
                    <h1>Admin Login</h1>
                    <p>관리자 계정으로 로그인하세요</p>
                </div>

                <form className={styles.form} onSubmit={handleLogin}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="id">ID</label>
                        <div className={styles.inputWrapper}>
                            <User size={18} className={styles.inputIcon} />
                            <input
                                id="id"
                                type="text"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                placeholder="아이디를 입력하세요"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력하세요"
                                required
                            />
                        </div>
                    </div>

                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <button
                        type="submit"
                        className={styles.loginButton}
                        disabled={isLoading}
                    >
                        {isLoading ? '로그인 중...' : (
                            <>
                                <LogIn size={20} />
                                <span>로그인</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
