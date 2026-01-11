import pool from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface ExpenseData {
    tripId: number;
    payerId: number;
    amount: number;
    description: string;
    category?: string;
}

interface ShareData {
    userId: number;
    amount: number;
}

// Funcio per crear una despesa amb les seves corresponents divisions
export const createExpenseTransaction = async (expense: ExpenseData, shares: ShareData[]) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [resExpense] = await connection.execute<ResultSetHeader>(
            `INSERT INTO Trip_Expenses (FK_TripID, FK_PayerID, Amount, Description, Category) 
             VALUES (?, ?, ?, ?, ?)`,
            [expense.tripId, expense.payerId, expense.amount, expense.description, expense.category || 'General']
        );
        
        const expenseId = resExpense.insertId;

        for (const share of shares) {
            await connection.execute(
                `INSERT INTO Trip_Expense_Shares (FK_ExpenseID, FK_DebtorID, ShareAmount) 
                 VALUES (?, ?, ?)`,
                [expenseId, share.userId, share.amount]
            );
        }

        await connection.commit();
        return expenseId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Funcio per obtenrir tots els detalls de les despeses d'un viatge
export const getExpensesByTrip = async (tripId: number) => {
    const sql = `
        SELECT 
            E.PK_ExpenseID as id,
            E.Amount as amount,
            E.Description as description,
            E.Category as category,
            E.ExpenseDate as date,
            E.FK_PayerID as payerId,
            U.Name as payerName,
            U.ProfilePicture as payerAvatar
        FROM Trip_Expenses E
        JOIN Users U ON E.FK_PayerID = U.PK_UserID
        WHERE E.FK_TripID = ?
        ORDER BY E.ExpenseDate DESC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(sql, [tripId]);
    return rows;
};

// Funcio per obtenir els balanços de pagaments i deutes dels usuaris en un viatge
export const getTripBalances = async (tripId: number) => {
    const sqlPaid = `
        SELECT FK_PayerID as userId, SUM(Amount) as totalPaid
        FROM Trip_Expenses WHERE FK_TripID = ? GROUP BY FK_PayerID
    `;
    
    const sqlDebt = `
        SELECT S.FK_DebtorID as userId, SUM(S.ShareAmount) as totalShare
        FROM Trip_Expense_Shares S
        JOIN Trip_Expenses E ON S.FK_ExpenseID = E.PK_ExpenseID
        WHERE E.FK_TripID = ? GROUP BY S.FK_DebtorID
    `;

    const [paidRows] = await pool.execute<RowDataPacket[]>(sqlPaid, [tripId]);
    const [debtRows] = await pool.execute<RowDataPacket[]>(sqlDebt, [tripId]);

    return { paid: paidRows, debt: debtRows };
};

// Funcio per eliminar una despesa i les seves divisions
export const deleteExpense = async (expenseId: number) => {
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM Trip_Expenses WHERE PK_ExpenseID = ?', [expenseId]);
    return result.affectedRows > 0;
};