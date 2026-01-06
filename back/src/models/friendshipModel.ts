import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Funcio per enviar una solicitud d'amistad
export const createFriendship = async (senderId: number, receiverId: number) => {
    const checkSql = `
        SELECT * FROM Friendships 
        WHERE (FK_UserID_Sender = ? AND FK_UserID_Receiver = ?) 
           OR (FK_UserID_Sender = ? AND FK_UserID_Receiver = ?)
    `;
    const [existing] = await pool.execute<RowDataPacket[]>(checkSql, [senderId, receiverId, receiverId, senderId]);

    if (existing.length > 0) {
        throw new Error('Ja existeix una sol·licitud o amistat entre aquests usuaris.');
    }

    const sql = `INSERT INTO Friendships (FK_UserID_Sender, FK_UserID_Receiver, Status) VALUES (?, ?, 'Pending')`;
    const [result] = await pool.execute<ResultSetHeader>(sql, [senderId, receiverId]);
    return result.insertId;
};

// Funcio per acceptar o rebutjar una solicitud d'amistad
export const updateFriendshipStatus = async (friendshipId: number, newStatus: 'Accepted' | 'Rejected') => {
    const sql = `UPDATE Friendships SET Status = ? WHERE PK_FriendshipID = ?`;
    const [result] = await pool.execute<ResultSetHeader>(sql, [newStatus, friendshipId]);
    return result.affectedRows > 0;
};

// Funcio per eliminar una amistat o solicitud
export const deleteFriendship = async (friendshipId: number) => {
    const sql = `DELETE FROM Friendships WHERE PK_FriendshipID = ?`;
    const [result] = await pool.execute<ResultSetHeader>(sql, [friendshipId]);
    return result.affectedRows > 0;
};

// Funcio per obtenir les sol·licituds pendents rebudes
export const getPendingRequests = async (userId: number) => {
    const sql = `
        SELECT 
            F.PK_FriendshipID, 
            F.CreatedAt, 
            U.PK_UserID, 
            U.UserName, 
            U.Name, 
            U.Surnames, 
            U.ProfilePicture 
        FROM Friendships F
        INNER JOIN Users U ON F.FK_UserID_Sender = U.PK_UserID
        WHERE F.FK_UserID_Receiver = ? AND F.Status = 'Pending'
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId]);
    return rows;
};

// Funcio per obtenir la llista d'amics d'un usuari
export const getFriendsList = async (userId: number) => {
    const sql = `
        SELECT U.PK_UserID, U.UserName, U.Name, U.Surnames, U.ProfilePicture, F.PK_FriendshipID
        FROM Users U
        JOIN Friendships F ON U.PK_UserID = F.FK_UserID_Receiver
        WHERE F.FK_UserID_Sender = ? AND F.Status = 'Accepted'
        
        UNION
        
        SELECT U.PK_UserID, U.UserName, U.Name, U.Surnames, U.ProfilePicture, F.PK_FriendshipID
        FROM Users U
        JOIN Friendships F ON U.PK_UserID = F.FK_UserID_Sender
        WHERE F.FK_UserID_Receiver = ? AND F.Status = 'Accepted'
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [userId, userId]);
    return rows;
};

// Funcio per comprovar l'estat d'una amistat entre dos usuaris
export const checkFriendshipStatus = async (myId: number, otherUserId: number) => {
    const sql = `
        SELECT * FROM Friendships 
        WHERE (FK_UserID_Sender = ? AND FK_UserID_Receiver = ?) 
           OR (FK_UserID_Sender = ? AND FK_UserID_Receiver = ?)
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [myId, otherUserId, otherUserId, myId]);
    return rows.length > 0 ? rows[0] : null;
};