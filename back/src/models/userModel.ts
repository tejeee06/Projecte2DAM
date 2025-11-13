import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { User } from '../types/userTypes';

// --- Interfaz local para la BD ---
interface UserDataForDb {
  name: string;
  surnames: string;
  userName: string;
  password: string; // Hasheada
  email: string;
  description: string | null;
}

// --- FUNCIÓN CREAR USUARIO ---
export const createUser = async (userData: UserDataForDb): Promise<number> => {
  const { name, surnames, userName, password, email, description } = userData;

  const sql = `
    INSERT INTO Users (Name, Surnames, UserName, Password, Email, Description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.execute<ResultSetHeader>(sql, [
      name,
      surnames,
      userName,
      password,
      email,
      description
    ]);
    return result.insertId;
  } catch (error) {
    console.error('[userModel] Error al crear usuario en la BD:', error);
    throw error;
  }
};


// --- FUNCIÓN BUSCAR USUARIO (para Login) ---
export const findUserByUsernameOrEmail = async (usernameOrEmail: string): Promise<User | null> => {
  const sql = `
    SELECT * FROM Users
    WHERE UserName = ? OR Email = ?
  `;

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [
      usernameOrEmail, 
      usernameOrEmail
    ]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as User;

  } catch (error) {
    console.error('[userModel] Error al buscar l usuari', error);
    throw error;
  }
};