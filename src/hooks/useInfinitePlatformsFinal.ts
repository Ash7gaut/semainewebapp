import { useState, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  type: "normal" | "moving" | "disappearing" | "trampoline";
  movingDirection?: number;
  movingSpeed?: number;
  disappearing?: boolean;
}

export const useInfinitePlatformsFinal = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const idCounterRef = useRef(0);

  // Générer une plateforme aléatoire avec ID unique
  const generatePlatform = useCallback((y: number): Platform => {
    const types: Platform['type'][] = ['normal', 'normal', 'normal', 'normal', 'moving', 'disappearing', 'trampoline'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const platformWidth = 80 + Math.random() * 40; // 80-120
    const x = 20 + Math.random() * (width - platformWidth - 40);

    const platform: Platform = {
      id: `platform_${Date.now()}_${idCounterRef.current++}`,
      x,
      y,
      width: platformWidth,
      type,
    };

    if (type === "moving") {
      platform.movingDirection = Math.random() > 0.5 ? 1 : -1;
      platform.movingSpeed = 0.05 + Math.random() * 0.1;
    }

    return platform;
  }, []);

  // Fonction de génération infinie simplifiée
  const updatePlatforms = useCallback((playerY: number, updateMovingPlatforms?: (platforms: Platform[]) => Platform[]) => {
    setPlatforms(prevPlatforms => {
      let currentPlatforms = [...prevPlatforms];

      // 1. Mettre à jour les plateformes mobiles
      if (updateMovingPlatforms) {
        currentPlatforms = updateMovingPlatforms(currentPlatforms);
      }

      // 2. Supprimer les plateformes complètement en dessous de l'écran
      const cleanupThreshold = playerY - height; // Seuil de nettoyage plus conservateur
      currentPlatforms = currentPlatforms.filter(platform => platform.y > cleanupThreshold);

      // 3. Trouver la plateforme la plus haute
      const highestY = currentPlatforms.length > 0 
        ? Math.min(...currentPlatforms.map(p => p.y))
        : playerY;

      // 4. Générer des plateformes au-dessus du joueur
      const spacing = 80;
      const newPlatforms: Platform[] = [];
      
      let currentY = highestY - spacing;
      const targetY = playerY - height * 1.5; // Générer jusqu'à 1.5x la hauteur au-dessus
      
      while (currentY > targetY) {
        // Vérifier si une plateforme existe déjà à cette position
        const existing = currentPlatforms.find(p => Math.abs(p.y - currentY) < spacing / 2);
        
        if (!existing) {
          newPlatforms.push(generatePlatform(currentY));
        }
        
        currentY -= spacing;
      }

      return [...currentPlatforms, ...newPlatforms];
    });
  }, [generatePlatform]);

  // Initialiser
  const initializePlatforms = useCallback((startY: number, count: number = 20) => {
    const initialPlatforms: Platform[] = [];
    
    // Plateforme de départ
    initialPlatforms.push({
      id: `platform_start_${Date.now()}`,
      x: width / 2 - 50,
      y: startY + 50,
      width: 100,
      type: "normal",
    });

    // Générer les plateformes initiales
    for (let i = 1; i < count; i++) {
      initialPlatforms.push(generatePlatform(startY - i * 80));
    }

    idCounterRef.current = count;
    setPlatforms(initialPlatforms);
  }, [generatePlatform]);

  // Reset
  const reset = useCallback(() => {
    setPlatforms([]);
    idCounterRef.current = 0;
  }, []);

  // Debug
  const getDebugInfo = useCallback(() => {
    if (platforms.length === 0) return { count: 0, minY: 0, maxY: 0 };
    
    const minY = Math.min(...platforms.map(p => p.y));
    const maxY = Math.max(...platforms.map(p => p.y));
    
    return {
      count: platforms.length,
      minY,
      maxY,
      range: maxY - minY,
      highestPlatformY: minY,
    };
  }, [platforms]);

  return {
    platforms,
    updatePlatforms,
    initializePlatforms,
    reset,
    getDebugInfo,
  };
}; 