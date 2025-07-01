# 💰 Simulateur d'Économies

Une application mobile React Native pour simuler vos économies potentielles jusqu'à un événement futur.

## 🎯 Fonctionnalités

### Onglet "Événements"
- ✅ Ajouter des événements futurs (nom + date)
- ✅ Voir le nombre de jours restants
- ✅ Supprimer des événements
- ✅ Gestion des événements passés

### Onglet "Dépenses Simulées"
- ✅ Créer des dépenses régulières (montant + fréquence)
- ✅ Lier une dépense à un événement
- ✅ Calculer les économies potentielles
- ✅ Visualiser le montant total économisé

## 🏗️ Architecture

```
src/
├── types/           # Définitions TypeScript
├── utils/           # Utilitaires (stockage, calculs)
├── screens/         # Écrans de l'application
└── components/      # Composants réutilisables (futurs)
```

### Technologies utilisées
- **React Native** avec Expo
- **TypeScript** pour la sécurité des types
- **AsyncStorage** pour la persistance locale
- **React Navigation** pour la navigation par onglets
- **@expo/vector-icons** pour les icônes

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
   - Cliquez sur "+ Ajouter"
   - Entrez le nom et la date (format JJ/MM/AAAA)

2. **Simuler une dépense :**
   - Allez dans l'onglet "Dépenses Simulées"
   - Cliquez sur "+ Ajouter"
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

- Design moderne avec Material Design
- Navigation par onglets intuitive
- Modales pour les formulaires
- Codes couleur pour différencier les états
- Responsive sur toutes les tailles d'écran

## 🔮 Améliorations Futures

- [ ] Date picker natif
- [ ] Graphiques des économies
- [ ] Notifications de rappel
- [ ] Export des données
- [ ] Thème sombre
- [ ] Catégories de dépenses
- [ ] Objectifs d'économies 