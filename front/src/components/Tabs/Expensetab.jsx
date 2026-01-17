import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from 'sweetalert2';
import './Expensetab.css';

const ExpensesTab = () => {
    const { tripId } = useParams();
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(''); 
    const [payerId, setPayerId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [category, setCategory] = useState('General'); 
    const [showAddModal, setShowAddModal] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.PK_UserID;

    useEffect(() => {
        if (tripId) fetchData();
    }, [tripId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const partRes = await fetch(`http://localhost:3001/api/trips/details/${tripId}`);
            if (!partRes.ok) throw new Error('Error carregant participants');
            const partData = await partRes.json();
            
            setParticipants(partData.participants || []);
            
            if (partData.participants?.length > 0 && !payerId) {
                const me = partData.participants.find(p => p.id === currentUserId);
                setPayerId(me ? me.id : partData.participants[0].id);
            }

            const expRes = await fetch(`http://localhost:3001/api/expenses/trip/${tripId}`);
            if (!expRes.ok) throw new Error('Error carregant despeses');
            const expData = await expRes.json();
            
            setExpenses(expData.expenses);
            calculateDebts(expData.rawBalances, partData.participants);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateDebts = (rawBalances, people) => {
        if (!rawBalances || !people) return;

        let balanceMap = {}; 
        people.forEach(p => balanceMap[p.id] = 0);

        rawBalances.paid.forEach(p => {
            if(balanceMap[p.userId] !== undefined) balanceMap[p.userId] += parseFloat(p.totalPaid);
        });

        rawBalances.debt.forEach(d => {
            if(balanceMap[d.userId] !== undefined) balanceMap[d.userId] -= parseFloat(d.totalShare);
        });

        let debtors = [];
        let creditors = [];

        for (const [id, amount] of Object.entries(balanceMap)) {
            const val = parseFloat(amount);
            if (val < -0.01) debtors.push({ id: parseInt(id), amount: val });
            if (val > 0.01) creditors.push({ id: parseInt(id), amount: val });
        }

        debtors.sort((a, b) => a.amount - b.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        let transactions = [];
        let i = 0; 
        let j = 0; 

        while (i < debtors.length && j < creditors.length) {
            let debtor = debtors[i];
            let creditor = creditors[j];
            let amountToPay = Math.min(Math.abs(debtor.amount), creditor.amount);
            
            const debtorData = people.find(p => p.id === debtor.id);
            const creditorData = people.find(p => p.id === creditor.id);

            transactions.push({
                from: debtorData?.name || 'Desconegut',
                fromAvatar: debtorData?.avatar || null,
                to: creditorData?.name || 'Desconegut',
                toAvatar: creditorData?.avatar || null,
                amount: amountToPay.toFixed(2)
            });

            debtor.amount += amountToPay;
            creditor.amount -= amountToPay;

            if (Math.abs(debtor.amount) < 0.01) i++;
            if (creditor.amount < 0.01) j++;
        }
        setBalances(transactions);
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!amount || !description || !payerId) return;
        
        setIsSubmitting(true);
        const body = {
            tripId: parseInt(tripId),
            payerId: parseInt(payerId),
            amount: parseFloat(amount),
            description,
            category, 
            involvedUserIds: participants.map(p => p.id) 
        };

        try {
            const res = await fetch('http://localhost:3001/api/expenses/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Afegit!',
                    text: 'Despesa guardada correctament',
                    timer: 1500,
                    showConfirmButton: false
                });
                setDescription('');
                setAmount(''); 
                setCategory('General'); 
                setShowAddModal(false);
                fetchData(); 
            } else {
                Swal.fire('Error', 'No s\'ha pogut guardar', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error de connexió', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Estàs segur?',
            text: "No podràs recuperar aquesta despesa",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, esborrar',
            cancelButtonText: 'Cancel·lar'
        });

        if (result.isConfirmed) {
            try {
                await fetch(`http://localhost:3001/api/expenses/${id}`, { method: 'DELETE' });
                fetchData();
                Swal.fire('Eliminat!', 'La despesa ha estat eliminada.', 'success');
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div><p>Carregant dades...</p></div>;
    if (error) return <div className="error-msg">{error}</div>;

    return (
        <div className="expenses-tab-container fade-in">
            <div className="expenses-header-section">
                <div>
                    <h2 className="section-title">Gestió de Despeses</h2>
                    <p className="section-subtitle">Afegeix pagaments i consulta qui deu a qui</p>
                </div>
                <button className="btn-add-expense-header" onClick={() => setShowAddModal(true)}>
                    <span className="plus-icon">+</span> Afegir
                </button>
            </div>

            <div className="expenses-dashboard-layout">
            
                <div className="left-panel">
                    <div className="modern-card balance-card">
                        <div className="card-header-simple">
                            <h3>⚖️ Ajustar Comptes</h3>
                        </div>
                        <div className="balance-list-container">
                            {balances.length === 0 ? (
                                <div className="all-settled">
                                    <div className="check-circle">✓</div>
                                    <p>Està tot quadrat!</p>
                                </div>
                            ) : (
                                <ul className="transaction-list">
                                    {balances.map((t, idx) => (
                                        <li key={idx} className="transaction-item">
                                            <div className="user-side">
                                                <img src={t.fromAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt={t.from} className="mini-avatar"/>
                                                <span>{t.from}</span>
                                            </div>
                                            
                                            <div className="transaction-arrow">
                                                <span className="arrow-amount">{t.amount}€</span>
                                                <div className="arrow-graphic">➜</div>
                                            </div>

                                            <div className="user-side">
                                                <img src={t.toAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt={t.to} className="mini-avatar"/>
                                                <span>{t.to}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div className="right-panel">
                    <div className="section-divider">
                        <h3>Historial <span>({expenses.length})</span></h3>
                    </div>

                    {expenses.length === 0 ? (
                        <div className="empty-history-state">
                            <p>Encara no hi ha moviments.</p>
                        </div>
                    ) : (
                        <div className="history-grid">
                            {expenses.map(exp => (
                                <div key={exp.id} className="history-card-item">
                                    <div className="history-card-top">
                                        <span className="history-date">
                                            {new Date(exp.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </span>
                                        <button className="btn-icon-delete" onClick={() => handleDelete(exp.id)}>✕</button>
                                    </div>
                                    
                                    <div className="history-card-main">
                                        <h4 className="history-amount">{Number(exp.amount).toFixed(2)} €</h4>
                                        <p className="history-desc">{exp.description}</p>
                                    </div>

                                    <div className="history-card-footer">
                                        <small>Pagat per <strong className="highlight-payer">{exp.payerName}</strong></small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Nova Despesa</h3>
                            <button className="btn-close-modal" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleAddExpense} className="modal-form">
                            <div className="form-group-modal">
                                <label>Concepte</label>
                                <input 
                                    type="text" 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)}
                                    required
                                    placeholder="Ex: Sopar benvinguda"
                                />
                            </div>

                            <div className="form-row-modal">
                                <div className="form-group-modal">
                                    <label>Import (€)</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        value={amount} 
                                        onChange={e => setAmount(e.target.value)}
                                        required
                                        placeholder="0" 
                                    />
                                </div>
                                <div className="form-group-modal">
                                    <label>Categoria</label>
                                    <input 
                                        type="text"
                                        value={category} 
                                        onChange={e => setCategory(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group-modal">
                                <label>Pagador</label>
                                <select 
                                    value={payerId} 
                                    onChange={e => setPayerId(e.target.value)}
                                    required
                                >
                                    {participants.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="btn-modal-save" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardant...' : 'Guardar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpensesTab;