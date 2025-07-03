import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
  Image,
  Modal,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Audio } from "expo-av";
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
  maxHeight: number; // Hauteur maximale atteinte pendant la partie
  isSmiling: boolean; // Pour l'animation du sourire
  trampolineHitCount: number; // Compteur pour alterner sourire/rotation
}

const DoodleJumpScreenFixed = () => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    score: 0,
    highScore: 0,
    lives: 1,
    level: 1,
    maxHeight: 0,
    isSmiling: false,
    trampolineHitCount: 0,
  });

  const [showControls, setShowControls] = useState(true);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const [backgroundMusic, setBackgroundMusic] = useState<Audio.Sound | null>(
    null
  );
  const [showCredits, setShowCredits] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Fonctions pour sauvegarder et charger le meilleur score
  const saveHighScore = async (score: number) => {
    try {
      await AsyncStorage.setItem("highScore", score.toString());
      console.log("Meilleur score sauvegardé:", score);
    } catch (error) {
      console.log("Erreur lors de la sauvegarde du meilleur score:", error);
    }
  };

  const loadHighScore = async () => {
    try {
      const savedScore = await AsyncStorage.getItem("highScore");
      console.log("Score chargé depuis le cache:", savedScore);
      if (savedScore) {
        const score = parseInt(savedScore);
        setGameState((prev) => ({ ...prev, highScore: score }));
        console.log("Meilleur score chargé:", score);
      }
    } catch (error) {
      console.log("Erreur lors du chargement du meilleur score:", error);
    }
  };

  // Fonction pour charger et jouer la musique de fond
  const loadBackgroundMusic = async () => {
    try {
      // Configurer l'audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/music.mp3"),
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.7,
          progressUpdateIntervalMillis: 1000,
        }
      );

      setBackgroundMusic(sound);
    } catch (error) {
      console.log("Erreur lors du chargement de la musique:", error);
    }
  };

  // Fonction pour arrêter la musique
  const stopBackgroundMusic = async () => {
    if (backgroundMusic) {
      await backgroundMusic.stopAsync();
      await backgroundMusic.unloadAsync();
      setBackgroundMusic(null);
    }
  };

  // Fonction pour mute/unmute la musique
  const toggleMute = async () => {
    if (backgroundMusic) {
      if (isMuted) {
        await backgroundMusic.setVolumeAsync(0.7);
        setIsMuted(false);
      } else {
        await backgroundMusic.setVolumeAsync(0);
        setIsMuted(true);
      }
    }
  };

  // Fonction pour jouer un effet de saut
  const playJumpSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/retrojump.mp3"),
        { volume: 0.2 }
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      // Ignorer l'erreur si le fichier n'existe pas
    }
  };

  // Fonction pour déclencher l'animation du sourire ou de la rotation
  const triggerTrampolineAnimation = () => {
    setGameState((prev) => {
      const newCount = prev.trampolineHitCount + 1;
      const isEven = newCount % 2 === 0; // Une fois sur deux

      if (isEven) {
        // Rotation de 360 degrés
        Animated.timing(playerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          playerAnim.setValue(0); // Reset pour la prochaine rotation
        });
      } else {
        // Sourire
        setTimeout(() => {
          setGameState((current) => ({ ...current, isSmiling: false }));
        }, 1000);
      }

      return {
        ...prev,
        isSmiling: !isEven, // Sourire seulement si impair
        trampolineHitCount: newCount,
      };
    });
  };

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
    // Charger le meilleur score au démarrage
    loadHighScore();
    // Charger et démarrer la musique de fond
    loadBackgroundMusic();

    // Nettoyer la musique quand le composant se démonte
    return () => {
      stopBackgroundMusic();
    };
  }, []);

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
          if (platform.type === "trampoline") {
            jumpMultiplier = 1.5;
            // Déclencher l'animation du sourire ou de la rotation pour les plateformes vertes
            triggerTrampolineAnimation();
          }

          // Marquer les plateformes qui disparaissent comme touchées
          if (platform.type === "disappearing") {
            markPlatformAsHit(platform.id);
          }

          // Jouer l'effet sonore de saut
          playJumpSound();

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

    // Mettre à jour le score basé sur la hauteur maximale atteinte
    const currentHeight = height - currentPlayer.y;
    setGameState((prev) => {
      if (currentHeight > prev.maxHeight) {
        // Nouvelle hauteur maximale atteinte
        const newMaxHeight = currentHeight;
        const newScore = Math.floor(newMaxHeight / 10);
        return {
          ...prev,
          maxHeight: newMaxHeight,
          score: newScore,
        };
      }
      return prev;
    });
  };

  const checkCollisions = () => {
    checkCollisionsWithPlatforms(platforms, player);
  };

  const loseLife = () => {
    gameOver();
  };

  const gameOver = () => {
    setGameState((prev) => {
      const currentScore = prev.score;
      const currentHighScore = prev.highScore;

      // Mettre à jour le meilleur score si nécessaire
      if (currentScore > currentHighScore) {
        const newHighScore = currentScore;
        console.log(
          "Nouveau meilleur score!",
          currentScore,
          ">",
          currentHighScore
        );
        // Sauvegarder le nouveau meilleur score
        saveHighScore(newHighScore);

        return {
          ...prev,
          isPlaying: false,
          isPaused: false,
          highScore: newHighScore,
        };
      }

      return {
        ...prev,
        isPlaying: false,
        isPaused: false,
      };
    });

    // Afficher l'alerte avec les valeurs actuelles
    setTimeout(() => {
      setGameState((prev) => {
        Alert.alert(
          "Game Over!",
          `Score: ${prev.score}\nHigh Score: ${prev.highScore}`,
          [
            { text: "Rejouer", onPress: startNewGame },
            {
              text: "Menu",
              onPress: () =>
                setGameState((current) => ({ ...current, isPlaying: false })),
            },
          ]
        );
        return prev;
      });
    }, 100);
  };

  const startNewGame = () => {
    setGameState((prev) => {
      console.log("Démarrage nouvelle partie avec high score:", prev.highScore);
      return {
        isPlaying: true,
        isPaused: false,
        score: 0,
        highScore: prev.highScore, // Utiliser la valeur actuelle du state
        lives: 1,
        level: 1,
        maxHeight: 0,
        isSmiling: false,
        trampolineHitCount: 0,
      };
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

    // Afficher les contrôles au début et les masquer avec une transition fluide
    setShowControls(true);
    setGameStartTime(Date.now());
    controlsOpacity.setValue(1);

    // Transition d'opacité de 1 à 0 en 2 secondes
    setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        setShowControls(false);
      });
    }, 1000);
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
      // Jouer l'effet sonore de saut
      playJumpSound();

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

          <View style={styles.gameControls}>
            <TouchableOpacity style={styles.soundButton} onPress={toggleMute}>
              <Ionicons
                name={isMuted ? "volume-mute" : "volume-high"}
                size={24}
                color="white"
              />
            </TouchableOpacity>

            {gameState.isPlaying && (
              <TouchableOpacity
                style={styles.pauseButton}
                onPress={togglePause}
              >
                <Ionicons
                  name={gameState.isPaused ? "play" : "pause"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Game Area */}
        <View style={styles.gameArea}>
          {!gameState.isPlaying ? (
            // Menu principal - Positionné au centre de l'écran
            <View style={styles.menuOverlay}>
              <View style={styles.menuContainer}>
                <Animatable.View animation="bounceIn" delay={200}>
                  <Text style={styles.gameTitle}>🚀 Richnou Jump</Text>
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

                <Animatable.View animation="fadeInUp" delay={1000}>
                  <TouchableOpacity
                    style={styles.creditsButton}
                    onPress={() => setShowCredits(true)}
                  >
                    <Text style={styles.creditsButtonText}>ℹ️ Crédits</Text>
                  </TouchableOpacity>
                </Animatable.View>
              </View>
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
                <Image
                  source={
                    gameState.isSmiling
                      ? require("../../assets/richnou_sourire3.png")
                      : require("../../assets/richnou.png")
                  }
                  style={styles.playerImage}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Contrôles tactiles invisibles */}
              <View style={styles.touchControls}>
                {/* Zone gauche (50% de l'écran) */}
                <TouchableOpacity
                  style={styles.touchZone}
                  onPressIn={() => handleMove(-1)}
                  onPressOut={() => handleMove(0)}
                  activeOpacity={0.1}
                />

                {/* Zone droite (50% de l'écran) */}
                <TouchableOpacity
                  style={styles.touchZone}
                  onPressIn={() => handleMove(1)}
                  onPressOut={() => handleMove(0)}
                  activeOpacity={0.1}
                />
              </View>

              {/* Contrôles visuels avec transition d'opacité */}
              {showControls && (
                <Animated.View
                  style={[styles.controls, { opacity: controlsOpacity }]}
                >
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPressIn={() => handleMove(-1)}
                    onPressOut={() => handleMove(0)}
                  >
                    <Ionicons name="arrow-back" size={48} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.controlButton}
                    onPressIn={() => handleMove(1)}
                    onPressOut={() => handleMove(0)}
                  >
                    <Ionicons name="arrow-forward" size={48} color="white" />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Modal des crédits */}
      <Modal
        visible={showCredits}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCredits(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.creditsModal}>
            <Text style={styles.creditsTitle}>🎵 Crédits</Text>

            <View style={styles.creditSection}>
              <Text style={styles.creditSectionTitle}>Musique de fond</Text>
              <Text style={styles.creditText}>
                Musique fournie par OpenGameArt.org
              </Text>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => Linking.openURL("http://opengameart.org")}
              >
                <Text style={styles.linkText}>Visiter OpenGameArt.org</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.creditSection}>
              <Text style={styles.creditSectionTitle}>Développement</Text>
              <Text style={styles.creditText}>
                Richnou Jump - Projet React Native
              </Text>
              <Text style={styles.creditText}>
                Développé avec ❤️ en TypeScript
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCredits(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  gameControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  soundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
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
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
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
    marginBottom: 50,
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
  creditsButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  creditsButtonText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
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
  playerImage: {
    width: 70,
    height: 70,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  touchControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  touchZone: {
    flex: 1, // Chaque zone prend 50% de l'écran
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  creditsModal: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 30,
    margin: 20,
    maxWidth: 350,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  creditsTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  creditSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  creditSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#555",
    marginBottom: 8,
  },
  creditText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
  linkButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  closeButton: {
    backgroundColor: "#f093fb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
});

export default DoodleJumpScreenFixed;
