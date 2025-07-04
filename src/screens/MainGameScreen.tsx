import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useUsername } from "../hooks/useUsername";
import UsernameScreen from "./UsernameScreen";
import DoodleJumpScreenFixed from "./DoodleJumpScreenFixed";
import LeaderboardScreen from "./LeaderboardScreen";
import SettingsScreen from "./SettingsScreen";

type ScreenType = "username" | "game" | "leaderboard" | "settings";

const MainGameScreen: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("username");
  const { username, isLoading, hasUsername } = useUsername();

  useEffect(() => {
    if (!isLoading && username && username.trim().length > 0) {
      setCurrentScreen("game");
    } else if (!isLoading) {
      setCurrentScreen("username");
    }
  }, [isLoading, username]);

  const handleUsernameComplete = () => {
    setCurrentScreen("game");
  };

  const handleNavigateToLeaderboard = () => {
    setCurrentScreen("leaderboard");
  };

  const handleNavigateToSettings = () => {
    setCurrentScreen("settings");
  };

  const handleBackToGame = () => {
    setCurrentScreen("game");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "username":
        return <UsernameScreen onComplete={handleUsernameComplete} />;
      case "game":
        return (
          <DoodleJumpScreenFixed
            onShowLeaderboard={handleNavigateToLeaderboard}
            onShowSettings={handleNavigateToSettings}
          />
        );
      case "leaderboard":
        return <LeaderboardScreen onBack={handleBackToGame} />;
      case "settings":
        return <SettingsScreen onBack={handleBackToGame} />;
      default:
        return <UsernameScreen onComplete={handleUsernameComplete} />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainGameScreen;
