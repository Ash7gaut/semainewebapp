import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import EventsScreen from "./screens/EventsScreen";
import ExpensesScreen from "./screens/ExpensesScreen";
import { EventsProvider } from "./contexts/EventsContext";
import { ExpensesProvider } from "./contexts/ExpensesContext";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <EventsProvider>
      <ExpensesProvider>
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen name="Événements" component={EventsScreen} />
            <Tab.Screen name="Dépenses simulées" component={ExpensesScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </ExpensesProvider>
    </EventsProvider>
  );
}
