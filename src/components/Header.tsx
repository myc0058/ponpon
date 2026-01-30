import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logoLink}>
                    {/* <h1 className={styles.logo}>ponpon</h1> */}
                    <img
                        src={`https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/logo.webp?v=1769782140`}
                        alt="ponpon"
                        className={styles.logo}
                    />
                </Link>
            </div>
        </header>
    );
};

export default Header;
