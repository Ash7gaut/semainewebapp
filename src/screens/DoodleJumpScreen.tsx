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

const { width, height } = Dimensions.get("window");

interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  type: "normal" | "moving" | "disappearing" | "trampoline";
  movingDirection?: number;
  movingSpeed?: number;
  disappearing?: boolean;
}

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  highScore: number;
  lives: number;
  level: number;
}

const DoodleJumpScreen = () => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    score: 0,
    highScore: 0,
    lives: 3,
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

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [powerUps, setPowerUps] = useState<any[]>([]);
  const [enemies, setEnemies] = useState<any[]>([]);
  const platformIdRef = useRef(0);
  const lastGeneratedYRef = useRef(0);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const gravity = 0.8;
  const jumpForce = -15;
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

      return {
        ...prevPlayer,
        y: newY,
        x: wrappedX,
        velocityY: newVelocityY,
      };
    });

    // Update platforms and generate new ones
    setPlatforms((prevPlatforms) => {
      let updatedPlatforms = prevPlatforms.map((platform) => {
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

      // Définir les limites du viewport
      const viewportTop = cameraY;
      const viewportBottom = cameraY + height;
      const viewportTopBuffer = viewportTop - 200; // Zone de génération en haut
      const viewportBottomBuffer = viewportBottom + 100; // Zone de suppression en bas

      // Supprimer les plateformes qui sortent du viewport par le bas
      updatedPlatforms = updatedPlatforms.filter(
        (platform) => platform.y < viewportBottomBuffer
      );

      // Générer de nouvelles plateformes seulement si nécessaire
      if (updatedPlatforms.length > 0) {
        const highestPlatform = Math.min(...updatedPlatforms.map((p) => p.y));

        // Générer des plateformes seulement si on a besoin d'en ajouter
        if (
          highestPlatform > viewportTopBuffer &&
          highestPlatform < lastGeneratedYRef.current - 100
        ) {
          // Calculer combien de plateformes générer
          const platformsNeeded = Math.min(
            Math.ceil((highestPlatform - viewportTopBuffer) / 80) + 2,
            6 // Maximum 6 plateformes à la fois
          );

          for (let i = 0; i < platformsNeeded; i++) {
            const newPlatform = generateRandomPlatform(
              highestPlatform - 80 - i * 80,
              platformIdRef.current + i
            );
            updatedPlatforms.push(newPlatform);
          }
          platformIdRef.current += platformsNeeded;
          lastGeneratedYRef.current = highestPlatform;
        }
      }

      // Check collisions with updated platforms
      checkCollisionsWithPlatforms(updatedPlatforms);

      return updatedPlatforms;
    });
  };

  const checkCollisions = () => {
    setPlayer((prevPlayer) => {
      // Get current platforms state
      const currentPlatforms = platforms;

      // Check platform collisions
      const onPlatform = currentPlatforms.some((platform) => {
        return (
          prevPlayer.y + prevPlayer.height >= platform.y &&
          prevPlayer.y + prevPlayer.height <= platform.y + 20 &&
          prevPlayer.x + prevPlayer.width > platform.x &&
          prevPlayer.x < platform.x + platform.width &&
          prevPlayer.velocityY >= 0
        );
      });

      if (onPlatform) {
        // Find the platform we're on
        const platform = currentPlatforms.find((p) => {
          return (
            prevPlayer.y + prevPlayer.height >= p.y &&
            prevPlayer.y + prevPlayer.height <= p.y + 20 &&
            prevPlayer.x + prevPlayer.width > p.x &&
            prevPlayer.x < p.x + p.width &&
            prevPlayer.velocityY >= 0
          );
        });

        if (platform) {
          let jumpMultiplier = 1;
          if (platform.type === "trampoline") jumpMultiplier = 1.5;

          return {
            ...prevPlayer,
            y: platform.y - prevPlayer.height,
            velocityY: jumpForce * jumpMultiplier,
          };
        }
      }

      // Check if player fell off screen (more strict)
      if (prevPlayer.y > height + 50) {
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

    // Update score based on height (relative to caméra)
    const currentHeight = cameraY + height - player.y;
    if (currentHeight > gameState.score) {
      setGameState((prev) => ({
        ...prev,
        score: Math.floor(currentHeight / 10),
      }));
    }
  };

  const checkCollisionsWithPlatforms = (currentPlatforms: Platform[]) => {
    setPlayer((prevPlayer) => {
      // Check platform collisions
      const onPlatform = currentPlatforms.some((platform) => {
        return (
          prevPlayer.y + prevPlayer.height >= platform.y &&
          prevPlayer.y + prevPlayer.height <= platform.y + 20 &&
          prevPlayer.x + prevPlayer.width > platform.x &&
          prevPlayer.x < platform.x + platform.width &&
          prevPlayer.velocityY >= 0
        );
      });

      if (onPlatform) {
        // Find the platform we're on
        const platform = currentPlatforms.find((p) => {
          return (
            prevPlayer.y + prevPlayer.height >= p.y &&
            prevPlayer.y + prevPlayer.height <= p.y + 20 &&
            prevPlayer.x + prevPlayer.width > p.x &&
            prevPlayer.x < p.x + p.width &&
            prevPlayer.velocityY >= 0
          );
        });

        if (platform) {
          let jumpMultiplier = 1;
          if (platform.type === "trampoline") jumpMultiplier = 1.5;

          return {
            ...prevPlayer,
            y: platform.y - prevPlayer.height,
            velocityY: jumpForce * jumpMultiplier,
          };
        }
      }

      // Check if player fell off screen (more strict)
      if (prevPlayer.y > height + 50) {
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

    // Update score based on height (relative to caméra)
    const currentHeight = cameraY + height - player.y;
    if (currentHeight > gameState.score) {
      setGameState((prev) => ({
        ...prev,
        score: Math.floor(currentHeight / 10),
      }));
    }
  };

  const loseLife = () => {
    setGameState((prev) => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) {
        gameOver();
        return prev;
      }
      return { ...prev, lives: newLives };
    });
  };

  const gameOver = () => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
    }));

    // Update high score
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
      lives: 3,
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

    platformIdRef.current = 25; // Réinitialiser après les plateformes initiales
    lastGeneratedYRef.current = height - 200; // Initialiser la position de dernière génération
    generateInitialPlatforms();
  };

  const generateInitialPlatforms = () => {
    const initialPlatforms: Platform[] = [];

    // Starting platform
    initialPlatforms.push({
      id: 0,
      x: width / 2 - 50,
      y: height - 150,
      width: 100,
      type: "normal",
    });

    // Generate platforms up the screen
    for (let i = 1; i < 25; i++) {
      const platform = generateRandomPlatform(height - 200 - i * 80, i); // Espacement plus naturel
      initialPlatforms.push(platform);
    }
    platformIdRef.current = 25; // Mettre à jour le compteur après la génération initiale

    setPlatforms(initialPlatforms);
  };

  const generateRandomPlatform = (y: number, currentId: number): Platform => {
    const types: Platform["type"][] = [
      "normal",
      "normal",
      "normal",
      "normal", // Encore plus de plateformes normales
      "moving", // Moins de plateformes mobiles
      "disappearing",
      "trampoline",
    ];
    const type = types[Math.floor(Math.random() * types.length)];

    const platform: Platform = {
      id: currentId,
      x: 20 + Math.random() * (width - 140), // Éviter complètement les bords
      y,
      width: 100 + Math.random() * 80, // Largeur plus raisonnable
      type,
    };

    if (type === "moving") {
      platform.movingDirection = Math.random() > 0.5 ? 1 : -1;
      platform.movingSpeed = 0.05 + Math.random() * 0.1; // Vitesse très lente et plus stable
    }

    return platform;
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
          </View>

          <View style={styles.livesContainer}>
            {[...Array(gameState.lives)].map((_, i) => (
              <Ionicons key={i} name="heart" size={24} color="#EF4444" />
            ))}
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
              {platforms.map((platform) => (
                <View
                  key={platform.id}
                  style={[
                    styles.platform,
                    {
                      left: platform.x,
                      top: platform.y - cameraY,
                      width: platform.width,
                      backgroundColor:
                        platform.type === "trampoline"
                          ? "#10B981"
                          : platform.type === "moving"
                          ? "#F59E0B"
                          : platform.type === "disappearing"
                          ? "#EF4444"
                          : "#667eea",
                    },
                  ]}
                />
              ))}

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

export default DoodleJumpScreen;
