# 💰 Simulateur d'Économies - React Native

Une application mobile React Native avec Expo pour simuler vos économies potentielles jusqu'à un événement futur.

## 🎯 Fonctionnalités

### Onglet "Événements"
- ✅ Ajouter des événements futurs (nom + date)
- ✅ Formulaire multi-étapes avec animations
- ✅ Validation en temps réel
- ✅ Suggestions intelligentes
- ✅ Voir le nombre de jours restants
- ✅ Supprimer des événements
- ✅ Gestion des événements passés

### Onglet "Dépenses Simulées"
- ✅ Créer des dépenses régulières (montant + fréquence)
- ✅ Lier une dépense à un événement
- ✅ Calculer les économies potentielles
- ✅ Visualiser le montant total économisé
- ✅ Interface moderne avec animations

## 🏗️ Architecture

```
src/
├── types/           # Définitions TypeScript
├── utils/           # Utilitaires (stockage, calculs)
└── screens/         # Écrans de l'application
```

### Technologies utilisées
- **React Native** avec Expo
- **TypeScript** pour la sécurité des types
- **@react-navigation** pour la navigation par onglets
- **AsyncStorage** pour la persistance locale
- **@expo/vector-icons** pour les icônes
- **react-native-modal** pour les modales
- **react-native-animatable** pour les animations
- **react-native-linear-gradient** pour les dégradés

## 🚀 Installation & Démarrage

1. **Installation des dépendances :**
   ```bash
   npm install
   ```

2. **Démarrage de l'application :**
   ```bash
   npm start
   ```

3. **Lancement sur un appareil :**
   - **iOS :** `npm run ios`
   - **Android :** `npm run android`
   - **Web :** `npm run web`

## 📱 Utilisation

1. **Créer un événement :**
   - Allez dans l'onglet "Événements"
   - Cliquez sur "Ajouter"
   - Suivez les étapes du formulaire animé
   - Choisissez une date future

2. **Simuler une dépense :**
   - Allez dans l'onglet "Dépenses Simulées"
   - Cliquez sur "Ajouter"
   - Remplissez la description, le montant et la fréquence
   - Sélectionnez l'événement cible

3. **Voir vos économies :**
   - Les économies potentielles s'affichent automatiquement
   - Le calcul se met à jour en temps réel selon les jours restants

## 💾 Stockage des Données

L'application utilise `AsyncStorage` pour sauvegarder localement :
- Les événements créés
- Les dépenses simulées
- Aucun serveur requis

## 🎨 Interface

- Design moderne avec dégradés et animations
- Navigation par onglets intuitive
- Modales avec animations fluides
- Validation en temps réel
- Codes couleur pour différencier les états
- Responsive sur toutes les tailles d'écran

## 🔮 Améliorations Futures

- [ ] Notifications de rappel
- [ ] Graphiques des économies
- [ ] Export des données
- [ ] Thème sombre
- [ ] Catégories de dépenses
- [ ] Objectifs d'économies
- [ ] Synchronisation cloud
- [ ] Widgets d'accueil

## 📦 Dépendances principales

```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "@react-native-async-storage/async-storage": "^1.x",
  "react-native-modal": "^13.x",
  "react-native-animatable": "^1.x",
  "react-native-linear-gradient": "^2.x",
  "@expo/vector-icons": "^13.x"
}
```

## 🛠️ Développement

L'application est construite avec :
- **Expo SDK 49+**
- **React Native 0.72+**
- **TypeScript 5.0+**

## 📄 Licence

Ce projet est sous licence MIT. 