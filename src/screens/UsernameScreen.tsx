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

interface UsernameScreenProps {
  onComplete: () => void;
}

const UsernameScreen: React.FC<UsernameScreenProps> = ({ onComplete }) => {
  const [inputUsername, setInputUsername] = useState("");
  const { setUsername } = useUsername();

  const handleSubmit = async () => {
    const trimmedUsername = inputUsername.trim();

    if (trimmedUsername.length < 2) {
      Alert.alert("Erreur", "Le pseudo doit contenir au moins 2 caractères");
      return;
    }

    if (trimmedUsername.length > 15) {
      Alert.alert("Erreur", "Le pseudo ne peut pas dépasser 15 caractères");
      return;
    }

    try {
      await setUsername(trimmedUsername);
      onComplete();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder le pseudo");
    }
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
        <View style={styles.content}>
          <Text style={styles.title}>Bienvenue !</Text>
          <Text style={styles.subtitle}>
            Choisissez votre pseudo pour commencer à jouer
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Votre pseudo..."
              placeholderTextColor="#999"
              value={inputUsername}
              onChangeText={setInputUsername}
              maxLength={15}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              inputUsername.trim().length < 2 && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={inputUsername.trim().length < 2}
          >
            <Text style={styles.buttonText}>Commencer</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 40,
    opacity: 0.9,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 18,
    textAlign: "center",
    color: "#333",
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    paddingHorizontal: 40,
    paddingVertical: 15,
    minWidth: 150,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default UsernameScreen;
