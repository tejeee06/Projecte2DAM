import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import WelcomeButton from '../Buttons/WelcomeButton';
import Logo from '../../assets/ProjectLogo.png';

const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (

        <div className='login-page-container'>

            <header className="login-header">

                <img src={Logo} alt="Compasity Logo" className="login-logo" />

            </header>

            <main className='login-main'>

                <div className='login-box'>

                    <h2 className="login-title">Compasity</h2>

                    <form className='login-form'>

                        <div className="input-group">

                            <label htmlFor="username">Usuari</label>
                            <input 
                                type="text" 
                                id="Usuari"
                                value={username}
                                placeholder="Escriu el teu usuari"
                                required 
                            />

                        </div>

                        <div className="input-group">

                            <label htmlFor="password">Contrasenya</label>
                            <input 
                                type="password" 
                                id="password"
                                value={password}
                                placeholder="Escriu la teva contrasenya"
                                required 
                            />

                        </div>

                        <WelcomeButton type="submit">
                            Inicia Sessió
                        </WelcomeButton>

                    </form>

                    <div className="register-link">

                        <p>No tens un compte? <span>Registrat aqui</span></p>

                    </div>

                </div>

            </main>

        </div>


    )
}

export default Login;