import {Request, Response} from 'express';
import pool from '../config/db';
import * as tripModel from '../models/tripModel';
import axios from 'axios';

// Funció per obtenir coordenades d'una ciutat utilitzant l'API de Nominatim
const getCoordinatesFromNominatim = async (cityName: string) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`;
    
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Compasity-Student-Project/1.0' }
        });

        const data = response.data;
        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            const displayName = data[0].display_name; 
            const country = displayName.split(',').pop()?.trim() || 'Desconegut';
            
            return { lat, lng, country };
        }
        return null;
    } catch (error) {
        console.error(`[Nominatim Error] Falla al buscar ${cityName}:`, error);
        return null;
    }

};

// Controlador per crear un nou viatge
export const createTrip = async (req: Request, res: Response) => {
    const { name, description, startDate, endDate, creatorId, cities } = req.body;

    if (!name || !startDate || !endDate || !creatorId || !cities || cities.length === 0) {
        return res.status(400).json({ message: 'Falten dades obligatòries.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const tripId = await tripModel.createTripHeader(connection, {
            name, description, startDate, endDate, creatorId
        });

        await tripModel.addParticipant(connection, tripId, creatorId);

        let visitOrder = 1;

        for (const cityName of cities) {
            let cityId = await tripModel.findCityByName(connection, cityName);

            if (!cityId) {
                console.log(`Buscant coordenades per: ${cityName}...`);
                
                const geoData = await getCoordinatesFromNominatim(cityName);
                
                if (!geoData) {
                    throw new Error(`No se ha pogut localiy la ciutat: ${cityName}`);
                }

                cityId = await tripModel.createCity(connection, {
                    name: cityName,
                    country: geoData.country,
                    lat: geoData.lat,
                    lng: geoData.lng
                });
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (cityId) {
                await tripModel.addCityToTrip(connection, tripId, cityId, visitOrder);
                visitOrder++;
            }
        }

        await connection.commit();
        console.log(`Viatge "${name}" creat amb èxit. ID: ${tripId}`);
        res.status(201).json({ message: 'Viatge creat amb èxit!', tripId });

    } catch (error: any) {
        await connection.rollback();
        console.error('Error creant el viatge:', error);
        res.status(500).json({ message: error.message || 'Error intern del servidor.' });
    } finally {
        connection.release();
    }
};

// Controlador per obtenir els viatges d'un usuari
export const getUserTrips = async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'Falta el ID del usuario.' });
    }

    const connection = await pool.getConnection();
    try {
        const trips = await tripModel.getTripsByUserId(connection, parseInt(userId));
        
        const formattedTrips = (trips as any[]).map(trip => ({
            ...trip,
            cities: trip.cities ? trip.cities.split(', ') : []
        }));

        res.json(formattedTrips);

    } catch (error) {
        console.error('Error obtenint viatges:', error);
        res.status(500).json({ message: 'Error al carregar els viatges.' });
    } finally {
        connection.release();
    }
};

// Controlador per eliminar un viatge
export const deleteTrip = async (req: Request, res: Response) => {
    const { tripId } = req.params;

    if (!tripId) {
        return res.status(400).json({ message: 'Falta el ID del viaje.' });
    }

    const connection = await pool.getConnection();
    try {
        await tripModel.deleteTrip(connection, parseInt(tripId));
        res.json({ message: 'Viatge eliminat correctament' });
    } catch (error) {
        console.error('Error eliminando viaje:', error);
        res.status(500).json({ message: 'Error al eliminar el viaje.' });
    } finally {
        connection.release();
    }
};