// Script de test pour vérifier la connexion Supabase
// Exécutez ce script avec : node test-supabase.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Test de connexion Supabase...');
console.log('URL:', supabaseUrl ? '✅ Configurée' : '❌ Manquante');
console.log('Clé:', supabaseAnonKey ? '✅ Configurée' : '❌ Manquante');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Variables d\'environnement manquantes !');
  console.log('Créez un fichier .env avec :');
  console.log('SUPABASE_URL=votre_url_supabase');
  console.log('SUPABASE_ANON_KEY=votre_clé_anon');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔍 Test de connexion...');
    
    // Test simple de lecture
    const { data, error } = await supabase
      .from('leaderboard')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
      console.log('\nVérifiez que :');
      console.log('1. La table "leaderboard" existe');
      console.log('2. Les politiques RLS sont configurées');
      console.log('3. Les clés Supabase sont correctes');
    } else {
      console.log('✅ Connexion réussie !');
      console.log('La table leaderboard est accessible.');
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

testConnection(); 