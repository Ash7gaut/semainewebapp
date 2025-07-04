import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useUsername } from "../hooks/useUsername";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { username, setUsername } = useUsername();
  const [newUsername, setNewUsername] = useState(username);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveUsername = async () => {
    const trimmedUsername = newUsername.trim();

    if (trimmedUsername.length < 2) {
      Alert.alert("Erreur", "Le pseudo doit contenir au moins 2 caractères");
      return;
    }

    if (trimmedUsername.length > 15) {
      Alert.alert("Erreur", "Le pseudo ne peut pas dépasser 15 caractères");
      return;
    }

    if (trimmedUsername === username) {
      setIsEditing(false);
      return;
    }

    try {
      await setUsername(trimmedUsername);
      setIsEditing(false);
      Alert.alert("Succès", "Pseudo mis à jour avec succès !");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder le pseudo");
    }
  };

  const handleCancelEdit = () => {
    setNewUsername(username);
    setIsEditing(false);
  };

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Paramètres</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profil</Text>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Pseudo actuel</Text>
              {!isEditing ? (
                <View style={styles.usernameDisplay}>
                  <Text style={styles.usernameText}>{username}</Text>
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>Modifier</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.usernameInput}
                    value={newUsername}
                    onChangeText={setNewUsername}
                    maxLength={15}
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity
                      onPress={handleCancelEdit}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveUsername}
                      style={[
                        styles.saveButton,
                        newUsername.trim().length < 2 &&
                          styles.saveButtonDisabled,
                      ]}
                      disabled={newUsername.trim().length < 2}
                    >
                      <Text style={styles.saveButtonText}>Sauvegarder</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Développeur</Text>
              <Text style={styles.aboutValue}>Antonin Gautier</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  settingItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 10,
  },
  usernameDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  usernameText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  editContainer: {
    gap: 15,
  },
  usernameInput: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  editButtons: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f44336",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  aboutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
  },
  aboutLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  aboutValue: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});

export default SettingsScreen;
