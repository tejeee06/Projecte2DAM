import React from "react";
import './WelcomePage.css';
import WelcomeButton from "../Buttons/WelcomeButton";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {

    const navigate = useNavigate();
    const handleLoginClick = () => {
        navigate('/login');
    };
    const handleRegisterClick = () => {
        navigate('/register');
    };

    return (

        <div className="welcome-container">

            <div className="welcome-left">

                <h1 className="welcome-title">Compasity</h1>
                <p className="welcome-slogan">Where Journeys Begin and Connections Thrive</p>

            </div>

            <div className="welcome-right">

                <div className="register-box">

                    <h2>Benvingut a Compasity</h2>

                    <div className="button-container">
                        <WelcomeButton onClick={handleRegisterClick}>Registrat</WelcomeButton>
                        <WelcomeButton onClick={handleLoginClick}>Inicia Sessio</WelcomeButton>
                    </div>

                </div>

            </div>

        </div>
    )
}

export default WelcomePage