import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Expense = {
  id: string;
  amount: number;
  frequency: "jour" | "semaine" | "mois";
  eventId: string;
};

type ExpensesContextType = {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  removeExpense: (id: string) => void;
};

export const ExpensesContext = createContext<ExpensesContextType>({
  expenses: [],
  addExpense: () => {},
  removeExpense: () => {},
});

export const ExpensesProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("expenses").then((data) => {
      if (data) setExpenses(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <ExpensesContext.Provider value={{ expenses, addExpense, removeExpense }}>
      {children}
    </ExpensesContext.Provider>
  );
};
