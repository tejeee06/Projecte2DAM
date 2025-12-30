import React, { useState, useEffect, useRef } from "react";
import './HomePage.css';
import { useNavigate } from "react-router-dom";
import logo from '../../assets/ProjectLogo.png'; 
import TripForm from "../TripForm/TripForm";
import TripList from "../TripList/TripList";

const HomePage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('create');
    const [username, setUsername] = useState('Viatger'); 
    const [email, setEmail] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const storedUserJSON = localStorage.getItem('user');
        
        if (storedUserJSON) {
            const storedUser = JSON.parse(storedUserJSON);
            if (storedUser.Name) {
                setUsername(storedUser.Name);
            }
            if (storedUser.Email) {
                setEmail(storedUser.Email);
            }
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleEditProfile = () => {
        setIsMenuOpen(false);
        navigate('/profile'); 
    };

    const handleFriendRequests = () => console.log("Veure sol·licituds");

    const renderContent = () => {
        switch (activeTab) {
            case 'create':
                return (
                    <div className="dynamic-content-placeholder fade-in">
                        <h3>Crear Nou Viatge</h3>
                        <TripForm />
                    </div>
                );
            case 'list':
                return (
                    <div className="trips-view-container fade-in">
                        <h3 className="trips-view-title">Els Meus Viatges</h3>
                        <TripList />
                    </div>
                );
            case 'friends':
                return (
                    <div className="dynamic-content-placeholder fade-in">
                        <h3>Amics</h3>
                        <p>Connecta amb els teus companys de ruta aquí.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <div className="logo-section">
                    <img src={logo} alt="Compasity Logo" className="header-logo" />
                </div>

                <div className="user-section" ref={menuRef}>

                    <div className="user-avatar" onClick={toggleMenu} title="Menú d'usuari">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>

                    {isMenuOpen && (
                        <div className="user-dropdown-menu">
                            <div className="menu-header">
                                <div className="user-avatar" style={{width: '36px', height: '36px', cursor:'default', background:'#f0f0f0'}}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'20px', height:'20px'}}>
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                                <div className="menu-user-info">
                                    <h4>{username}</h4>
                                    <p>{email}</p>
                                </div>
                            </div>
                            
                            <ul className="menu-options">
                                <li className="menu-item" onClick={handleEditProfile}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    El Meu Perfil
                                </li>
                                <li className="menu-item" onClick={handleFriendRequests}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    Sol·licituds d'Amistat
                                    <span className="notification-badge">2</span>
                                </li>
                            </ul>
                        </div>
                    )}
                    
                    <div className="separator"></div>

                    <button className="logout-btn" onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="logout-icon">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Tancar Sessió</span>
                    </button>
                </div>
            </header>

            <main className="home-main">
                
                <div className="welcome-banner fade-in">
                    <h2 className="dashboard-title">Hola, <span className="highlight-name">{username}</span> 👋</h2>
                    <p className="dashboard-subtitle">On et portarà la teva propera aventura?</p>
                </div>

                <div className="cards-container">
                    <div 
                        className={`nav-card ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        <div className="card-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                        </div>
                        <span>Crear Viatge</span>
                    </div>

                    <div 
                        className={`nav-card ${activeTab === 'list' ? 'active' : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        <div className="card-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                        </div>
                        <span>Els Meus Viatges</span>
                    </div>

                    <div 
                        className={`nav-card ${activeTab === 'friends' ? 'active' : ''}`}
                        onClick={() => setActiveTab('friends')}
                    >
                        <div className="card-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <span>Amics</span>
                    </div>
                </div>

                <section className="dynamic-section">
                    {renderContent()}
                </section>

            </main>
        </div>
    );
};

export default HomePage;