import { supabase } from '../config/supabase';

export interface LeaderboardEntry {
  id?: string;
  username: string;
  score: number;
  created_at?: string;
  updated_at?: string;
}

// Créer une entrée leaderboard pour un nouvel utilisateur (score = 0)
export const createLeaderboardEntry = async (username: string): Promise<void> => {
  try {
    // Vérifier si l'utilisateur a déjà une entrée
    const { data: existingEntry, error: selectError } = await supabase
      .from('leaderboard')
      .select('id')
      .eq('username', username)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    if (!existingEntry) {
      // Créer une nouvelle entrée avec score 0
      const { error: insertError } = await supabase
        .from('leaderboard')
        .insert([{ username, score: 0 }]);

      if (insertError) throw insertError;
      console.log(`Entrée leaderboard créée pour ${username} avec score 0`);
    } else {
      console.log(`Entrée leaderboard existe déjà pour ${username}`);
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'entrée leaderboard:', error);
    throw error;
  }
};

// Mettre à jour le score d'un utilisateur (seulement si le nouveau score est plus élevé)
export const updateScore = async (username: string, score: number, forceUpdate: boolean = false): Promise<void> => {
  try {
    // Vérifier le score actuel
    const { data: currentEntry, error: selectError } = await supabase
      .from('leaderboard')
      .select('score')
      .eq('username', username)
      .single();

    if (selectError) {
      throw selectError;
    }

    if (!currentEntry) {
      throw new Error(`Aucune entrée leaderboard trouvée pour ${username}`);
    }

    // Mettre à jour si le nouveau score est plus élevé OU si forceUpdate est true
    if (score > currentEntry.score || forceUpdate) {
      const { error: updateError } = await supabase
        .from('leaderboard')
        .update({ 
          score: score,
          updated_at: new Date().toISOString()
        })
        .eq('username', username);

      if (updateError) {
        throw updateError;
      }
      
      if (score > currentEntry.score) {
        console.log(`🏆 Nouveau record ! Score mis à jour pour ${username}: ${score} (ancien: ${currentEntry.score})`);
      } else {
        console.log(`Score forcé mis à jour pour ${username}: ${score} (ancien: ${currentEntry.score})`);
      }
    } else {
      console.log(`Score non mis à jour pour ${username}: ${score} <= ${currentEntry.score}`);
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du score:', error);
    throw error;
  }
};

// Récupérer les meilleurs scores
export const getTopScores = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

// Récupérer le meilleur score d'un utilisateur
export const getUserBestScore = async (username: string): Promise<number> => {
  try {
    console.log(`=== DÉBOGAGE GET USER BEST SCORE ===`);
    console.log(`Recherche du score pour: ${username}`);
    
    const { data, error } = await supabase
      .from('leaderboard')
      .select('score')
      .eq('username', username)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération du score:`, error);
      if (error.code === 'PGRST116') {
        console.log(`Aucun score trouvé pour ${username}, retourne 0`);
        return 0; // Aucun score trouvé
      }
      throw error;
    }

    console.log(`Score trouvé en BDD:`, data);
    console.log(`Score retourné: ${data?.score || 0}`);
    console.log(`=== FIN DÉBOGAGE ===`);
    
    return data?.score || 0;
  } catch (error) {
    console.error('Erreur dans getUserBestScore:', error);
    throw error;
  }
}; 