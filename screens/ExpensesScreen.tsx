import React from "react";
import { View, Text } from "react-native";
import ExpenseSimulator from "../components/ExpenseSimulator";
import AddExpenseForm from "../components/AddExpenseForm";

const ExpensesScreen = () => {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Simulation des économies potentielles
      </Text>
      <AddExpenseForm />
      <ExpenseSimulator />
    </View>
  );
};

export default ExpensesScreen;
