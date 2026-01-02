import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import logo from '../../assets/ProjectLogo.png';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0e0e0'%3E%3Cpath d='M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z' /%3E%3C/svg%3E";
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
    </svg>
);

const ProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        Username: '',
        Name: '',
        Surnames: '',
        Description: '',
        Password: '',
        ConfirmPassword: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(DEFAULT_AVATAR);

    useEffect(() => {
        const storedUserJSON = localStorage.getItem('user');
        if (!storedUserJSON) {
            navigate('/');
            return;
        }

        try {
            const storedUser = JSON.parse(storedUserJSON);
            setUser(storedUser);

            if (storedUser.ProfilePicture) {
                setImagePreview(storedUser.ProfilePicture);
            }
        } catch (error) {
            console.error("Error al llegir usuari:", error);
            navigate('/');
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

    const handleDeleteUser = () => {
        Swal.fire({
            title: 'Caution ⚠️',
            text: "Segur que vols borrar el teu usuari?, aquesta acció és irreversible!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d32f2f',
            cancelButtonColor: '#1565c0',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancel·lar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const userId = user.PK_UserID || user.idUser || user.id;
                    if (!userId) {
                        Swal.fire("Error", "No s' ha trobat el ID de l' usuari", "error");
                        return;
                    }
                    
                    const response = await fetch(`http://localhost:3001/api/users/delete/${userId}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        localStorage.removeItem('user');
                        Swal.fire(
                            'Esborrat!',
                            'El teu compte ha estat eliminat correctament.',
                            'success'
                        ).then(() => {
                            navigate('/');
                        });
                    } else {
                        const data = await response.json();
                        Swal.fire('Error', data.message || 'No s\'ha pogut esborrar l\'usuari.', 'error');
                    }
                } catch (error) {
                    console.error("Error eliminant l'usuari:", error);
                    Swal.fire('Error', 'Error de connexió amb el servidor.', 'error');
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.Password && formData.Password !== formData.ConfirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Atenció',
                text: 'Les contrasenyes no coincideixen.',
                confirmButtonColor: '#1565c0'
            });
            return;
        }

        let hasChanges = false;
        const dataToSend = new FormData();

        const currentUsername = user.Username || user.UserName || '';
        const currentName = user.Name || '';
        const currentSurnames = user.Surnames || '';
        const currentDescription = user.Description || '';

        if (formData.Username.trim() !== '') {
            if (formData.Username === currentUsername) {
                return Swal.fire({ icon: 'info', text: "El nom d'usuari és el mateix que ja tens." });
            }
            dataToSend.append('Username', formData.Username);
            hasChanges = true;
        }

        if (formData.Name.trim() !== '') {
            if (formData.Name === currentName) {
                return Swal.fire({ icon: 'info', text: "El nom és el mateix que ja tens." });
            }
            dataToSend.append('Name', formData.Name);
            hasChanges = true;
        }

        if (formData.Surnames.trim() !== '') {
            if (formData.Surnames === currentSurnames) {
                return Swal.fire({ icon: 'info', text: "Els cognoms són els mateixos que ja tens." });
            }
            dataToSend.append('Surnames', formData.Surnames);
            hasChanges = true;
        }

        if (formData.Description.trim() !== '') {
            if (formData.Description === currentDescription) {
                return Swal.fire({ icon: 'info', text: "La descripció és la mateixa que ja tens." });
            }
            dataToSend.append('Description', formData.Description);
            hasChanges = true;
        }

        if (formData.Password.trim() !== '') {
            dataToSend.append('password', formData.Password);
            hasChanges = true;
        }

        if (imageFile) {
            dataToSend.append('profileImage', imageFile);
            hasChanges = true;
        }

        if (!hasChanges) {
            Swal.fire({
                icon: 'info',
                title: 'Sense canvis',
                text: "No has modificat cap dada.",
                confirmButtonColor: '#1565c0'
            });
            return;
        }

        setLoading(true);
        const userId = user.PK_UserID || user.idUser || user.id;

        try {
            const response = await fetch(`http://localhost:3001/api/users/update/${userId}`, {
                method: 'PUT',
                body: dataToSend,
            });

            const result = await response.json();

            if (response.ok) {
                const updatedUser = {
                    ...user,
                    ...result.user
                };

                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);

                setFormData({
                    Username: '', Name: '', Surnames: '', Description: '', Password: '', ConfirmPassword: ''
                });
                setImageFile(null);

                Swal.fire({
                    title: 'Perfil Actualitzat!',
                    text: 'Dades guardades correctament.',
                    icon: 'success',
                    confirmButtonText: 'Tornar a Home',
                    confirmButtonColor: '#1565c0'
                }).then((resAlert) => {
                    if (resAlert.isConfirmed) {
                        navigate('/homePage');
                    }
                });

            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Atenció',
                    text: result.message || 'Error al guardar.'
                });
            }

        } catch (error) {
            console.error("Error de red:", error);
            Swal.fire({ icon: 'error', title: 'Error', text: "No s'ha pogut connectar amb el servidor." });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={{ padding: '20px', textAlign: 'center' }}>Carregant perfil...</div>;

    const phUsername = user.Username || user.UserName || 'El teu usuari';
    const phName = user.Name || 'El teu nom';
    const phSurnames = user.Surnames || 'Els teus cognoms';
    const phDesc = user.Description || 'Descriu-te una mica...';

    return (
        <div className="profile-container fade-in">
            <div className="profile-card">

                <Link to="/homePage" className="profile-logo-container">
                    <img src={logo} alt="Volver a Home" className="profile-logo" />
                </Link>

                <div className="profile-header">
                    <button 
                        type="button" 
                        className="delete-account-btn" 
                        onClick={handleDeleteUser}
                        title="Esborrar el compte"
                    >
                        <TrashIcon />
                    </button>
                    
                    <h2>El Meu Perfil</h2>
                    <p>Edita només els camps que vulguis canviar</p>
                </div>

                <form className="profile-content" onSubmit={handleSubmit}>

                    <div className="photo-section">
                        <div className="image-wrapper">
                            <img src={imagePreview} alt="Perfil" onError={(e) => { e.target.src = DEFAULT_AVATAR }} />
                        </div>
                        <label className="upload-link">
                            Canviar Foto
                            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                        </label>
                    </div>

                    <div className="form-section">

                        <div className="form-group">
                            <label>Nom d'usuari</label>
                            <input
                                type="text"
                                name="Username"
                                value={formData.Username}
                                onChange={handleInputChange}
                                placeholder={phUsername}
                            />
                        </div>

                        <div className="input-row">
                            <div className="form-group half-width">
                                <label>Nom</label>
                                <input
                                    type="text"
                                    name="Name"
                                    value={formData.Name}
                                    onChange={handleInputChange}
                                    placeholder={phName}
                                />
                            </div>
                            <div className="form-group half-width">
                                <label>Cognoms</label>
                                <input
                                    type="text"
                                    name="Surnames"
                                    value={formData.Surnames}
                                    onChange={handleInputChange}
                                    placeholder={phSurnames}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Sobre mi</label>
                            <textarea
                                name="Description"
                                value={formData.Description}
                                onChange={handleInputChange}
                                placeholder={phDesc}
                                rows="3"
                            />
                        </div>

                        <div className="input-row">
                            <div className="form-group half-width">
                                <label>Nova Contrasenya</label>
                                <input
                                    type="password"
                                    name="Password"
                                    value={formData.Password}
                                    onChange={handleInputChange}
                                    placeholder="Només si vols canviar-la"
                                />
                            </div>
                            <div className="form-group half-width">
                                <label>Confirmar</label>
                                <input
                                    type="password"
                                    name="ConfirmPassword"
                                    value={formData.ConfirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Repeteix contrasenya"
                                />
                            </div>
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