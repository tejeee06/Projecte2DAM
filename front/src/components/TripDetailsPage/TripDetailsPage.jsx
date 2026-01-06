import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Map3DTab from '../Tabs/Map3Dtab';
import ItineraryTab from '../Tabs/Itinerarytab';
import ExpensesTab from '../Tabs/Expensetab';
import ParticipantsTab from '../Tabs/Participantstab';
import logo from '../../assets/ProjectLogo.png';
import './TripDetails.css'; 

const TripDetailsPage = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [tripData, setTripData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('itinerary');

    const getSafeUserId = () => {
        const storedId = localStorage.getItem('userId');
        
        if (storedId && storedId !== 'undefined' && storedId !== 'null' && !isNaN(storedId)) {
            return parseInt(storedId, 10);
        }

        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userObj = JSON.parse(userStr);
                const id = userObj.PK_UserID || userObj.id || userObj._id;
                return id ? parseInt(id, 10) : 0;
            }
        } catch (e) {
            console.error("Error recuperant l'usuari", e);
        }
        return 0;
    };

    const currentUserId = getSafeUserId();

    const fetchDetails = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/trips/details/${tripId}`);
            if (!response.ok) throw new Error('Error al carregar els detalls del viatge');
            const data = await response.json();
            
            if (data.cities) {
                data.cities = data.cities.map(c => ({ ...c, days: c.days || 1 }));
            }
            setTripData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [tripId]);

    const handleCitiesUpdate = (updatedCities) => {
        setTripData(prev => ({
            ...prev,
            cities: updatedCities
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) return <div className="loading-container">Carregant...</div>;
    if (!tripData) return <div className="error-container">Error.</div>;

    return (
        <div className="trip-details-container">
            <header className="trip-header">
                <div className="header-logo-section" onClick={() => navigate('/HomePage')}>
                    <img src={logo} alt="Compasity Logo" className="header-logo" />
                </div>
            </header>

            <div className="trip-main-content">
                <div className="trip-info-hero">
                    <h1 className="trip-title-main">{tripData.name}</h1>
                    <div className="trip-dates-badge">
                        📅 {formatDate(tripData.startDate)} - {formatDate(tripData.endDate)}
                    </div>
                </div>

                <nav className="tabs-navigation">
                    {['itinerary', 'map3d', 'expenses', 'participants'].map(tab => (
                        <button 
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`} 
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'itinerary' && '📍 Itinerari'}
                            {tab === 'map3d' && '🗺️ Mapa'}
                            {tab === 'expenses' && '💰 Despeses'}
                            {tab === 'participants' && '👥 Participants'}
                        </button>
                    ))}
                </nav>

                <main className="tab-content-area">
                    {activeTab === 'itinerary' && (
                        <ItineraryTab 
                            cities={tripData.cities} 
                            totalTripDays={tripData.totalDays || 7}
                            onCitiesUpdate={handleCitiesUpdate}
                        />
                    )}
                    
                    {activeTab === 'map3d' && <Map3DTab cities={tripData.cities} />}
                    {activeTab === 'expenses' && <ExpensesTab />}
                    
                    {activeTab === 'participants' && (
                        <ParticipantsTab 
                            tripId={tripData.id}
                            participants={tripData.participants}
                            creatorId={tripData.creatorId}
                            currentUserId={currentUserId}
                            onUpdate={fetchDetails} 
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default TripDetailsPage;