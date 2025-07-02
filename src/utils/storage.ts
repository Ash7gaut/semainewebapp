import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event, Expense } from '../types';

const EVENTS_KEY = '@savings_app_events';
const EXPENSES_KEY = '@savings_app_expenses';

// Gestion des événements
export const loadEvents = async (): Promise<Event[]> => {
  try {
    const eventsData = await AsyncStorage.getItem(EVENTS_KEY);
    return eventsData ? JSON.parse(eventsData) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des événements:', error);
    return [];
  }
};

export const saveEvents = async (events: Event[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des événements:', error);
    throw error;
  }
};

export const addEvent = async (event: Event): Promise<void> => {
  try {
    const events = await loadEvents();
    const updatedEvents = [...events, event];
    await saveEvents(updatedEvents);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'événement:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    const events = await loadEvents();
    const updatedEvents = events.filter(event => event.id !== eventId);
    await saveEvents(updatedEvents);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    throw error;
  }
};

// Gestion des dépenses
export const loadExpenses = async (): Promise<Expense[]> => {
  try {
    const expensesData = await AsyncStorage.getItem(EXPENSES_KEY);
    return expensesData ? JSON.parse(expensesData) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des dépenses:', error);
    return [];
  }
};

export const saveExpenses = async (expenses: Expense[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des dépenses:', error);
    throw error;
  }
};

export const addExpense = async (expense: Expense): Promise<void> => {
  try {
    const expenses = await loadExpenses();
    const updatedExpenses = [...expenses, expense];
    await saveExpenses(updatedExpenses);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la dépense:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  try {
    const expenses = await loadExpenses();
    const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
    await saveExpenses(updatedExpenses);
  } catch (error) {
    console.error('Erreur lors de la suppression de la dépense:', error);
    throw error;
  }
}; 