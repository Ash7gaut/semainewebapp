import { Event, Expense, SavingsCalculation } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const calculateDaysRemaining = (eventDate: string): number => {
  const today = new Date();
  const targetDate = new Date(eventDate);
  
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const timeDiff = targetDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return daysDiff;
};

export const calculateSavings = (expenses: Expense[], event: Event): SavingsCalculation => {
  const daysRemaining = calculateDaysRemaining(event.date);
  
  if (daysRemaining <= 0) {
    return {
      totalSavings: 0,
      daysRemaining: 0,
      dailySavings: 0,
      weeklySavings: 0,
      monthlySavings: 0
    };
  }

  // Calcul des économies quotidiennes selon la fréquence
  let dailySavings = 0;
  
  expenses.forEach(expense => {
    if (expense.eventId === event.id) {
      switch (expense.frequency) {
        case 'daily':
          dailySavings += expense.amount;
          break;
        case 'weekly':
          dailySavings += expense.amount / 7;
          break;
        case 'monthly':
          dailySavings += expense.amount / 30;
          break;
      }
    }
  });

  const totalSavings = dailySavings * daysRemaining;
  const weeklySavings = dailySavings * 7;
  const monthlySavings = dailySavings * 30;

  return {
    totalSavings,
    daysRemaining,
    dailySavings,
    weeklySavings,
    monthlySavings
  };
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const getFrequencyLabel = (frequency: 'daily' | 'weekly' | 'monthly'): string => {
  switch (frequency) {
    case 'daily':
      return 'par jour';
    case 'weekly':
      return 'par semaine';
    case 'monthly':
      return 'par mois';
    default:
      return '';
  }
}; 