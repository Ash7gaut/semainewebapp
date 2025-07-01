import React from "react";
import { View, Text } from "react-native";
import EventList from "../components/EventList";
import AddEventForm from "../components/AddEventForm";

const EventsScreen = () => {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Événements à venir
      </Text>
      <AddEventForm />
      <EventList />
    </View>
  );
};

export default EventsScreen;
