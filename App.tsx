import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import EventsScreen from "./src/screens/EventsScreen";
import ExpensesScreen from "./src/screens/ExpensesScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <View style={styles.container}>
        <LinearGradient
          colors={["#667eea", "#764ba2", "#f093fb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <BlurView intensity={20} style={styles.headerBlur}>
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.emoji}>💰</Text>
                <Text style={styles.title}>Simulateur d'Économies</Text>
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Événements</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>0€</Text>
                  <Text style={styles.statLabel}>Économies</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </LinearGradient>

        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === "Events") {
                iconName = focused ? "calendar" : "calendar-outline";
              } else if (route.name === "Expenses") {
                iconName = focused ? "card" : "card-outline";
              } else {
                iconName = "help-outline";
              }

              return (
                <View
                  style={[
                    styles.tabIconContainer,
                    focused && styles.tabIconActive,
                  ]}
                >
                  <Ionicons name={iconName} size={size} color={color} />
                </View>
              );
            },
            tabBarActiveTintColor: "#667eea",
            tabBarInactiveTintColor: "#64748B",
            tabBarStyle: {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderTopWidth: 0,
              elevation: 25,
              shadowColor: "#667eea",
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              height: 90,
              paddingBottom: 25,
              paddingTop: 15,
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "700",
              marginTop: 4,
            },
            headerShown: false,
          })}
        >
          <Tab.Screen
            name="Events"
            component={EventsScreen}
            options={{ tabBarLabel: "Événements" }}
          />
          <Tab.Screen
            name="Expenses"
            component={ExpensesScreen}
            options={{ tabBarLabel: "Dépenses" }}
          />
        </Tab.Navigator>
      </View>
    </NavigationContainer>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerBlur: {
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerContent: {
    padding: 20,
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 16,
  },
  tabIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(102, 126, 234, 0.1)",
  },
  tabIconActive: {
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
