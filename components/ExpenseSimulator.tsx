import React, { useContext, useState } from "react";
import { View, Text, Picker } from "react-native";
import { ExpensesContext } from "../contexts/ExpensesContext";
import { EventsContext } from "../contexts/EventsContext";

function daysBetween(start: Date, end: Date) {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function getMultiplier(frequency: string) {
  if (frequency === "jour") return 1;
  if (frequency === "semaine") return 1 / 7;
  if (frequency === "mois") return 1 / 30;
  return 1;
}

const ExpenseSimulator = () => {
  const { expenses } = useContext(ExpensesContext);
  const { events } = useContext(EventsContext);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  );

  if (expenses.length === 0 || events.length === 0) {
    return <Text>Ajoutez d'abord une dépense et un événement.</Text>;
  }

  const selectedExpense =
    expenses.find((e) => e.id === selectedExpenseId) || expenses[0];
  const event = events.find((ev) => ev.id === selectedExpense.eventId);

  let total = 0;
  if (event && selectedExpense) {
    const now = new Date();
    const target = new Date(event.date);
    const days = daysBetween(now, target);
    const multiplier = getMultiplier(selectedExpense.frequency);
    total = Math.max(0, Math.round(selectedExpense.amount * days * multiplier));
  }

  return (
    <View style={{ marginVertical: 10 }}>
      <Text>Choisissez une dépense :</Text>
      {/* Picker pour sélectionner la dépense */}
      <Picker
        selectedValue={selectedExpenseId || expenses[0].id}
        onValueChange={setSelectedExpenseId}
      >
        {expenses.map((exp) => (
          <Picker.Item
            key={exp.id}
            label={`Dépense ${exp.amount}€/${exp.frequency}`}
            value={exp.id}
          />
        ))}
      </Picker>
      {event && (
        <Text>
          Si vous arrêtez cette dépense jusqu'à "{event.name}", vous
          économiserez environ {total} €
        </Text>
      )}
    </View>
  );
};

export default ExpenseSimulator;
