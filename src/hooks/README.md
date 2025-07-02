# Hook useInfinitePlatforms

Ce hook personnalisé gère la génération infinie de plateformes pour les jeux de type Doodle Jump en React Native.

## Fonctionnalités

- ✅ Génération automatique de plateformes au-dessus du joueur
- ✅ Suppression automatique des plateformes en dessous du joueur
- ✅ Configuration flexible (espacement, largeur, marges, etc.)
- ✅ Support des plateformes mobiles
- ✅ Gestion des différents types de plateformes
- ✅ Optimisation des performances avec nettoyage automatique

## Utilisation de base

```typescript
import { useInfinitePlatforms } from '../hooks/useInfinitePlatforms';

const MyGame = () => {
  const {
    platforms,
    updatePlatforms,
    initializePlatforms,
    reset,
  } = useInfinitePlatforms();

  // Dans votre boucle de jeu
  const updateGame = () => {
    // Mettre à jour les plateformes avec la position Y du joueur
    updatePlatforms(playerY);
  };

  // Initialiser les plateformes au début du jeu
  const startGame = () => {
    initializePlatforms(startY, 20); // 20 plateformes initiales
  };

  return (
    // Rendu des plateformes
    {platforms.map(platform => (
      <Platform key={platform.id} {...platform} />
    ))}
  );
};
```

## Configuration avancée

```typescript
const {
  platforms,
  updatePlatforms,
  initializePlatforms,
  reset,
} = useInfinitePlatforms({
  config: {
    SPACING: 80, // Espacement vertical entre les plateformes
    MIN_WIDTH: 80, // Largeur minimale
    MAX_WIDTH: 120, // Largeur maximale
    MARGIN: 20, // Marge par rapport aux bords
    GENERATION_BUFFER: 3, // Plateformes générées en avance
    CLEANUP_BUFFER: height * 2, // Distance de nettoyage
  },
  generatePlatformType: () => {
    // Logique personnalisée pour choisir le type de plateforme
    const types = ['normal', 'moving', 'trampoline'];
    return types[Math.floor(Math.random() * types.length)];
  },
  onPlatformGenerated: (platform) => {
    // Callback appelé quand une nouvelle plateforme est générée
    console.log('Nouvelle plateforme:', platform);
  },
});
```

## API

### Options du hook

| Propriété | Type | Description | Défaut |
|-----------|------|-------------|---------|
| `config` | `Partial<PlatformConfig>` | Configuration des plateformes | Configuration par défaut |
| `generatePlatformType` | `() => Platform['type']` | Fonction pour choisir le type | Types aléatoires |
| `onPlatformGenerated` | `(platform: Platform) => void` | Callback de génération | - |

### Valeurs retournées

| Propriété | Type | Description |
|-----------|------|-------------|
| `platforms` | `Platform[]` | Liste des plateformes actives |
| `updatePlatforms` | `(playerY: number, updateMovingPlatforms?) => void` | Mettre à jour les plateformes |
| `initializePlatforms` | `(startY: number, count?: number) => void` | Initialiser les plateformes |
| `reset` | `() => void` | Réinitialiser le système |
| `generateRandomPlatform` | `(y: number, id: number) => Platform` | Générer une plateforme |
| `config` | `PlatformConfig` | Configuration actuelle |

### Interface Platform

```typescript
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
```

## Exemples d'utilisation

### Avec des plateformes mobiles

```typescript
const updateGame = () => {
  updatePlatforms(playerY, (currentPlatforms) => {
    // Mettre à jour les plateformes mobiles
    return currentPlatforms.map(platform => {
      if (platform.type === 'moving' && platform.movingDirection) {
        const newX = platform.x + platform.movingSpeed * platform.movingDirection;
        
        // Rebondir sur les bords
        if (newX <= 0 || newX + platform.width >= width) {
          platform.movingDirection = -platform.movingDirection;
        }
        
        return {
          ...platform,
          x: Math.max(0, Math.min(width - platform.width, newX)),
        };
      }
      return platform;
    });
  });
};
```

### Configuration pour différents niveaux

```typescript
const getPlatformConfig = (level: number) => ({
  SPACING: 80 - level * 2, // Espacement plus serré aux niveaux élevés
  MIN_WIDTH: Math.max(60, 80 - level * 3), // Plateformes plus petites
  MAX_WIDTH: Math.max(80, 120 - level * 5),
  GENERATION_BUFFER: 3 + Math.floor(level / 5), // Plus de plateformes en avance
});

const { platforms, updatePlatforms } = useInfinitePlatforms({
  config: getPlatformConfig(currentLevel),
});
```

## Performance

Le hook est optimisé pour :
- Nettoyer automatiquement les plateformes hors écran
- Limiter le nombre de plateformes actives
- Utiliser des références pour éviter les re-rendus inutiles
- Générer les plateformes de manière efficace

## Conseils d'utilisation

1. **Appelez `updatePlatforms` dans votre boucle de jeu principale**
2. **Utilisez `initializePlatforms` au début de chaque partie**
3. **Appelez `reset` quand vous voulez recommencer**
4. **Ajustez la configuration selon la difficulté souhaitée**
5. **Utilisez le callback `onPlatformGenerated` pour des effets spéciaux** 