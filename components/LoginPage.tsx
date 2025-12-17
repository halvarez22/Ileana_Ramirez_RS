import React, { useState } from 'react';
import { useAuth } from './AuthContext';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = login(username, password);
        if (success) {
            onLoginSuccess();
        } else {
            setError('Usuario o contraseña incorrectos.');
        }
    };

    return (
        <section className="py-16 md:py-24 bg-ileana-light-gray">
            <div className="container mx-auto px-4 sm:px-6 max-w-md">
                <div className="bg-white p-6 md:p-8 rounded-lg shadow-ileana-lg border border-ileana-orange/20">
                    <h2 className="text-3xl font-extrabold text-ileana-orange mb-6 text-center">Iniciar Sesión</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</p>}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-ileana-orange">Usuario</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-ileana-orange/30 rounded-md shadow-sm focus:outline-none focus:ring-ileana-navy focus:border-ileana-navy bg-white text-gray-800"
                                aria-required="true"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-ileana-orange">Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-ileana-orange/30 rounded-md shadow-sm focus:outline-none focus:ring-ileana-navy focus:border-ileana-navy bg-white text-gray-800"
                                aria-required="true"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-ileana-navy hover:bg-ileana-navy/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ileana-navy transition-transform transform hover:scale-105"
                            >
                                Entrar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default LoginPage;