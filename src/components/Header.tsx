import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logoLink}>
                    <h1 className={styles.logo}>ponpon</h1>
                </Link>
            </div>
        </header>
    );
};

export default Header;
