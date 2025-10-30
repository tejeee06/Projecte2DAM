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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Datos del formulario:', formData);
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
                            />
                        </div>

                        <WelcomeButton type="submit">
                            Registra'm
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