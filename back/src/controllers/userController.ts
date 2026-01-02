import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as userModel from '../models/userModel';
import { UserFormData, UpdateUserBody } from '../types/userTypes';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import {deleteUserById } from '../models/userModel';

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
    const body = req.body || {};
    const inputName = body.Name || body.name;
    const inputSurnames = body.Surnames || body.surnames;
    const inputUsername = body.Username || body.username || body.userName;
    const inputDescription = body.Description !== undefined ? body.Description : body.description;
    const inputPassword = body.password || body.Password;

    try {
        const [currentRows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM Users WHERE PK_UserID = ?', 
            [userId]
        );

        if (currentRows.length === 0) {
            return res.status(404).json({ message: 'Usuari no trobat.' });
        }
        const currentUser = currentRows[0];

        if (inputUsername && inputUsername.trim() !== '' && inputUsername !== currentUser.UserName) {
            const [existingUser] = await pool.query<RowDataPacket[]>(
                'SELECT PK_UserID FROM Users WHERE UserName = ? AND PK_UserID != ?',
                [inputUsername, userId]
            );

            if (existingUser.length > 0) {
                return res.status(409).json({ message: 'Aquest nom d\'usuari ja està en ús.' });
            }
        }

        let finalPassword = currentUser.Password;
        if (inputPassword && inputPassword.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            finalPassword = await bcrypt.hash(inputPassword, salt);
        }


        let finalProfilePicture = currentUser.ProfilePicture;
        if (req.file) {
            const port = process.env.PORT || 3001; 
            const host = req.get('host') || `localhost:${port}`;
            finalProfilePicture = `http://${host}/uploads/profiles/${req.file.filename}`;
        }

        const finalName = (inputName && inputName.trim() !== '') ? inputName : currentUser.Name;
        const finalSurnames = (inputSurnames && inputSurnames.trim() !== '') ? inputSurnames : currentUser.Surnames;
        const finalUsername = (inputUsername && inputUsername.trim() !== '') ? inputUsername : currentUser.UserName;
        const finalDescription = (inputDescription !== undefined) ? inputDescription : currentUser.Description;

        const query = `
            UPDATE Users 
            SET Name = ?, 
                Surnames = ?, 
                UserName = ?, 
                Description = ?, 
                Password = ?, 
                ProfilePicture = ?
            WHERE PK_UserID = ?
        `;

        const values = [
            finalName,
            finalSurnames,
            finalUsername,
            finalDescription,
            finalPassword,
            finalProfilePicture,
            userId
        ];

        await pool.query(query, values);

        res.json({ 
            message: 'Perfil actualitzat correctament',
            user: {
                PK_UserID: parseInt(userId),
                Username: finalUsername,
                Name: finalName,
                Surnames: finalSurnames,
                Description: finalDescription,
                ProfilePicture: finalProfilePicture,
                Email: currentUser.Email
            }
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ message: 'Error del servidor al actualizar les dades.' });
    }
};

export const deleteUserAccount = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
        return res.status(400).json({ message: 'ID de usuari invalid.' });
    }

    try {
        const deleted = await deleteUserById(userId);

        if (deleted) {
            res.status(200).json({ message: 'Usuari eliminat correctament.' });
        } else {
            res.status(404).json({ message: 'No s\'ha trobat l\'usuari per eliminar.' });
        }
    } catch (error) {
        console.error('Error al eliminar el compte:', error);
        res.status(500).json({ message: 'Error del servidor al eliminar l\'usuari.' });
    }
};