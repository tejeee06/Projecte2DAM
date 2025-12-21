import { useState, useEffect } from "react";
import './TripList.css';

const TripList = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleDelete = async (e, tripId) => {
        e.stopPropagation();

        if (!window.confirm("Segur que vols eliminar aquest viatge?")) return;

        try {
            const response = await fetch(`http://localhost:3001/api/trips/delete/${tripId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setTrips(trips.filter(trip => trip.id !== tripId));
            } else {
                alert("Error al eliminar el viatge");
            }
        } catch (error) {
            console.error("Error eliminando:", error);
        }
    };

    useEffect(() => {
        const fetchTrips = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (!storedUser || !storedUser.PK_UserID) return;

            try {
                const response = await fetch(`http://localhost:3001/api/trips/user/${storedUser.PK_UserID}`);
                if (response.ok) {
                    const data = await response.json();
                    setTrips(data);
                }
            } catch (error) {
                console.error("Error cargando viajes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, []);

    if (loading) return <div className="fade-in" style={{textAlign: 'center', marginTop: '2rem'}}>Carregant aventures... 🌍</div>;

    if (trips.length === 0) {
        return (
            <div className="empty-state fade-in">
                <h3>Encara no tens cap viatge!</h3>
                <p>Ves a la pestanya "Crear Viatge" per començar una nova aventura.</p>
            </div>
        );
    }

    return (
        <div className="trips-grid">

            {trips.map((trip) => (
                <div key={trip.id} className="trip-card">

                    <button 
                        className="delete-btn" 
                        onClick={(e) => handleDelete(e, trip.id)}
                        title="Eliminar viatge"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                    
                    <div className="card-header-gradient">
                        <div className="card-date-badge">
                            {trip.startDate}
                        </div>
                    </div>

                    <div className="card-body">
                        <h3 className="trip-title">{trip.name}</h3>
                        <p className="trip-desc">{trip.description || "Sense descripció"}</p>
                        
                        <div className="cities-preview">
                            {trip.cities.slice(0, 3).map((city, index) => (
                                <span key={index} className="city-pill">{city}</span>
                            ))}
                            {trip.cities.length > 3 && (
                                <span className="city-pill">+{trip.cities.length - 3}</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TripList;