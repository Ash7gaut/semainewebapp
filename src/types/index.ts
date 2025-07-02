export interface Event {
  id: string;
  name: string;
  date: string; // ISO string
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
  totalSavings: number;
  daysRemaining: number;
  dailySavings: number;
  weeklySavings: number;
  monthlySavings: number;
}

export type TabType = 'events' | 'expenses';

export interface ValidationResult {
  valid: boolean;
  message: string;
} 