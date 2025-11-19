export {}; // This file is intentionally left blank to avoid conflicts with its counterpart in the src/ directory. The correct version is in 'src/'.
import React, { useState, useEffect } from 'react';
import { LoginView } from './components/LoginView';
import { MainApp } from './MainApp';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Estado de carga

    useEffect(() => {
        // Se ejecuta solo en el navegador, después del renderizado inicial
        const storedUser = window.localStorage.getItem('financial-organizer-currentUser');
        setCurrentUser(storedUser);
        setIsLoading(false); // Terminamos la carga
    }, []); // El array vacío asegura que solo se ejecute una vez

    const handleLogin = (username: string) => {
        window.localStorage.setItem('financial-organizer-currentUser', username);
        setCurrentUser(username);
    };

    const handleLogout = () => {
        window.localStorage.removeItem('financial-organizer-currentUser');
        setCurrentUser(null);
    };

    if (isLoading) {
        return <div>Cargando...</div>; // Muestra un mensaje mientras se verifica la sesión
    }

    return (
        <>
            {!currentUser ? (
                <LoginView onLogin={handleLogin} />
            ) : (
                <MainApp currentUser={currentUser} onLogout={handleLogout} />
            )}
        </>
    );
};

export default App;
