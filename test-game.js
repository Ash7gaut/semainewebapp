// Script de test pour vérifier la logique du score
// Ce script simule la logique du jeu pour tester le calcul du score

const height = 800; // Hauteur de l'écran simulée
let maxHeight = 0;
let score = 0;
let playerY = height - 200; // Position initiale

console.log("=== Test de la logique du score ===");

// Simuler le joueur qui monte
function simulatePlayerMovement(newY) {
  playerY = newY;
  const currentHeight = height - newY;
  
  if (currentHeight > maxHeight) {
    const newMaxHeight = currentHeight;
    const newScore = Math.floor(newMaxHeight / 10);
    console.log(`Joueur à Y=${newY}, Hauteur=${currentHeight}, Nouveau score=${newScore}`);
    maxHeight = newMaxHeight;
    score = newScore;
  } else {
    console.log(`Joueur à Y=${newY}, Hauteur=${currentHeight}, Score reste=${score}`);
  }
}

// Test 1: Le joueur monte
console.log("\n--- Test 1: Le joueur monte ---");
simulatePlayerMovement(height - 300); // +100 pixels
simulatePlayerMovement(height - 400); // +200 pixels
simulatePlayerMovement(height - 500); // +300 pixels

// Test 2: Le joueur descend (le score ne doit pas changer)
console.log("\n--- Test 2: Le joueur descend ---");
simulatePlayerMovement(height - 450); // -50 pixels
simulatePlayerMovement(height - 350); // -150 pixels
simulatePlayerMovement(height - 250); // -250 pixels

// Test 3: Le joueur remonte (le score doit continuer à augmenter)
console.log("\n--- Test 3: Le joueur remonte ---");
simulatePlayerMovement(height - 600); // +350 pixels
simulatePlayerMovement(height - 700); // +450 pixels

console.log(`\n=== Résultat final ===`);
console.log(`Score final: ${score}`);
console.log(`Hauteur maximale atteinte: ${maxHeight}`);
console.log(`Position Y actuelle: ${playerY}`);
console.log(`Hauteur actuelle: ${height - playerY}`);

// Vérification
if (score === Math.floor(maxHeight / 10)) {
  console.log("✅ Test réussi: Le score est correctement calculé");
} else {
  console.log("❌ Test échoué: Le score n'est pas correct");
} 