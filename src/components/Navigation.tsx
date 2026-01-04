'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from './Navigation.module.css';
import ThemeToggleButton from './ThemeToggleButton';

export default function Navigation() {
    const pathname = usePathname();
    // Don't show nav on admin pages, login page, or if explicitly hidden
    if (pathname?.startsWith('/admin')) return null;

    // For login, we might want to ensure it's hidden even if JS lags, but checking pathname is fast.
    // However, if the user insists it's not centered, let's make sure we return null for '/login' purely.
    if (pathname?.startsWith('/login')) return null;

    return (
        <motion.nav
            className={`${styles.nav} main-nav ${pathname?.startsWith('/login') ? styles.hidden : ''}`}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            <Link href="/" className={styles.logo}>
                Portfolio
            </Link>
            <div className={styles.links}>
                <Link href="/" className={styles.link}>Work</Link>
                <Link href="/about" className={styles.link}>About</Link>
                <Link href="/contact" className={styles.link}>Contact</Link>
                <ThemeToggleButton />
            </div>
        </motion.nav>
    );
}
