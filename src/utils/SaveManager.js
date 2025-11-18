// src/utils/SaveManager.js
// ✅ VERSION COMPLÈTE avec support du flag tutoriel

const SAVE_KEY = 'darkFantasyArenaSave';

class SaveManager {
  /**
   * Sauvegarde l'état complet du joueur.
   */
  static save(player) {
    try {
      const saveData = {
        name: player.name,
        level: player.level,
        xp: player.xp,
        xpToNextLevel: player.xpToNextLevel,
        gold: player.gold,
        gems: player.gems,
        collection: player.collection,
        decks: player.decks,
        activeDeckIndex: player.activeDeckIndex,
        questProgress: player.questProgress,
        completedQuests: player.completedQuests,
        battleHistory: player.battleHistory,
        hasCompletedTutorial: player.hasCompletedTutorial, // ✅ NOUVEAU
      };
      
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      console.log("✅ Jeu sauvegardé ! Tutoriel:", saveData.hasCompletedTutorial);
    } catch (e) {
      console.error("❌ Erreur lors de la sauvegarde :", e);
    }
  }

  /**
   * Charge les données du joueur depuis localStorage.
   */
  static load() {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      if (savedData) {
        const data = JSON.parse(savedData);
        console.log("✅ Sauvegarde trouvée, chargement...");
        console.log("📊 Tutoriel complété:", data.hasCompletedTutorial);
        return data;
      }
      console.log("ℹ️ Aucune sauvegarde trouvée.");
      return null;
    } catch (e) {
      console.error("❌ Erreur lors du chargement de la sauvegarde :", e);
      return null;
    }
  }

  /**
   * Efface la sauvegarde (pour réinitialiser).
   */
  static deleteSave() {
    localStorage.removeItem(SAVE_KEY);
    console.log("🗑️ Sauvegarde effacée.");
  }
}

export default SaveManager;