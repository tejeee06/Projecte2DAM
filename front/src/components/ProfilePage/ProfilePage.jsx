import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0e0e0'%3E%3Cpath d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z' /%3E%3C/svg%3E";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        Name: '',
        Surnames: '',
        Description: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(DEFAULT_AVATAR);

    useEffect(() => {
        const storedUserJSON = localStorage.getItem('user');
        if (!storedUserJSON) {
            navigate('/'); 
            return;
        }

        const storedUser = JSON.parse(storedUserJSON);
        setUser(storedUser);

        setFormData({
            Name: storedUser.Name || '',
            Surnames: storedUser.Surnames || '',
            Description: storedUser.Description || ''
        });

        if (storedUser.ProfilePicture) {
            setImagePreview(storedUser.ProfilePicture);
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const userId = user.PK_UserID || user.idUser || user.id;

        if (!userId) {
            alert("Error: No es troba l'ID de l'usuari.");
            setLoading(false);
            return;
        }

        try {
            const dataToSend = new FormData();
            dataToSend.append('Name', formData.Name);
            dataToSend.append('Surnames', formData.Surnames);
            dataToSend.append('Description', formData.Description);
            
            if (imageFile) {
                dataToSend.append('profileImage', imageFile);
            }

            const response = await fetch(`http://localhost:3001/api/users/update/${userId}`, {
                method: 'PUT',
                body: dataToSend,
            });

            if (response.ok) {
                const result = await response.json();
                
                const updatedUser = { 
                    ...user, 
                    ...formData,
                    ProfilePicture: result.user.ProfilePicture || user.ProfilePicture 
                };
                
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                alert("Perfil actualitzat amb èxit!");
            } else {
                const errorData = await response.json();
                alert(`Error al guardar: ${errorData.message || 'Error desconegut'}`);
            }

        } catch (error) {
            console.error("Error:", error);
            alert("Error de connexió (Assegura't que el backend corre al port 3001)");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="profile-container fade-in">
            <div className="profile-card">
                
                <div className="profile-header">
                    <h2>El Meu Perfil</h2>
                    <p>Personalitza la teva fitxa de viatger</p>
                </div>

                <form className="profile-content" onSubmit={handleSubmit}>
                    
                    <div className="photo-section">
                        <div className="image-wrapper">
                            <img 
                                src={imagePreview} 
                                alt="Perfil" 
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = DEFAULT_AVATAR;
                                }}
                            />
                        </div>
                        <label className="upload-link">
                            Canviar Foto
                            <input 
                                type="file" 
                                accept="image/*" 
                                hidden 
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>

                    <div className="form-section">
                        <div className="input-row">
                            <div className="form-group half-width">
                                <label>Nom</label>
                                <input 
                                    type="text" 
                                    name="Name" 
                                    value={formData.Name} 
                                    onChange={handleInputChange} 
                                    required 
                                />
                            </div>
                            <div className="form-group half-width">
                                <label>Cognoms</label>
                                <input 
                                    type="text" 
                                    name="Surnames" 
                                    value={formData.Surnames} 
                                    onChange={handleInputChange} 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                value={user.Email || ''} 
                                disabled 
                                className="disabled-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Sobre mi</label>
                            <textarea 
                                name="Description" 
                                value={formData.Description} 
                                onChange={handleInputChange} 
                                placeholder="Explica als teus amics quin tipus de viatger ets..."
                                rows="3"
                            />
                        </div>

                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? 'Guardant...' : 'Guardar Canvis'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;