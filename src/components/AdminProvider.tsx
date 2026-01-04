'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminContextType {
    isAdmin: boolean;
    logout: () => void;
    setCustomAction: (action: React.ReactNode) => void;
}

const AdminContext = createContext<AdminContextType>({
    isAdmin: false,
    logout: () => { },
    setCustomAction: () => { },
});

export const useAdmin = () => useContext(AdminContext);

export default function AdminProvider({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [customAction, setCustomAction] = useState<React.ReactNode>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check for admin_token cookie
        const hasToken = document.cookie.includes('admin_token=true');
        setIsAdmin(hasToken);
    }, [pathname]); // Re-check on navigation

    function logout() {
        // Clear cookie by setting it to expire in the past
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setIsAdmin(false);
        router.refresh();
        router.push('/');
    }

    return (
        <AdminContext.Provider value={{ isAdmin, logout, setCustomAction }}>
            {children}

            {/* Admin Toolbar - Only visible when logged in */}
            {isAdmin && (
                <div style={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 9999,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: 'white'
                }}>
                    {customAction && (
                        <>
                            {customAction}
                            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />
                        </>
                    )}
                    <span style={{ color: '#888' }}>Admin Mode</span>
                    <button
                        onClick={() => router.push('/admin')}
                        className="hover:text-white underline"
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={logout}
                        className="text-red-400 hover:text-red-300"
                    >
                        Logout
                    </button>
                </div>
            )}
        </AdminContext.Provider>
    );
}
