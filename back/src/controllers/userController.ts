import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import * as userModel from '../models/userModel';
import { UserFormData } from '../types/userTypes';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, surnames, userName, email, password, description } = req.body as UserFormData;

    if (!name || !surnames || !userName || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben estar completos.' });
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
      message: '¡Usuario registrado con éxito!', 
      userId: newUserId 
    });

  } catch (error: any) {
    console.error('[userController] Error al registrar l usuari:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'El nom del usuari o el correu electronic ya existeixen.' });
    }

    res.status(500).json({ message: 'Internal server error.' });
  }
};