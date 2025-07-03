import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import {
  useInfinitePlatformsFinal as useInfinitePlatforms,
  Platform,
} from "../hooks/useInfinitePlatformsFinal";

const { width, height } = Dimensions.get("window");

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  highScore: number;
  lives: number;
  level: number;
}

const DoodleJumpScreenFixed = () => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    score: 0,
    highScore: 0,
    lives: 1,
    level: 1,
  });

  const [player, setPlayer] = useState({
    x: width / 2 - 25,
    y: height - 200,
    velocityY: 0,
    velocityX: 0,
    width: 50,
    height: 50,
  });

  // Utiliser le hook pour la gestion des plateformes infinies
  const {
    platforms,
    updatePlatforms,
    initializePlatforms,
    reset: resetPlatforms,
    getDebugInfo,
    markPlatformAsHit,
  } = useInfinitePlatforms();

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const gravity = 0.5; // Réduit de 0.8 à 0.5 pour un saut plus lent (chute plus lente)
  const jumpForce = -15; // Remis à la hauteur originale
  const moveSpeed = 5;

  // Animations
  const playerAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      startGameLoop();
    } else {
      stopGameLoop();
    }

    return () => stopGameLoop();
  }, [gameState.isPlaying, gameState.isPaused]);

  const startGameLoop = () => {
    gameLoopRef.current = setInterval(() => {
      updateGame();
    }, 16); // ~60 FPS
  };

  const stopGameLoop = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  };

  const updateGame = () => {
    setPlayer((prevPlayer) => {
      const newVelocityY = prevPlayer.velocityY + gravity;
      const newY = prevPlayer.y + newVelocityY;
      const newX = prevPlayer.x + prevPlayer.velocityX;

      // Wrap around screen horizontally
      let wrappedX = newX;
      if (newX < -prevPlayer.width) wrappedX = width;
      if (newX > width) wrappedX = -prevPlayer.width;

      const newPlayer = {
        ...prevPlayer,
        y: newY,
        x: wrappedX,
        velocityY: newVelocityY,
      };

      // Mettre à jour les plateformes avec la nouvelle position du joueur
      updatePlatforms(newY, (currentPlatforms) => {
        // Mettre à jour les plateformes mobiles
        const updatedPlatforms = currentPlatforms.map((platform) => {
          if (platform.type === "moving" && platform.movingDirection) {
            const speed = platform.movingSpeed || 0.1;
            const newX = platform.x + speed * platform.movingDirection;
            let newDirection = platform.movingDirection;

            if (newX <= 0 || newX + platform.width >= width) {
              newDirection = -newDirection;
            }

            return {
              ...platform,
              x: Math.max(0, Math.min(width - platform.width, newX)),
              movingDirection: newDirection,
            };
          }
          return platform;
        });

        // Vérifier les collisions avec les plateformes mises à jour
        checkCollisionsWithPlatforms(updatedPlatforms, newPlayer);

        return updatedPlatforms;
      });

      return newPlayer;
    });
  };

  const checkCollisionsWithPlatforms = (
    currentPlatforms: any[],
    currentPlayer: any
  ) => {
    setPlayer((prevPlayer) => {
      // Vérifier les collisions avec les plateformes (en coordonnées absolues)
      const onPlatform = currentPlatforms.some((platform) => {
        // Ignorer les plateformes qui ont disparu
        if (
          platform.type === "disappearing" &&
          platform.hitCount &&
          platform.hitCount >= 2
        ) {
          return false;
        }

        return (
          currentPlayer.y + currentPlayer.height >= platform.y &&
          currentPlayer.y + currentPlayer.height <= platform.y + 20 &&
          currentPlayer.x + currentPlayer.width > platform.x &&
          currentPlayer.x < platform.x + platform.width &&
          currentPlayer.velocityY >= 0
        );
      });

      if (onPlatform) {
        // Trouver la plateforme sur laquelle on atterrit
        const platform = currentPlatforms.find((p) => {
          return (
            currentPlayer.y + currentPlayer.height >= p.y &&
            currentPlayer.y + currentPlayer.height <= p.y + 20 &&
            currentPlayer.x + currentPlayer.width > p.x &&
            currentPlayer.x < p.x + p.width &&
            currentPlayer.velocityY >= 0
          );
        });

        if (platform) {
          let jumpMultiplier = 1;
          if (platform.type === "trampoline") jumpMultiplier = 1.5;

          // Marquer les plateformes qui disparaissent comme touchées
          if (platform.type === "disappearing") {
            markPlatformAsHit(platform.id);
          }

          return {
            ...prevPlayer,
            y: platform.y - currentPlayer.height,
            velocityY: jumpForce * jumpMultiplier,
          };
        }
      }

      // Vérifier si le joueur est tombé (mort plus rapide)
      if (currentPlayer.y > height + 20) {
        // Réduit de +50 à +20 pixels
        loseLife();
        return {
          ...prevPlayer,
          y: height - 200,
          velocityY: 0,
          x: width / 2 - 25,
        };
      }

      return prevPlayer;
    });

    // Mettre à jour le score basé sur la hauteur
    const currentHeight = height - currentPlayer.y;
    if (currentHeight > gameState.score) {
      setGameState((prev) => ({
        ...prev,
        score: Math.floor(currentHeight / 10),
      }));
    }
  };

  const checkCollisions = () => {
    checkCollisionsWithPlatforms(platforms, player);
  };

  const loseLife = () => {
    gameOver();
  };

  const gameOver = () => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
    }));

    // Mettre à jour le meilleur score
    if (gameState.score > gameState.highScore) {
      setGameState((prev) => ({
        ...prev,
        highScore: gameState.score,
      }));
    }

    Alert.alert(
      "Game Over!",
      `Score: ${gameState.score}\nHigh Score: ${Math.max(
        gameState.score,
        gameState.highScore
      )}`,
      [
        { text: "Rejouer", onPress: startNewGame },
        {
          text: "Menu",
          onPress: () =>
            setGameState((prev) => ({ ...prev, isPlaying: false })),
        },
      ]
    );
  };

  const startNewGame = () => {
    setGameState({
      isPlaying: true,
      isPaused: false,
      score: 0,
      highScore: gameState.highScore,
      lives: 1,
      level: 1,
    });

    setPlayer({
      x: width / 2 - 25,
      y: height - 200,
      velocityY: 0,
      velocityX: 0,
      width: 50,
      height: 50,
    });

    // Réinitialiser et initialiser les plateformes avec le hook
    resetPlatforms();
    initializePlatforms(height - 200, 20);
  };

  const handleMove = (direction: number) => {
    setPlayer((prev) => ({
      ...prev,
      velocityX: direction * moveSpeed,
    }));
  };

  const handleJump = () => {
    // Vérifier si le joueur est sur une plateforme
    const onPlatform = platforms.some((platform) => {
      return (
        player.y + player.height >= platform.y &&
        player.y + player.height <= platform.y + 20 &&
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width &&
        player.velocityY >= 0
      );
    });

    if (onPlatform) {
      setPlayer((prev) => ({
        ...prev,
        velocityY: jumpForce,
      }));
    }
  };

  const togglePause = () => {
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const cameraY = player.y - height * 0.5;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        style={styles.background}
      >
        {/* Game UI */}
        <View style={styles.gameUI}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {gameState.score}</Text>
            <Text style={styles.highScoreText}>
              Meilleur: {gameState.highScore}
            </Text>
            {gameState.isPlaying && (
              <Text style={styles.debugText}>
                Plateformes: {getDebugInfo().count} | Y: {Math.floor(player.y)}
              </Text>
            )}
          </View>

          <View style={styles.livesContainer}>
            <Ionicons name="heart" size={24} color="#EF4444" />
          </View>

          {gameState.isPlaying && (
            <TouchableOpacity style={styles.pauseButton} onPress={togglePause}>
              <Ionicons
                name={gameState.isPaused ? "play" : "pause"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Game Area */}
        <View style={styles.gameArea}>
          {!gameState.isPlaying ? (
            // Menu principal
            <View style={styles.menuContainer}>
              <Animatable.View animation="bounceIn" delay={200}>
                <Text style={styles.gameTitle}>🚀 Doodle Jump</Text>
              </Animatable.View>

              <Animatable.View animation="fadeInUp" delay={400}>
                <Text style={styles.gameSubtitle}>
                  Sautez de plateforme en plateforme !
                </Text>
              </Animatable.View>

              <Animatable.View animation="fadeInUp" delay={600}>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={startNewGame}
                >
                  <Text style={styles.startButtonText}>🎮 Commencer</Text>
                </TouchableOpacity>
              </Animatable.View>

              {gameState.highScore > 0 && (
                <Animatable.View animation="fadeInUp" delay={800}>
                  <Text style={styles.highScoreDisplay}>
                    Meilleur score: {gameState.highScore}
                  </Text>
                </Animatable.View>
              )}
            </View>
          ) : (
            // Zone de jeu
            <TouchableOpacity
              style={styles.gameContainer}
              activeOpacity={1}
              onPress={handleJump}
            >
              {/* Plateformes */}
              {(() => {
                return null;
              })()}
              {platforms.map((platform) => {
                const displayY = platform.y - cameraY;
                return (
                  <View
                    key={platform.id}
                    style={[
                      styles.platform,
                      {
                        left: platform.x,
                        top: displayY, // Convertir en coordonnées relatives pour l'affichage
                        width: platform.width,
                        backgroundColor:
                          platform.type === "trampoline"
                            ? "#10B981"
                            : platform.type === "moving"
                            ? "#F59E0B"
                            : platform.type === "disappearing"
                            ? "#EF4444"
                            : "#667eea",
                        opacity:
                          platform.opacity !== undefined ? platform.opacity : 1, // Utiliser l'opacité si définie
                      },
                    ]}
                  />
                );
              })}

              {/* Joueur */}
              <Animated.View
                style={[
                  styles.player,
                  {
                    left: player.x,
                    top: player.y - cameraY,
                    transform: [
                      {
                        rotate: playerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.playerEmoji}>👾</Text>
              </Animated.View>

              {/* Contrôles */}
              <View style={styles.controls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPressIn={() => handleMove(-1)}
                  onPressOut={() => handleMove(0)}
                >
                  <Ionicons name="arrow-back" size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPressIn={() => handleMove(1)}
                  onPressOut={() => handleMove(0)}
                >
                  <Ionicons name="arrow-forward" size={32} color="white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  gameUI: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  scoreContainer: {
    alignItems: "flex-start",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  highScoreText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  debugText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
  },
  livesContainer: {
    flexDirection: "row",
    gap: 8,
  },
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  gameArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  gameTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gameSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  highScoreDisplay: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 20,
    fontWeight: "600",
  },
  gameContainer: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  platform: {
    position: "absolute",
    height: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  player: {
    position: "absolute",
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  playerEmoji: {
    fontSize: 40,
  },
  controls: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
});

export default DoodleJumpScreenFixed;
