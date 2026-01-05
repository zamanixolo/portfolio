'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navigation.module.css';
import ThemeToggleButton from './ThemeToggleButton';

export default function Navigation() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Don't show nav on admin pages, login page
    if (pathname?.startsWith('/admin')) return null;
    if (pathname?.startsWith('/login')) return null;

    return (
        <>
            <motion.nav
                className={`${styles.nav} main-nav`}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <Link href="/" className={styles.logo}>
                    Portfolio
                </Link>
                
                <button 
                    className={styles.burger} 
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    <div className={`${styles.burgerLine} ${isOpen ? styles.open : ''}`} />
                    <div className={`${styles.burgerLine} ${isOpen ? styles.open : ''}`} />
                </button>
            </motion.nav>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.menuOverlay}
                        initial={{ opacity: 0, y: '-100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '-100%' }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className={styles.menuLinks}>
                            <Link href="/" className={styles.menuLink}>Work</Link>
                            <Link href="/about" className={styles.menuLink}>About</Link>
                            <Link href="/contact" className={styles.menuLink}>Contact</Link>
                            <div className={styles.themeToggleWrapper}>
                                <ThemeToggleButton />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
