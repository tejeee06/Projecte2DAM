import React, { useState, useEffect } from 'react';
import {getMyFriends, searchUsers, sendFriendRequest, deleteFriendship} from '../../services/friendService';
import Swal from 'sweetalert2';
import './Friendstab.css';

const API_URL = 'http://localhost:3001';

const FriendsTab = ({ currentUserId }) => {
    const [activeView, setActiveView] = useState('list');
    const [friends, setFriends] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUserId && activeView === 'list') {
            loadFriends();
        }
    }, [currentUserId, activeView]);

    const loadFriends = async () => {
        setLoading(true);
        const data = await getMyFriends(currentUserId);
        setFriends(data);
        setLoading(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        const results = await searchUsers(searchQuery, currentUserId);
        const filtered = results.filter(u => u.PK_UserID !== currentUserId);
        setSearchResults(filtered);
        setLoading(false);
    };

    const handleSendRequest = async (receiverId) => {
        try {
            await sendFriendRequest(currentUserId, receiverId);
            
            Swal.fire({
                icon: 'success',
                title: 'Sol·licitud enviada!',
                text: 'Esperant confirmació...',
                timer: 2000,
                showConfirmButton: false
            });

            setSearchResults(prev => prev.filter(u => u.PK_UserID !== receiverId));
        } catch (error) {
            Swal.fire('Error', 'No s\'ha pogut enviar la sol·licitud', 'error');
        }
    };

    const handleDelete = async (friendshipId) => {
        console.log("Intentant eliminar ID:", friendshipId);
        const result = await Swal.fire({
            title: 'Atenció!',
            text: "Vols eliminar aquest amic? Aquesta acció és irreversible.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancel·lar'
        });

        if (result.isConfirmed) {
            try {
                await deleteFriendship(friendshipId);
                
                setFriends(prev => prev.filter(f => f.PK_FriendshipID !== friendshipId));
                
                Swal.fire(
                    'Eliminat!',
                    'L\'amic ha estat eliminat correctament.',
                    'success'
                );
            } catch (error) {
                console.error("Error detallat:", error);
                Swal.fire('Error', error.message || 'Error desconegut', 'error');
            }
        }
    };

    const renderAvatar = (user) => {
        if (user.ProfilePicture) {
            let imgPath = user.ProfilePicture.replace(/\\/g, "/");
            const src = imgPath.startsWith('http') ? imgPath : `${API_URL}/${imgPath}`;
            return <img src={src} alt={user.UserName} className="card-avatar-img" />;
        }
        const initial = user.Name ? user.Name.charAt(0).toUpperCase() : '?';
        return <div className="card-avatar-placeholder">{initial}</div>;
    };

    const UserCard = ({ user, isFriend }) => (
        <div className="friend-card fade-in-up">
            <div className="card-header-bg"></div>
            <div className="card-avatar-container">
                {renderAvatar(user)}
            </div>
            
            <div className="card-info">
                <h4 className="card-name">{user.Name} {user.Surnames}</h4>
                <p className="card-username">@{user.UserName}</p>
            </div>

            <div className="card-actions">
                {isFriend ? (
                    <button 
                        className="card-btn btn-delete" 
                        onClick={() => handleDelete(user.PK_FriendshipID)}
                    >
                        Treure
                    </button>
                ) : (
                    <button 
                        className="card-btn btn-add" 
                        onClick={() => handleSendRequest(user.PK_UserID)}
                    >
                        + Afegir
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="friends-tab-wrapper">
            <div className="friends-nav">
                <button 
                    className={`nav-pill ${activeView === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveView('list')}
                >
                    Els Meus Amics
                </button>
                <button 
                    className={`nav-pill ${activeView === 'search' ? 'active' : ''}`}
                    onClick={() => { setActiveView('search'); setSearchResults([]); setSearchQuery(''); }}
                >
                    Cercar Usuaris
                </button>
            </div>

            <div className="friends-content">
                {activeView === 'search' && (
                    <form onSubmit={handleSearch} className="search-bar-container fade-in">
                        <input 
                            type="text" 
                            placeholder="Buscar per nom d'usuari..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                    </form>
                )}

                {loading ? (
                    <div className="loading-spinner">Carregant...</div>
                ) : (
                    <div className="cards-grid">
                        {activeView === 'list' ? (
                            friends.length > 0 ? (
                                friends.map(friend => (
                                    <UserCard key={friend.PK_FriendshipID} user={friend} isFriend={true} />
                                ))
                            ) : (
                                <div className="empty-state"><p>Encara no tens amics afegits.</p></div>
                            )
                        ) : (
                            searchResults.length > 0 ? (
                                searchResults.map(user => (
                                    <UserCard key={user.PK_UserID} user={user} isFriend={false} />
                                ))
                            ) : (
                                searchQuery && <div className="empty-state"><p>No s'han trobat usuaris.</p></div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendsTab;