import React, { useState, useContext } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { EventsContext } from "../contexts/EventsContext";

const AddEventForm = () => {
  const { addEvent } = useContext(EventsContext);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  const handleAdd = () => {
    if (name && date) {
      addEvent({ name, date });
      setName("");
      setDate("");
    }
  };

  return (
    <View style={{ marginVertical: 10 }}>
      <Text>Nom de l'événement :</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Ex : Vacances"
        style={{ borderWidth: 1, marginBottom: 5, padding: 5 }}
      />
      <Text>Date (AAAA-MM-JJ) :</Text>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="2024-12-31"
        style={{ borderWidth: 1, marginBottom: 5, padding: 5 }}
      />
      <Button title="Ajouter l'événement" onPress={handleAdd} />
    </View>
  );
};

export default AddEventForm;
