import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import * as Animatable from "react-native-animatable";
import { Event, Expense } from "../types";
import { loadEvents, loadExpenses, saveExpenses } from "../utils/storage";
import {
  calculateSavings,
  formatCurrency,
  formatDate,
  getFrequencyLabel,
} from "../utils/calculations";

const { width, height } = Dimensions.get("window");

const ExpensesScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    frequency: "daily" as "daily" | "weekly" | "monthly",
    eventId: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedEvents, loadedExpenses] = await Promise.all([
        loadEvents(),
        loadExpenses(),
      ]);
      setEvents(loadedEvents);
      setExpenses(loadedExpenses);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  const handleAddExpense = async () => {
    if (!formData.description.trim()) {
      Alert.alert("Erreur", "Veuillez entrer une description");
      return;
    }

    if (
      !formData.amount ||
      isNaN(Number(formData.amount)) ||
      Number(formData.amount) <= 0
    ) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide");
      return;
    }

    if (!formData.eventId) {
      Alert.alert("Erreur", "Veuillez sélectionner un événement");
      return;
    }

    setIsLoading(true);

    try {
      const newExpense: Expense = {
        id: Date.now().toString(),
        amount: Number(formData.amount),
        frequency: formData.frequency,
        description: formData.description.trim(),
        eventId: formData.eventId,
        createdAt: new Date().toISOString(),
      };

      const updatedExpenses = [...expenses, newExpense];
      await saveExpenses(updatedExpenses);
      setExpenses(updatedExpenses);
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la dépense:", error);
      Alert.alert("Erreur", "Impossible d'ajouter la dépense");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      frequency: "daily",
      eventId: "",
    });
  };

  const deleteExpense = async (expenseId: string) => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette dépense ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedExpenses = expenses.filter(
                (expense) => expense.id !== expenseId
              );
              await saveExpenses(updatedExpenses);
              setExpenses(updatedExpenses);
            } catch (error) {
              console.error(
                "Erreur lors de la suppression de la dépense:",
                error
              );
              Alert.alert("Erreur", "Impossible de supprimer la dépense");
            }
          },
        },
      ]
    );
  };

  const getEventById = (eventId: string): Event | undefined => {
    return events.find((event) => event.id === eventId);
  };

  const futureEvents = events.filter((event) => {
    const today = new Date();
    const eventDate = new Date(event.date);
    return eventDate > today;
  });

  const FrequencyButton = ({
    frequency,
    label,
  }: {
    frequency: "daily" | "weekly" | "monthly";
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.frequencyButton,
        formData.frequency === frequency && styles.frequencyButtonSelected,
      ]}
      onPress={() => setFormData((prev) => ({ ...prev, frequency }))}
    >
      <Text
        style={[
          styles.frequencyButtonText,
          formData.frequency === frequency &&
            styles.frequencyButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const EventButton = ({ event }: { event: Event }) => (
    <TouchableOpacity
      style={[
        styles.eventButton,
        formData.eventId === event.id && styles.eventButtonSelected,
      ]}
      onPress={() => setFormData((prev) => ({ ...prev, eventId: event.id }))}
    >
      <Text
        style={[
          styles.eventButtonText,
          formData.eventId === event.id && styles.eventButtonTextSelected,
        ]}
      >
        {event.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dépenses Simulées</Text>
        <TouchableOpacity
          style={[
            styles.addButton,
            futureEvents.length === 0 && styles.addButtonDisabled,
          ]}
          onPress={() => setModalVisible(true)}
          disabled={futureEvents.length === 0}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {futureEvents.length === 0 && (
        <Animatable.View animation="fadeIn" style={styles.noEventsContainer}>
          <Text style={styles.noEventsIcon}>📅</Text>
          <Text style={styles.noEventsText}>
            Aucun événement futur.{"\n"}
            Ajoutez d'abord un événement dans l'onglet "Événements" pour simuler
            des dépenses !
          </Text>
          <TouchableOpacity style={styles.noEventsButton}>
            <Text style={styles.noEventsButtonText}>Aller aux Événements</Text>
          </TouchableOpacity>
        </Animatable.View>
      )}

      <ScrollView
        style={styles.expensesList}
        showsVerticalScrollIndicator={false}
      >
        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💸</Text>
            <Text style={styles.emptyText}>
              Aucune dépense simulée.{"\n"}
              Commencez par ajouter une dépense !
            </Text>
          </View>
        ) : (
          expenses.map((expense) => {
            const event = getEventById(expense.eventId);
            if (!event) return null;

            const savings = calculateSavings([expense], event);
            const isExpired = savings.daysRemaining <= 0;

            return (
              <Animatable.View
                key={expense.id}
                animation="fadeInUp"
                duration={600}
                style={[
                  styles.expenseItem,
                  isExpired && styles.expenseItemExpired,
                ]}
              >
                <View style={styles.expenseContent}>
                  <Text style={styles.expenseDescription}>
                    {expense.description}
                  </Text>
                  <Text style={styles.expenseAmount}>
                    {formatCurrency(expense.amount)}{" "}
                    {getFrequencyLabel(expense.frequency)}
                  </Text>
                  <Text style={styles.eventName}>Pour : {event.name}</Text>

                  <View style={styles.savingsInfo}>
                    <Text style={styles.savingsTitle}>
                      Économies potentielles
                    </Text>
                    <Text style={styles.totalSavings}>
                      {formatCurrency(savings.totalSavings)}
                    </Text>
                    <Text style={styles.daysRemaining}>
                      {isExpired
                        ? "Événement passé"
                        : `Dans ${savings.daysRemaining} jours`}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteExpense(expense.id)}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </Animatable.View>
            );
          })
        )}
      </ScrollView>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        style={styles.modal}
        animationIn="slideInDown"
        animationOut="slideOutUp"
        backdropOpacity={0.8}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContent}
        >
          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.modalTitle}>Nouvelle Dépense</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="ex: Café quotidien"
                placeholderTextColor="#9CA3AF"
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Montant (€)</Text>
              <TextInput
                style={styles.input}
                placeholder="ex: 5"
                placeholderTextColor="#9CA3AF"
                value={formData.amount}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, amount: text }))
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Fréquence</Text>
              <View style={styles.frequencyContainer}>
                <FrequencyButton frequency="daily" label="Par jour" />
                <FrequencyButton frequency="weekly" label="Par semaine" />
                <FrequencyButton frequency="monthly" label="Par mois" />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Événement cible</Text>
              <View style={styles.eventsContainer}>
                {futureEvents.map((event) => (
                  <EventButton key={event.id} event={event} />
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isLoading && styles.saveButtonLoading,
                ]}
                onPress={handleAddExpense}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Animatable.View animation="rotate" iterationCount="infinite">
                    <Ionicons name="refresh" size={16} color="white" />
                  </Animatable.View>
                ) : (
                  <Text style={styles.saveButtonText}>Ajouter</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 0,
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    textShadowColor: "rgba(240, 147, 251, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f093fb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
  },
  addButtonText: {
    color: "white",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 15,
  },
  noEventsContainer: {
    backgroundColor: "rgba(254, 243, 199, 0.9)",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 20,
    borderLeftWidth: 6,
    borderLeftColor: "#F59E0B",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  noEventsIcon: {
    fontSize: 56,
    textAlign: "center",
    marginBottom: 16,
  },
  noEventsText: {
    color: "#92400E",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  noEventsButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    alignSelf: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  noEventsButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
  expensesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },
  expenseItem: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(240, 147, 251, 0.1)",
  },
  expenseItemExpired: {
    opacity: 0.7,
    backgroundColor: "#F8F9FA",
  },
  expenseContent: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f093fb",
    marginBottom: 6,
    textShadowColor: "rgba(240, 147, 251, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  eventName: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 14,
    fontWeight: "500",
  },
  savingsInfo: {
    backgroundColor: "rgba(209, 250, 229, 0.9)",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 6,
    borderLeftColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  savingsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 4,
  },
  totalSavings: {
    fontSize: 20,
    fontWeight: "800",
    color: "#10B981",
    marginBottom: 4,
    textShadowColor: "rgba(16, 185, 129, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  daysRemaining: {
    fontSize: 13,
    color: "#065F46",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modal: {
    margin: 0,
    justifyContent: "flex-start",
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    minHeight: height * 0.8,
    maxHeight: height * 0.95,
    marginTop: 50,
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 15,
  },
  modalScroll: {
    padding: 24,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#f093fb",
    textAlign: "center",
    marginBottom: 28,
    textShadowColor: "rgba(240, 147, 251, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  frequencyContainer: {
    flexDirection: "row",
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  frequencyButtonSelected: {
    backgroundColor: "#f093fb",
    borderColor: "#f093fb",
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  frequencyButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  frequencyButtonTextSelected: {
    color: "white",
  },
  eventsContainer: {
    gap: 10,
  },
  eventButton: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  eventButtonSelected: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  eventButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  eventButtonTextSelected: {
    color: "white",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    backgroundColor: "white",
    paddingBottom: 34,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#475569",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#f093fb",
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: "#f093fb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    alignItems: "center",
  },
  saveButtonLoading: {
    opacity: 0.8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default ExpensesScreen;
