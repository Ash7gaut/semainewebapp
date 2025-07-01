import React, { useState, useEffect } from "react";
import { Event, Expense } from "../types";
import { loadEvents } from "../utils/storage";
import { loadExpenses, addExpense, deleteExpense } from "../utils/storage";
import { calculateSavings, formatCurrency } from "../utils/calculations";
import "./ExpensesScreen.css";

const ExpensesScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseFrequency, setNewExpenseFrequency] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedEvents = loadEvents();
    const loadedExpenses = loadExpenses();
    setEvents(loadedEvents);
    setExpenses(loadedExpenses);
  };

  const handleAddExpense = () => {
    if (
      !newExpenseAmount ||
      isNaN(Number(newExpenseAmount)) ||
      Number(newExpenseAmount) <= 0
    ) {
      alert("Veuillez entrer un montant valide");
      return;
    }

    if (newExpenseDescription.trim() === "") {
      alert("Veuillez entrer une description");
      return;
    }

    if (!selectedEventId) {
      alert("Veuillez sélectionner un événement");
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: Number(newExpenseAmount),
      frequency: newExpenseFrequency,
      description: newExpenseDescription.trim(),
      eventId: selectedEventId,
      createdAt: new Date().toISOString(),
    };

    addExpense(newExpense);
    setExpenses([...expenses, newExpense]);
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setNewExpenseAmount("");
    setNewExpenseDescription("");
    setNewExpenseFrequency("daily");
    setSelectedEventId("");
  };

  const handleDeleteExpense = (
    expenseId: string,
    expenseDescription: string
  ) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer "${expenseDescription}" ?`
      )
    ) {
      deleteExpense(expenseId);
      setExpenses(expenses.filter((expense) => expense.id !== expenseId));
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "/jour";
      case "weekly":
        return "/semaine";
      case "monthly":
        return "/mois";
      default:
        return "";
    }
  };

  const renderExpenseItem = (item: Expense) => {
    const event = events.find((e) => e.id === item.eventId);
    if (!event) return null;

    const savings = calculateSavings(item, event);
    const isExpired = savings.daysRemaining <= 0;

    return (
      <div
        key={item.id}
        className={`expense-item ${isExpired ? "expired" : ""}`}
      >
        <div className="expense-content">
          <h3 className="expense-description">{item.description}</h3>
          <p className="expense-amount">
            {formatCurrency(item.amount)}
            {getFrequencyLabel(item.frequency)}
          </p>
          <p className="event-name">Pour: {event.name}</p>

          {!isExpired ? (
            <div className="savings-info">
              <p className="savings-title">Économies potentielles:</p>
              <p className="total-savings">
                {formatCurrency(savings.totalSavings)} au total
              </p>
              <p className="days-remaining">
                en {savings.daysRemaining} jour(s)
              </p>
            </div>
          ) : (
            <p className="expired-text">Événement passé</p>
          )}
        </div>
        <button
          className="delete-button"
          onClick={() => handleDeleteExpense(item.id, item.description)}
        >
          ✕
        </button>
      </div>
    );
  };

  const futureEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate > new Date();
  });

  const FrequencyButton = ({
    frequency,
    label,
  }: {
    frequency: "daily" | "weekly" | "monthly";
    label: string;
  }) => (
    <button
      className={`frequency-button ${
        newExpenseFrequency === frequency ? "selected" : ""
      }`}
      onClick={() => setNewExpenseFrequency(frequency)}
    >
      {label}
    </button>
  );

  const EventButton = ({ event }: { event: Event }) => (
    <button
      className={`event-button ${
        selectedEventId === event.id ? "selected" : ""
      }`}
      onClick={() => setSelectedEventId(event.id)}
    >
      {event.name}
    </button>
  );

  return (
    <div className="expenses-screen">
      <div className="header">
        <h1 className="title">Dépenses Simulées</h1>
        <button
          className={`add-button ${
            futureEvents.length === 0 ? "disabled" : ""
          }`}
          onClick={() => futureEvents.length > 0 && setModalVisible(true)}
          disabled={futureEvents.length === 0}
        >
          + Ajouter
        </button>
      </div>

      {futureEvents.length === 0 && (
        <div className="no-events-container">
          <p className="no-events-text">
            Vous devez d'abord ajouter des événements futurs dans l'onglet
            "Événements"
          </p>
        </div>
      )}

      <div className="expenses-list">
        {expenses.length === 0 ? (
          futureEvents.length > 0 ? (
            <div className="empty-state">
              <p className="empty-text">
                Aucune dépense simulée.
                <br />
                Ajoutez une dépense régulière pour voir vos économies
                potentielles !
              </p>
            </div>
          ) : null
        ) : (
          expenses.map(renderExpenseItem).filter(Boolean)
        )}
      </div>

      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-scroll">
              <h2 className="modal-title">Nouvelle Dépense</h2>

              <div className="form-group">
                <label className="label">Description</label>
                <input
                  type="text"
                  className="input"
                  placeholder="ex: Café quotidien"
                  value={newExpenseDescription}
                  onChange={(e) => setNewExpenseDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">Montant (€)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="ex: 5"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">Fréquence</label>
                <div className="frequency-container">
                  <FrequencyButton frequency="daily" label="Par jour" />
                  <FrequencyButton frequency="weekly" label="Par semaine" />
                  <FrequencyButton frequency="monthly" label="Par mois" />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Événement cible</label>
                <div className="events-container">
                  {futureEvents.map((event) => (
                    <EventButton key={event.id} event={event} />
                  ))}
                </div>
              </div>

              <div className="modal-buttons">
                <button
                  className="modal-button cancel-button"
                  onClick={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  Annuler
                </button>
                <button
                  className="modal-button save-button"
                  onClick={handleAddExpense}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesScreen;
