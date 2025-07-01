import React, { useContext } from "react";
import { View, Text, FlatList } from "react-native";
import { EventsContext, Event } from "../contexts/EventsContext";

function daysUntil(dateString: string) {
  const now = new Date();
  const target = new Date(dateString);
  const diff = Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

const EventList = () => {
  const { events } = useContext(EventsContext);

  if (events.length === 0) {
    return <Text>Aucun événement à venir.</Text>;
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 10 }}>
          <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
          <Text>Dans {daysUntil(item.date)} jours</Text>
        </View>
      )}
    />
  );
};

export default EventList;
