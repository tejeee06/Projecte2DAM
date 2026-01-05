/// ARXIU PROVISONAL

import React, { useState } from 'react';

const ExpensesTab = () => {
    const [expenses] = useState([
        { id: 1, title: 'Hotel Barcelona', amount: 240, payer: 'Anna', split: 'Tots' },
        { id: 2, title: 'Sopar Tapas', amount: 80, payer: 'Marc', split: 'Tots' },
    ]);

    return (
        <div className="expenses-wrapper">
            <div className="expenses-header">
                <h2>Despeses Compartides</h2>
                <button className="add-expense-btn">+ Nova Despesa</button>
            </div>

            <div className="summary-cards">
                <div className="card-sum">
                    <label>Total</label>
                    <span>320€</span>
                </div>
                <div className="card-sum">
                    <label>Per persona</label>
                    <span>80€</span>
                </div>
            </div>

            <div className="expenses-list-view">
                {expenses.map(ex => (
                    <div key={ex.id} className="expense-row">
                        <div className="ex-info">
                            <strong>{ex.title}</strong>
                            <small>Pagat per {ex.payer}</small>
                        </div>
                        <div className="ex-amount">{ex.amount}€</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpensesTab;