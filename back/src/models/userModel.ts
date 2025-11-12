import pool from '../config/db';
import { ResultSetHeader } from 'mysql2';

interface UserDataForDb {
  name: string;
  surnames: string;
  userName: string;
  password: string;
  email: string;
  description: string | null;
}

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
    console.error('[userModel] Error al crear l usuari a la BD:', error);
    throw error;
  }
};