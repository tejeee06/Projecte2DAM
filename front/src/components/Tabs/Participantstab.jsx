import React, { useState } from 'react';
import Swal from 'sweetalert2';
import {getMyFriends} from '../../services/friendService';
import './Participantstab.css';

const ParticipantsTab = ({ tripId, participants = [], creatorId, currentUserId, onUpdate }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [myFriends, setMyFriends] = useState([]);
    const isCreator = Number(currentUserId) === Number(creatorId);

    const handleOpenAddModal = async () => {
        try {
            const friendsResponse = await getMyFriends(currentUserId);
            
            let friendsList = [];
            if (Array.isArray(friendsResponse)) {
                friendsList = friendsResponse;
            } else if (friendsResponse && Array.isArray(friendsResponse.data)) {
                friendsList = friendsResponse.data;
            }

            const normalizedFriends = friendsList.map(friend => ({
                id: friend.PK_UserID || friend.id,
                name: friend.Name ? `${friend.Name} ${friend.Surnames || ''}`.trim() : (friend.UserName || 'Sense Nom'),
                avatar: friend.ProfilePicture || friend.avatar,
                username: friend.UserName
            }));

            const existingIds = participants.map(p => Number(p.id));
            const available = normalizedFriends.filter(f => !existingIds.includes(Number(f.id)));
            
            setMyFriends(available);
            setShowAddModal(true);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'No s\'han pogut carregar els amics', 'error');
        }
    };

    const handleAddParticipant = async (friendId) => {
        try {
            const response = await fetch('http://localhost:3001/api/trips/participants/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tripId, userId: friendId, currentUserId })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) throw new Error('Aquest usuari ja està al viatge.');
                throw new Error(data.message || 'Error afegint participant');
            }
            
            Swal.fire({
                icon: 'success',
                title: 'Afegit!',
                timer: 1500,
                showConfirmButton: false
            });

            setShowAddModal(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const handleRemoveParticipant = async (userIdToRemove) => {
        const result = await Swal.fire({
            title: 'Estàs segur?',
            text: "Vols eliminar aquest participant del viatge?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#cbd5e1',
            confirmButtonText: 'Sí, elimina\'l',
            cancelButtonText: 'Cancel·lar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch('http://localhost:3001/api/trips/participants/remove', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tripId, userId: userIdToRemove, currentUserId })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Error eliminant participant');
                }

                if (onUpdate) onUpdate();
                Swal.fire('Eliminat!', 'El participant ha estat eliminat.', 'success');
            } catch (error) {
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    return (
        <div className="participants-tab-container">
            <div className="participants-header-section">
                <h3 className="section-title">Viatgers <span>({participants.length})</span></h3>
                {isCreator && (
                    <button className="btn-add-pill" onClick={handleOpenAddModal}>
                        + Afegir Viatger
                    </button>
                )}
            </div>

            <div className="participants-grid">
                {participants && participants.map(user => {
                    const isUserCreator = Number(user.id) === Number(creatorId);
                    const canRemove = isCreator && !isUserCreator;

                    return (
                        <div key={user.id} className="participant-card-modern">
                            <div className="card-header-bg">
                                {canRemove && (
                                    <button 
                                        className="btn-remove-absolute"
                                        onClick={() => handleRemoveParticipant(user.id)}
                                        title="Eliminar del viatge"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div className="card-avatar-container">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="card-avatar-img" />
                                ) : (
                                    <div className="card-avatar-placeholder">
                                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                )}
                                {isUserCreator && <span className="crown-badge" title="Organitzador">👑</span>}
                            </div>
                            
                            <div className="card-info">
                                <h4 className="card-name">{user.name}</h4>
                                <p className="card-role">{isUserCreator ? 'Organitzador' : 'Viatger'}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-box-modern" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Afegir Amics</h3>
                            <button className="btn-close-modal" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>
                        
                        <div className="friends-list-container">
                            {myFriends.length === 0 ? (
                                <div className="empty-state-friends">
                                    <p>No tens amics disponibles per afegir.</p>
                                    <small>(O ja estan tots al viatge)</small>
                                </div>
                            ) : (
                                myFriends.map(friend => (
                                    <div key={friend.id} className="friend-row-modern">
                                        <div className="friend-row-info">
                                            <div className="mini-avatar">
                                                {friend.avatar ? (
                                                    <img src={friend.avatar} alt="av" />
                                                ) : (
                                                    friend.name ? friend.name.charAt(0).toUpperCase() : '?'
                                                )}
                                            </div>
                                            <div className="friend-text">
                                                <span className="friend-name">{friend.name}</span>
                                                {friend.username && <span className="friend-username">@{friend.username}</span>}
                                            </div>
                                        </div>
                                        <button 
                                            className="btn-action-add"
                                            onClick={() => handleAddParticipant(friend.id)}
                                        >
                                            Afegir
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParticipantsTab;