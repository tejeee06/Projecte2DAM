import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import WelcomeButton from '../Buttons/WelcomeButton';
import Logo from '../../assets/ProjectLogo.png';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        surnames: '',
        userName: '',
        email: '',
        password: '',
        description: ''
    });

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:3001/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Registre exitos! Redirigint  al login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setMessage(data.message || 'Error en el registre. Intenta ho de nou.');
            }

        } catch (error) {
            console.error('Error en el fetch:', error);
            setMessage('No s ha pogut connectar amb el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='register-page-container'>
            <header className="register-header">
                <img src={Logo} alt="Compasity Logo" className="register-logo" />
            </header>

            <main className='register-main'>
                <div className='register-box'>
                    <h2 className="register-title">Crea el teu compte</h2>

                    <form className='register-form' onSubmit={handleSubmit}>
                        
                        <div className="form-row">
                            <div className="input-group">
                                <label htmlFor="name">Nom</label>
                                <input 
                                    type="text" 
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="El teu nom"
                                    required 
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="surnames">Cognoms</label>
                                <input 
                                    type="text" 
                                    id="surnames"
                                    name="surnames"
                                    value={formData.surnames}
                                    onChange={handleChange}
                                    placeholder="Els teus cognoms"
                                    required 
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="userName">Nom d'usuari</label>
                            <input 
                                type="text" 
                                id="userName"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                                placeholder="Escriu un nom d'usuari"
                                required 
                                disabled={isLoading}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">Correu electrònic</label>
                            <input 
                                type="email" 
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="el.teu@correu.com"
                                required 
                                disabled={isLoading}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Contrasenya</label>
                            <input 
                                type="password" 
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Escriu una contrasenya"
                                required 
                                disabled={isLoading}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="description">Descripció (opcional)</label>
                            <textarea 
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Una breu descripció sobre tu..."
                                disabled={isLoading}
                            />
                        </div>

                        {message && (
                            <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
                                {message}
                            </div>
                        )}

                        <WelcomeButton type="submit" disabled={isLoading}>
                            {isLoading ? 'Registrant...' : 'Registra\'m'}
                        </WelcomeButton>
                    </form>

                    <div className="login-link">
                        <p>Ja tens un compte? <span onClick={() => navigate('/login')}>Inicia sessió</span></p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Register;