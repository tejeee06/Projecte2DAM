import { useState, useEffect } from "react";
import './TripList.css';

const TripList = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

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