import React, { useState, useContext } from "react";
import { View, TextInput, Button, Text, Picker } from "react-native";
import { ExpensesContext } from "../contexts/ExpensesContext";
import { EventsContext } from "../contexts/EventsContext";

const AddExpenseForm = () => {
  const { addExpense } = useContext(ExpensesContext);
  const { events } = useContext(EventsContext);
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<"jour" | "semaine" | "mois">(
    "jour"
  );
  const [eventId, setEventId] = useState(events[0]?.id || "");

  const handleAdd = () => {
    if (amount && eventId) {
      addExpense({ amount: parseFloat(amount), frequency, eventId });
      setAmount("");
    }
  };

  if (events.length === 0) {
    return <Text>Ajoutez d'abord un événement.</Text>;
  }

  return (
    <View style={{ marginVertical: 10 }}>
      <Text>Montant :</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Ex : 5"
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 5, padding: 5 }}
      />
      <Text>Fréquence :</Text>
      <Picker selectedValue={frequency} onValueChange={setFrequency}>
        <Picker.Item label="Par jour" value="jour" />
        <Picker.Item label="Par semaine" value="semaine" />
        <Picker.Item label="Par mois" value="mois" />
      </Picker>
      <Text>Événement cible :</Text>
      <Picker selectedValue={eventId} onValueChange={setEventId}>
        {events.map((ev) => (
          <Picker.Item key={ev.id} label={ev.name} value={ev.id} />
        ))}
      </Picker>
      <Button title="Ajouter la dépense simulée" onPress={handleAdd} />
    </View>
  );
};

export default AddExpenseForm;
