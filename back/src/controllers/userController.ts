// Controlador per processar les solicitutd del Registe y del Login

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as userModel from '../models/userModel';
import { UserFormData } from '../types/userTypes';

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