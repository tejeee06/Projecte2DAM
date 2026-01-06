import React, { useEffect, useState } from 'react';
import { getPendingRequests, acceptFriendRequest, deleteFriendship } from '../../services/friendService';
import './FriendRequestModal.css';

const FriendRequestsModal = ({ userId, onClose, onUpdate }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, [userId]);

    const loadRequests = async () => {
        if (!userId) return;
        const data = await getPendingRequests(userId);
        setRequests(data);
        setLoading(false);
    };

    const handleAccept = async (friendshipId) => {
        await acceptFriendRequest(friendshipId);
        loadRequests();
        onUpdate();
    };

    const handleReject = async (friendshipId) => {
        await deleteFriendship(friendshipId);
        loadRequests();
        onUpdate();
    };

    if (!userId) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content fade-in">
                <div className="modal-header">
                    <h3>Sol·licituds d'Amistat</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                
                <div className="modal-body">
                    {loading ? (
                        <p>Carregant...</p>
                    ) : requests.length === 0 ? (
                        <div className="empty-state">
                            <p>No tens sol·licituds pendents</p>
                        </div>
                    ) : (
                        <ul className="requests-list">
                            {requests.map((req) => (
                                <li key={req.PK_FriendshipID} className="request-item">
                                    <div className="req-info">
                                        <img 
                                            src={req.ProfilePicture || 'https://via.placeholder.com/40'} 
                                            alt={req.UserName} 
                                            className="req-avatar"
                                        />
                                        <div>
                                            <span className="req-name">{req.UserName}</span>
                                            <span className="req-fullname">{req.Name} {req.Surnames}</span>
                                        </div>
                                    </div>
                                    <div className="req-actions">
                                        <button onClick={() => handleAccept(req.PK_FriendshipID)} className="btn-accept">Acceptar</button>
                                        <button onClick={() => handleReject(req.PK_FriendshipID)} className="btn-reject">Rebutjar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendRequestsModal;