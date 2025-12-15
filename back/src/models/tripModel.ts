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