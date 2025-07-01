import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Event = {
  id: string;
  name: string;
  date: string; // format ISO
};

type EventsContextType = {
  events: Event[];
  addEvent: (event: Omit<Event, "id">) => void;
  removeEvent: (id: string) => void;
};

export const EventsContext = createContext<EventsContextType>({
  events: [],
  addEvent: () => {},
  removeEvent: () => {},
});

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("events").then((data) => {
      if (data) setEvents(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const addEvent = (event: Omit<Event, "id">) => {
    const newEvent = { ...event, id: Date.now().toString() };
    setEvents((prev) => [...prev, newEvent]);
  };

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <EventsContext.Provider value={{ events, addEvent, removeEvent }}>
      {children}
    </EventsContext.Provider>
  );
};
