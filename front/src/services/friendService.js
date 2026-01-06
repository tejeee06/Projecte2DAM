const API_URL = 'http://localhost:3001/api';

export const getMyFriends = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/friends/list/${userId}`);
        if (!response.ok) throw new Error('Error fetching friends');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const searchUsers = async (query, currentUserId) => {
    try {
        const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(query)}&userId=${currentUserId}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const sendFriendRequest = async (senderId, receiverId) => {
    const response = await fetch(`${API_URL}/friends/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, receiverId })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error enviant sol·licitud');
    }
    return await response.json();
};

export const getPendingRequests = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/friends/pending/${userId}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const acceptFriendRequest = async (friendshipId) => {
    const response = await fetch(`${API_URL}/friends/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId })
    });
    
    if (!response.ok) throw new Error('Error acceptant sol·licitud');
    return await response.json();
};

export const deleteFriendship = async (friendshipId) => {
    const response = await fetch(`${API_URL}/friends/delete/${friendshipId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error eliminant amic');
    }

    return await response.json();
};