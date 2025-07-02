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
import DateTimePicker from "@react-native-community/datetimepicker";
import Modal from "react-native-modal";
import * as Animatable from "react-native-animatable";
import { Event, ValidationResult } from "../types";
import { loadEvents, saveEvents } from "../utils/storage";
import { formatDate, calculateDaysRemaining } from "../utils/calculations";

const { width, height } = Dimensions.get("window");

const EventsScreen = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: new Date(),
  });
  const [validation, setValidation] = useState<{
    name: ValidationResult | null;
    date: ValidationResult | null;
  }>({
    name: null,
    date: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const eventSuggestions = [
    "Voyage en Espagne",
    "Nouvel iPhone",
    "Voiture",
    "Mariage",
    "Ordinateur portable",
    "Vacances d'été",
  ];

  useEffect(() => {
    loadStoredEvents();
  }, []);

  const loadStoredEvents = async () => {
    try {
      const storedEvents = await loadEvents();
      setEvents(storedEvents);
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
    }
  };

  const validateField = (
    field: "name" | "date",
    value: string | Date
  ): ValidationResult => {
    switch (field) {
      case "name":
        if (!value || (typeof value === "string" && value.trim().length < 2)) {
          return {
            valid: false,
            message: "Le nom doit contenir au moins 2 caractères",
          };
        }
        return { valid: true, message: "Parfait ! 👍" };

      case "date":
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!value) {
          return { valid: false, message: "Veuillez sélectionner une date" };
        }
        if (selectedDate <= today) {
          return { valid: false, message: "La date doit être dans le futur" };
        }
        return { valid: true, message: "Date valide ! 📅" };

      default:
        return { valid: true, message: "" };
    }
  };

  const handleInputChange = (field: "name" | "date", value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validation en temps réel
    const validationResult = validateField(field, value);
    setValidation((prev) => ({ ...prev, [field]: validationResult }));
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange("name", suggestion);
  };

  const handleSubmit = async () => {
    // Validation finale
    const nameValidation = validateField("name", formData.name);
    const dateValidation = validateField("date", formData.date);

    if (!nameValidation.valid || !dateValidation.valid) {
      setValidation({
        name: nameValidation,
        date: dateValidation,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulation d'une requête
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newEvent: Event = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        date: formData.date.toISOString(),
        createdAt: new Date().toISOString(),
      };

      const updatedEvents = [...events, newEvent];
      await saveEvents(updatedEvents);
      setEvents(updatedEvents);

      // Animation de succès
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetModal();
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'événement:", error);
      Alert.alert("Erreur", "Impossible d'ajouter l'événement");
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setModalVisible(false);
    setFormData({ name: "", date: new Date() });
    setValidation({ name: null, date: null });
    setIsLoading(false);
    setShowSuccess(false);
  };

  const deleteEvent = async (eventId: string) => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cet événement ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedEvents = events.filter(
                (event) => event.id !== eventId
              );
              await saveEvents(updatedEvents);
              setEvents(updatedEvents);
            } catch (error) {
              console.error(
                "Erreur lors de la suppression de l'événement:",
                error
              );
              Alert.alert("Erreur", "Impossible de supprimer l'événement");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Événements</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.eventsList}
        showsVerticalScrollIndicator={false}
      >
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>
              Aucun événement planifié.{"\n"}
              Ajoutez votre premier objectif !
            </Text>
          </View>
        ) : (
          <View style={styles.eventsGrid}>
            {events.map((event) => {
              const daysRemaining = calculateDaysRemaining(event.date);
              const isExpired = daysRemaining < 0;

              return (
                <Animatable.View
                  key={event.id}
                  animation="fadeInUp"
                  duration={600}
                  style={[
                    styles.eventCard,
                    isExpired && styles.eventCardExpired,
                  ]}
                >
                  <View style={styles.eventCardHeader}>
                    <Text style={styles.eventCardName} numberOfLines={2}>
                      {event.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteEvent(event.id)}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.eventCardContent}>
                    <Text style={styles.eventCardDate}>
                      {formatDate(event.date)}
                    </Text>
                    <Text
                      style={[
                        styles.eventCardDays,
                        isExpired && styles.expiredText,
                      ]}
                    >
                      {isExpired ? "Événement passé" : `${daysRemaining} jours`}
                    </Text>
                  </View>
                </Animatable.View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={resetModal}
        onBackButtonPress={resetModal}
        style={styles.modal}
        animationIn="slideInDown"
        animationOut="slideOutUp"
        backdropOpacity={0.8}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContent}
        >
          {showSuccess ? (
            <Animatable.View animation="zoomIn" style={styles.successAnimation}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={32} color="white" />
              </View>
              <Text style={styles.successTitle}>Événement ajouté !</Text>
              <Text style={styles.successMessage}>
                Votre objectif "{formData.name}" a été enregistré avec succès.
              </Text>
            </Animatable.View>
          ) : (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nouvel Événement</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={resetModal}
                >
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formSection}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.labelIcon}>📝</Text>
                    <Text style={styles.label}>Nom de l'événement</Text>
                  </View>

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        validation.name &&
                          !validation.name.valid &&
                          styles.inputError,
                      ]}
                      value={formData.name}
                      onChangeText={(text) => handleInputChange("name", text)}
                      placeholder="Ex: Voyage en Espagne"
                      placeholderTextColor="#9CA3AF"
                    />
                    {validation.name && (
                      <Animatable.View
                        animation="zoomIn"
                        style={styles.validationIcon}
                      >
                        <Ionicons
                          name={
                            validation.name.valid
                              ? "checkmark-circle"
                              : "close-circle"
                          }
                          size={24}
                          color={validation.name.valid ? "#10B981" : "#EF4444"}
                        />
                      </Animatable.View>
                    )}
                  </View>

                  <Animatable.Text
                    animation={validation.name ? "fadeInUp" : "fadeOut"}
                    style={styles.helperText}
                  >
                    <Text style={styles.helperIcon}>💡</Text>
                    {validation.name
                      ? validation.name.message
                      : "Donnez un nom descriptif à votre événement"}
                  </Animatable.Text>

                  {!validation.name && (
                    <View style={styles.suggestionsContainer}>
                      <View style={styles.suggestionsTitle}>
                        <Text style={styles.suggestionsIcon}>💭</Text>
                        <Text style={styles.suggestionsTitleText}>
                          Suggestions populaires
                        </Text>
                      </View>
                      {eventSuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => handleSuggestionClick(suggestion)}
                        >
                          <Text style={styles.suggestionText}>
                            {suggestion}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.formSection}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.labelIcon}>📅</Text>
                    <Text style={styles.label}>Date cible</Text>
                  </View>

                  <View style={styles.inputContainer}>
                    <TouchableOpacity
                      style={[
                        styles.dateInput,
                        validation.date &&
                          !validation.date.valid &&
                          styles.inputError,
                      ]}
                      onPress={() => {
                        console.log("Opening date picker...");
                        setShowDatePicker(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dateInputText}>
                        {formData.date.toLocaleDateString("fr-FR")}
                      </Text>
                      <Ionicons name="calendar" size={20} color="#667eea" />
                    </TouchableOpacity>
                    {validation.date && (
                      <Animatable.View
                        animation="zoomIn"
                        style={styles.validationIcon}
                      >
                        <Ionicons
                          name={
                            validation.date.valid
                              ? "checkmark-circle"
                              : "close-circle"
                          }
                          size={24}
                          color={validation.date.valid ? "#10B981" : "#EF4444"}
                        />
                      </Animatable.View>
                    )}
                  </View>

                  <Animatable.Text
                    animation={validation.date ? "fadeInUp" : "fadeOut"}
                    style={styles.helperText}
                  >
                    <Text style={styles.helperIcon}>⏰</Text>
                    {validation.date
                      ? validation.date.message
                      : "Choisissez une date future pour planifier vos économies"}
                  </Animatable.Text>

                  {showDatePicker && (
                    <View style={styles.datePickerContainer}>
                      <DateTimePicker
                        value={formData.date}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        minimumDate={new Date()}
                        textColor="#1E293B"
                        accentColor="#667eea"
                        onChange={(event, selectedDate) => {
                          if (Platform.OS === "android") {
                            setShowDatePicker(false);
                          }
                          if (selectedDate) {
                            handleInputChange("date", selectedDate);
                          }
                        }}
                      />
                      {Platform.OS === "ios" && (
                        <TouchableOpacity
                          style={styles.datePickerDoneButton}
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Text style={styles.datePickerDoneText}>Terminé</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={resetModal}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    isLoading && styles.saveButtonLoading,
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Animatable.View
                      animation="rotate"
                      iterationCount="infinite"
                    >
                      <Ionicons name="refresh" size={16} color="white" />
                    </Animatable.View>
                  ) : (
                    <Text style={styles.saveButtonText}>
                      ✨ Créer l'événement
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
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
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    textShadowColor: "rgba(102, 126, 234, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#667eea",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 15,
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  eventsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  eventCard: {
    width: (width - 60) / 2,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.1)",
  },
  eventCardExpired: {
    opacity: 0.7,
    backgroundColor: "rgba(248, 249, 250, 0.95)",
  },
  eventCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventCardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    marginRight: 8,
  },
  eventCardContent: {
    flex: 1,
  },
  eventCardDate: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
    fontWeight: "500",
  },
  eventCardDays: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
    textShadowColor: "rgba(16, 185, 129, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formSection: {
    marginBottom: 32,
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
  eventItem: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.1)",
  },
  eventItemExpired: {
    opacity: 0.7,
    backgroundColor: "#F8F9FA",
  },
  eventContent: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  eventDate: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 6,
    fontWeight: "500",
  },
  daysRemaining: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10B981",
    textShadowColor: "rgba(16, 185, 129, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  expiredText: {
    color: "#EF4444",
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
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#667eea",
    textShadowColor: "rgba(102, 126, 234, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(241, 245, 249, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  progressIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressDotActive: {
    backgroundColor: "#667eea",
    transform: [{ scale: 1.4 }],
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  progressDotCompleted: {
    backgroundColor: "#10B981",
    transform: [{ scale: 1.2 }],
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  formStep: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  labelIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  inputContainer: {
    position: "relative",
    marginBottom: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "white",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  dateInput: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateInputText: {
    fontSize: 16,
    color: "#1E293B",
  },
  validationIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -12,
  },
  helperText: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 16,
  },
  helperIcon: {
    color: "#667eea",
  },
  suggestionsContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  suggestionsTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  suggestionsIcon: {
    marginRight: 6,
  },
  suggestionsTitleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#667eea",
  },
  suggestionItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
  },
  suggestionText: {
    fontSize: 14,
    color: "#1E293B",
  },
  confirmationContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  confirmationIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#667eea",
    marginBottom: 8,
  },
  confirmationDate: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 4,
  },
  confirmationDays: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
  },
  modalButtons: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 34,
    gap: 12,
    backgroundColor: "white",
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: {
    color: "#1E293B",
    fontWeight: "600",
    marginLeft: 4,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonLoading: {
    opacity: 0.8,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "700",
    marginRight: 6,
    fontSize: 16,
  },
  successAnimation: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#10B981",
    marginBottom: 10,
    textShadowColor: "rgba(16, 185, 129, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  successMessage: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
  },
  datePickerContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  datePickerDoneButton: {
    backgroundColor: "#667eea",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  datePickerDoneText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default EventsScreen;
