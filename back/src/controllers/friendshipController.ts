import { Request, Response } from 'express';
import * as friendshipModel from '../models/friendshipModel';

// Funcio per enviar una solicitud d'amistad
export const sendRequest = async (req: Request, res: Response) => {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
        return res.status(400).json({ message: 'Falten IDs d\'usuari.' });
    }

    if (senderId === receiverId) {
        return res.status(400).json({ message: 'No pots enviar-te sol·licitud a tu mateix.' });
    }

    try {
        const resultId = await friendshipModel.createFriendship(senderId, receiverId);
        res.status(201).json({ message: 'Sol·licitud enviada.', friendshipId: resultId });
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ message: error.message || 'Error al enviar sol·licitud.' });
    }
};

// Funcio per acceptar una solicitud d'amistad
export const acceptRequest = async (req: Request, res: Response) => {
    const { friendshipId } = req.body;

    try {
        const success = await friendshipModel.updateFriendshipStatus(friendshipId, 'Accepted');
        if (success) {
            res.json({ message: 'Sol·licitud acceptada! Ara sou amics.' });
        } else {
            res.status(404).json({ message: 'No s\'ha trobat la sol·licitud.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// Funcio per rebutjar una solicitud d'amistad
export const removeFriendship = async (req: Request, res: Response) => {
    // Leemos el ID (mantén esta forma segura que hicimos)
    const idRaw = req.params.friendshipId || req.params.id; 
    const id = parseInt(idRaw);

    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invàlid.' });
    }

    try {
        const success = await friendshipModel.deleteFriendship(id);
        
        if (success) {
            res.json({ message: 'Eliminat correctament.' });
        } else {
            res.status(404).json({ message: 'No s\'ha trobat la relació.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor.' });
    }
};

// Funcio per obtenir les sol·licituds pendents (notificacions)
export const getNotifications = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const requests = await friendshipModel.getPendingRequests(parseInt(userId));
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error carregant notificacions.' });
    }
};

// Funcio per obtenir la llista d'amics
export const getMyFriends = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const friends = await friendshipModel.getFriendsList(parseInt(userId));
        res.json(friends);
    } catch (error) {
        res.status(500).json({ message: 'Error carregant amics.' });
    }
};

// Funcio per comprovar l'estat d'una amistat entre dos usuaris
export const getStatus = async (req: Request, res: Response) => {
    const { myId, otherId } = req.params;
    try {
        const friendship = await friendshipModel.checkFriendshipStatus(parseInt(myId), parseInt(otherId));
        res.json({ status: friendship ? friendship.Status : 'None', data: friendship });
    } catch (error) {
        res.status(500).json({ message: 'Error.' });
    }
};