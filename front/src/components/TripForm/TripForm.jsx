import { useState } from "react";
import "./TripForm.css";

const TripForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: ''
    });

    const [cityInput, setCityInput] = useState('');
    const [cities, setCities] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddCity = (e) => {
        e.preventDefault(); // Para que no recargue la página
        if (cityInput.trim() !== '' && !cities.includes(cityInput.trim())) {
            setCities([...cities, cityInput.trim()]);
            setCityInput(''); // Limpiar input
        }
    };
    const handleRemoveCity = (cityToRemove) => {
        setCities(cities.filter(city => city !== cityToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || !storedUser.PK_UserID) {
            setMessage({ text: 'Error: No estas loguejat.', type: 'error' });
            setLoading(false);
            return;
        }

        if (cities.length === 0) {
            setMessage({ text: 'Afegeix al menys una ciutat al teu viatge.', type: 'error' });
            setLoading(false);
            return;
        }

        const tripPayload = {
            ...formData,
            creatorId: storedUser.PK_UserID,
            cities: cities
        };

        try {
            const response = await fetch('http://localhost:3001/api/trips/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tripPayload)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: '¡Viatge creat amb èxit!', type: 'success' });
                setFormData({ name: '', description: '', startDate: '', endDate: '' });
                setCities([]);
            } else {
                setMessage({ text: data.message || 'Error al crear el viatge.', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Error de connexió amb el servidor.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
        
                <div className="form-group">
                    <label>Nom del Viatge</label>
                    <input 
                        type="text" 
                        name="name" 
                        className="form-input" 
                        placeholder="El nom del teu viatge" 
                        value={formData.name}
                        onChange={handleChange}
                        required 
                    />
                </div>

                <div className="dates-row">
                    <div className="form-group">
                        <label>Data d'Inici</label>
                        <input 
                            type="date" 
                            name="startDate" 
                            className="form-input" 
                            placeholder="Quant comença el teu viatge ?"
                            value={formData.startDate}
                            onChange={handleChange}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Data de Fi</label>
                        <input 
                            type="date" 
                            name="endDate" 
                            className="form-input" 
                            placeholder="Quant acaba el teu viatge ?"
                            value={formData.endDate}
                            onChange={handleChange}
                            required 
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Ciutats a visitar</label>
                    <div className="city-input-group">
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Escriu una ciutat i prem 'Afegir'" 
                            value={cityInput}
                            onChange={(e) => setCityInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCity(e)}
                        />
                        <button type="button" className="add-city-btn" onClick={handleAddCity}>
                            Afegir
                        </button>
                    </div>
                    
                    <div className="cities-list">
                        {cities.map((city, index) => (
                            <div key={index} className="city-tag">
                                <span>{city}</span>
                                <button 
                                    type="button" 
                                    className="remove-city"
                                    onClick={() => handleRemoveCity(city)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {cities.length === 0 && <small style={{color: '#999', marginTop: '5px'}}>Cap ciutat afegida encara.</small>}
                    </div>
                </div>

                <div className="form-group">
                    <label>Descripció</label>
                    <textarea 
                        name="description" 
                        className="form-textarea" 
                        placeholder="Què farem en aquest viatge? (Opcional)"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {message.text && (
                    <div className={`feedback-msg ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <button type="submit" className="submit-trip-btn" disabled={loading}>
                    {loading ? 'Creant Viatge...' : 'Crear Viatge'}
                </button>

            </form>
        </div>
    );
};

export default TripForm;