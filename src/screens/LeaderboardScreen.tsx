import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getTopScores, LeaderboardEntry } from "../services/leaderboardService";
import { useUsername } from "../hooks/useUsername";

interface LeaderboardScreenProps {
  onBack: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { username } = useUsername();

  const loadScores = async () => {
    try {
      const topScores = await getTopScores(20);
      setScores(topScores);
    } catch (error) {
      console.error("Erreur lors du chargement du leaderboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadScores();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadScores();
  };

  const renderScoreItem = ({
    item,
    index,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => {
    const isCurrentUser = item.username === username;

    return (
      <View style={[styles.scoreItem, isCurrentUser && styles.currentUserItem]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, index < 3 && styles.topRankText]}>
            #{index + 1}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text
            style={[styles.username, isCurrentUser && styles.currentUsername]}
          >
            {item.username}
          </Text>
          {isCurrentUser && <Text style={styles.youText}>(Vous)</Text>}
        </View>

        <View style={styles.scoreContainer}>
          <Text
            style={[styles.scoreText, isCurrentUser && styles.currentScoreText]}
          >
            {item.score.toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Chargement du leaderboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={scores}
        renderItem={renderScoreItem}
        keyExtractor={(item) => item.id || item.username + item.score}
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="white"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun score encore enregistré</Text>
            <Text style={styles.emptySubtext}>
              Soyez le premier à battre un record !
            </Text>
          </View>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scoreItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  currentUserItem: {
    backgroundColor: "rgba(255, 215, 0, 0.3)",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  rankContainer: {
    width: 50,
    alignItems: "center",
  },
  rankText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  topRankText: {
    color: "#FFD700",
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  currentUsername: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  youText: {
    fontSize: 12,
    color: "#FFD700",
    fontStyle: "italic",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  currentScoreText: {
    color: "#FFD700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
});

export default LeaderboardScreen;
