'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }) // Simple password only for now, or username/password
        });

        if (res.ok) {
            router.push('/admin');
            router.refresh();
        } else {
            setError('Invalid credentials');
        }
    }

    return (
        <div className="w-full flex-1 flex items-center justify-center bg-black text-white">
            <div className="w-full max-w-sm p-8 border border-white/20 rounded-lg">
                <h1 className="text-2xl font-serif mb-6 text-center">Admin Login</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-3 bg-transparent border border-white/20 rounded outline-none focus:border-white transition-colors"
                    />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="p-3 bg-white text-black font-medium rounded hover:bg-gray-200 transition-colors"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
