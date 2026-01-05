import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

interface TripData {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    creatorId: number;
}

interface CityData {
    name: string;
    country: string;
    lat: number;
    lng: number;
}

// Funcio per crear el viatge
export const createTripHeader = async (connection: any, trip: TripData): Promise<number> => {
    const sql = `
        INSERT INTO Trips (TripName, TripDescription, StartDate, EndDate, FK_CreatorID)
        VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(sql, [
        trip.name, trip.description, trip.startDate, trip.endDate, trip.creatorId
    ]);
    return (result as ResultSetHeader).insertId;
};

// Funcio que busca si la ciutat ja existeix
export const findCityByName = async (connection: any, cityName: string): Promise<number | null> => {
    const sql = `SELECT PK_CityID FROM Cities WHERE CityName = ? LIMIT 1`;
    const [rows] = await connection.execute(sql, [cityName]);
    const result = rows as RowDataPacket[];
    return result.length > 0 ? result[0].PK_CityID : null;
};

// Funcio per crear la ciutat si no existeix
export const createCity = async (connection: any, city: CityData): Promise<number> => {
    const sql = `
        INSERT INTO Cities (CityName, Country, Latitude, Longitude)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await connection.execute(sql, [
        city.name, city.country, city.lat, city.lng
    ]);
    return (result as ResultSetHeader).insertId;
};

// Funcio per vincular la ciutat al viatge
export const addCityToTrip = async (connection: any, tripId: number, cityId: number, order: number) => {
    const sql = `
        INSERT INTO Trip_Destinations (FK_TripID, FK_CityID, VisitOrder)
        VALUES (?, ?, ?)
    `;
    await connection.execute(sql, [tripId, cityId, order]);
};

// Funcio per afegir participants al viatge
export const addParticipant = async (connection: any, tripId: number, userId: number) => {
    const sql = `INSERT INTO Trip_Participants (FK_TripID, FK_UserID) VALUES (?, ?)`;
    await connection.execute(sql, [tripId, userId]);
};

// Funcio per obtenir els viatges d'un usuari
export const getTripsByUserId = async (connection: any, userId: number) => {
    const sql = `
        SELECT 
            T.PK_TripID as id,
            T.TripName as name,
            T.TripDescription as description,
            DATE_FORMAT(T.StartDate, '%Y-%m-%d') as startDate,
            DATE_FORMAT(T.EndDate, '%Y-%m-%d') as endDate,
            GROUP_CONCAT(C.CityName ORDER BY TD.VisitOrder ASC SEPARATOR ', ') as cities
        FROM Trips T
        INNER JOIN Trip_Participants TP ON T.PK_TripID = TP.FK_TripID
        LEFT JOIN Trip_Destinations TD ON T.PK_TripID = TD.FK_TripID
        LEFT JOIN Cities C ON TD.FK_CityID = C.PK_CityID
        WHERE TP.FK_UserID = ?
        GROUP BY T.PK_TripID
        ORDER BY T.StartDate DESC
    `;
    
    const [rows] = await connection.execute(sql, [userId]);
    return rows;
};

// Funcio per eliminar un viatge
export const deleteTrip = async (connection: any, tripId: number) => {
    const sql = `DELETE FROM Trips WHERE PK_TripID = ?`;
    const [result] = await connection.execute(sql, [tripId]);
    return result;
};

// Funcio per obtenir els detalls d'un viatge
export const getTripById = async (connection: any, tripId: number) => {
    const sql = `
        SELECT 
            PK_TripID as id,
            TripName as name,
            TripDescription as description,
            DATE_FORMAT(StartDate, '%Y-%m-%d') as startDate,
            DATE_FORMAT(EndDate, '%Y-%m-%d') as endDate,
            FK_CreatorID as creatorId
        FROM Trips 
        WHERE PK_TripID = ?
    `;
    const [rows] = await connection.execute(sql, [tripId]);
    return (rows as RowDataPacket[])[0];
};

// Funcio per obtenir les ciutats d'un viatge
export const getCitiesByTripId = async (connection: any, tripId: number) => {
    const sql = `
        SELECT 
            C.PK_CityID as id,
            C.CityName as name,
            C.Country as country,
            C.Latitude as lat,
            C.Longitude as lng,
            TD.VisitOrder as 'order'
        FROM Cities C
        INNER JOIN Trip_Destinations TD ON C.PK_CityID = TD.FK_CityID
        WHERE TD.FK_TripID = ?
        ORDER BY TD.VisitOrder ASC
    `;
    const [rows] = await connection.execute(sql, [tripId]);
    return rows as RowDataPacket[];
};

// Funcio per obtenir els participants d'un viatge
export const getTripParticipants = async (connection: any, tripId: number) => {
    const sql = `
        SELECT U.PK_UserID as id, U.Name as name, U.ProfilePicture as avatar
        FROM Users U
        INNER JOIN Trip_Participants TP ON U.PK_UserID = TP.FK_UserID
        WHERE TP.FK_TripID = ?
    `;
    const [rows] = await connection.execute(sql, [tripId]);
    return rows as RowDataPacket[];
}