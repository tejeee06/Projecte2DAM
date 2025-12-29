import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as userModel from '../models/userModel';
import { UserFormData } from '../types/userTypes';
import pool from '../config/db';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, surnames, userName, email, password, description } = req.body as UserFormData;

    if (!name || !surnames || !userName || !email || !password) {
      return res.status(400).json({ message: 'Tots els camps han de ser obligatoris.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      surnames,
      userName,
      password: hashedPassword,
      email,
      description: description || null
    };

    const newUserId = await userModel.createUser(userData);

    res.status(201).json({ 
      message: 'Usuari registrat amb éxit!', 
      userId: newUserId 
    });

  } catch (error: any) {
    console.error('[userController] Error al registrar l usuari:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El nom d usuari o el correu electrónic ya existeixes.' });
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'L usuari i la contrasenya son necessaris.' });
    }

    const user = await userModel.findUserByUsernameOrEmail(username);

    if (!user) {
      return res.status(401).json({ message: 'Credencials incorrectes.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.Password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Credencials incorrectes.' });
    }

    const { Password, ...userData } = user;

    res.status(200).json({
      message: 'Inici de sessio correcte',
      user: userData
    });

  } catch (error: any) {
    console.error('[userController] Error al iniciar sesió:', error);
    res.status(500).json({ message: 'Internal server Error.' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
    const userId = req.params.id; 
    const { Name, Surnames, Description } = req.body;
    let profilePictureUrl = null;

    console.log(`[Update] Intentando actualizar usuario ID: ${userId}`);

    try {
        if (req.file) {
            const port = process.env.PORT || 3000;
            const host = req.get('host') || `localhost:${port}`;
            profilePictureUrl = `http://${host}/uploads/profiles/${req.file.filename}`;
        }

        let query = '';
        let values = [];

        if (profilePictureUrl) {
            query = `
                UPDATE Users 
                SET Name = ?, Surnames = ?, Description = ?, ProfilePicture = ? 
                WHERE PK_UserID = ? 
            `;
            values = [Name, Surnames, Description, profilePictureUrl, userId];
        } 
        else {
            query = `
                UPDATE Users 
                SET Name = ?, Surnames = ?, Description = ? 
                WHERE PK_UserID = ?
            `;
            values = [Name, Surnames, Description, userId];
        }

        const [result]: any = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuari no trobat o no s\'han fet canvis.' });
        }

        res.json({ 
            message: 'Perfil actualitzat correctament',
            user: {
                PK_UserID: parseInt(userId),
                Name,
                Surnames,
                Description,
                ProfilePicture: profilePictureUrl 
            }
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar datos.' });
    }
};