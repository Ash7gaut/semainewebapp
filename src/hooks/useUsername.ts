import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLeaderboardEntry } from '../services/leaderboardService';

const USERNAME_KEY = '@doodle_jump_username';

export const useUsername = () => {
  const [username, setUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Charger le pseudo au démarrage
  useEffect(() => {
    loadUsername();
  }, []);

  const loadUsername = async () => {
    try {
      const savedUsername = await AsyncStorage.getItem(USERNAME_KEY);
      if (savedUsername) {
        setUsername(savedUsername);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du pseudo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUsername = async (newUsername: string) => {
    try {
      // Sauvegarder en local
      await AsyncStorage.setItem(USERNAME_KEY, newUsername);
      setUsername(newUsername);
      
      // Créer l'entrée leaderboard avec score 0
      await createLeaderboardEntry(newUsername);
      
      console.log('Pseudo sauvegardé et entrée leaderboard créée:', newUsername);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du pseudo:', error);
    }
  };

  const hasUsername = () => {
    return username && username.trim().length > 0;
  };

  return {
    username,
    setUsername: saveUsername,
    hasUsername,
    isLoading,
  };
}; 