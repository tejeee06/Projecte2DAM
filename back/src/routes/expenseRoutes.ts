import { Router } from "express";
import * as expenseController from "../controllers/expenseController";

const router = Router();

router.post('/add', expenseController.addExpense);
router.get('/trip/:tripId', expenseController.getTripExpenses);
router.delete('/:expenseId', expenseController.deleteExpense);

export default router;