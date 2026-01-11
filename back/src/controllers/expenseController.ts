import { Request, Response } from "express";
import * as expenseModel from "../models/expenseModel";

// Controlador per afegir una nova despesa
export const addExpense = async (req: Request, res: Response) => {
    const { tripId, payerId, amount, description, category, involvedUserIds } = req.body;

    if (!tripId || !payerId || !amount || !description || !involvedUserIds || involvedUserIds.length === 0) {
        return res.status(400).json({ message: 'Falten dades del la despessa.' });
    }

    try {
        const splitAmount = parseFloat((amount / involvedUserIds.length).toFixed(2));
        
        const shares = involvedUserIds.map((userId: number) => ({
            userId,
            amount: splitAmount
        }));

        const newExpenseId = await expenseModel.createExpenseTransaction(
            { tripId, payerId, amount, description, category },
            shares
        );

        res.status(201).json({ message: 'Despesa afegida!', expenseId: newExpenseId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar la despesa.' });
    }
};

// Controlador per obtenir totes les despeses d'un viatge
export const getTripExpenses = async (req: Request, res: Response) => {
    const { tripId } = req.params;
    try {
        const expenses = await expenseModel.getExpensesByTrip(parseInt(tripId));
        const rawBalances = await expenseModel.getTripBalances(parseInt(tripId));

        res.json({ expenses, rawBalances });
    } catch (error) {
        res.status(500).json({ message: 'Error obtenint despeses.' });
    }
};

// Controlador per eliminar una despesa
export const deleteExpense = async (req: Request, res: Response) => {
    const { expenseId } = req.params;
    try {
        await expenseModel.deleteExpense(parseInt(expenseId));
        res.json({ message: 'Despesa eliminada.' });
    } catch (error) {
        res.status(500).json({ message: 'Error eliminant.' });
    }
};