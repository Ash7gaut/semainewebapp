import { Event, Expense, SavingsCalculation } from '../types';

export const calculateDaysRemaining = (eventDate: string): number => {
  const today = new Date();
  const targetDate = new Date(eventDate);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const convertToDaily = (amount: number, frequency: 'daily' | 'weekly' | 'monthly'): number => {
  switch (frequency) {
    case 'daily':
      return amount;
    case 'weekly':
      return amount / 7;
    case 'monthly':
      return amount / 30; // Approximation
    default:
      return amount;
  }
};

export const calculateSavings = (
  expense: Expense,
  event: Event
): SavingsCalculation => {
  const daysRemaining = calculateDaysRemaining(event.date);
  const dailySavings = convertToDaily(expense.amount, expense.frequency);
  const totalSavings = dailySavings * daysRemaining;

  return {
    eventId: event.id,
    eventName: event.name,
    daysRemaining,
    totalSavings,
    dailySavings,
    weeklySavings: dailySavings * 7,
    monthlySavings: dailySavings * 30,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}; 