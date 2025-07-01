export interface Event {
  id: string;
  name: string;
  date: string; // Format ISO string
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  description: string;
  eventId: string;
  createdAt: string;
}

export interface SavingsCalculation {
  eventId: string;
  eventName: string;
  daysRemaining: number;
  totalSavings: number;
  dailySavings: number;
  weeklySavings: number;
  monthlySavings: number;
} 