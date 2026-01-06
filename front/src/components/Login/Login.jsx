import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import WelcomeButton from '../Buttons/WelcomeButton';
import Logo from '../../assets/ProjectLogo.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:3001/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('¡Bienvenido! Redirigiendo...');
                console.log('Datos recibidos del servidor:', data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                const realUserId = data.user.PK_UserID || data.user.id || data.user._id;

                if (realUserId) {
                    localStorage.setItem('userId', realUserId);
                } else {
                    console.error("ERROR: No s'ha trobat un ID vàlid en l'usuari rebut", data.user);
                }

                setTimeout(() => {
                    navigate('/homePage');
                }, 1500);
            } else {
                setMessage(data.message);
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            setMessage('No s\'ha pogut connectar amb el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='login-page-container'>
            <header className="login-header">
                <img src={Logo} alt="Compasity Logo" className="login-logo" />
            </header>
            
            <main className='login-main'>
                <div className='login-box'>
                    <h2 className="login-title">Compasity</h2>
                    
                    <form className='login-form' onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="username">Usuari o Correu</label>
                            <input 
                                type="text" 
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Escriu el teu usuari"
                                required 
                                disabled={isLoading}
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Contrasenya</label>
                            <input 
                                type="password" 
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Escriu la teva contrasenya"
                                required 
                                disabled={isLoading}
                            />
                        </div>

                        {message && (
                            <div className={message.includes('Bienvenido') ? 'success-message' : 'error-message'}>
                                {message}
                            </div>
                        )}

                        <WelcomeButton type="submit" disabled={isLoading}>
                            {isLoading ? 'Iniciant...' : 'Inicia Sessió'}
                        </WelcomeButton>
                    </form>
                    
                    <div className="register-link">
                        <p>No tens un compte? <span onClick={handleRegisterClick}>Registrat aqui</span></p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Login;