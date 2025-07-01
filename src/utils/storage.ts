import { Event, Expense } from '../types';

const EVENTS_KEY = 'savings_simulator:events';
const EXPENSES_KEY = 'savings_simulator:expenses';

// Gestion des événements
export const saveEvents = (events: Event[]): void => {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des événements:', error);
  }
};

export const loadEvents = (): Event[] => {
  try {
    const eventsJson = localStorage.getItem(EVENTS_KEY);
    return eventsJson ? JSON.parse(eventsJson) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des événements:', error);
    return [];
  }
};

export const addEvent = (event: Event): void => {
  try {
    const events = loadEvents();
    events.push(event);
    saveEvents(events);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'événement:', error);
  }
};

export const deleteEvent = (eventId: string): void => {
  try {
    const events = loadEvents();
    const filteredEvents = events.filter(event => event.id !== eventId);
    saveEvents(filteredEvents);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
  }
};

// Gestion des dépenses
export const saveExpenses = (expenses: Expense[]): void => {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des dépenses:', error);
  }
};

export const loadExpenses = (): Expense[] => {
  try {
    const expensesJson = localStorage.getItem(EXPENSES_KEY);
    return expensesJson ? JSON.parse(expensesJson) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des dépenses:', error);
    return [];
  }
};

export const addExpense = (expense: Expense): void => {
  try {
    const expenses = loadExpenses();
    expenses.push(expense);
    saveExpenses(expenses);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la dépense:', error);
  }
};

export const deleteExpense = (expenseId: string): void => {
  try {
    const expenses = loadExpenses();
    const filteredExpenses = expenses.filter(expense => expense.id !== expenseId);
    saveExpenses(filteredExpenses);
  } catch (error) {
    console.error('Erreur lors de la suppression de la dépense:', error);
  }
}; 