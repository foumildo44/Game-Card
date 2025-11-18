// src/QuestManager.js
// ✅ AJOUT : 5 nouvelles quêtes + remplacement des alertes

class QuestManager {
  constructor(player) {
    this.player = player;
    this.uiManager = null; // Sera défini par GameManager
    
    // Définition de toutes les quêtes du jeu
    this.questDatabase = [
      {
        id: 'q1_wins_1',
        title: 'Premières Victoires',
        description: 'Gagner 3 combats en arène.',
        type: 'winBattles', // Le type d'événement à écouter
        target: 3, // Le nombre requis
        reward: { gold: 100, gems: 5 }
      },
      {
        id: 'q2_play_1',
        title: 'Maître des Cartes',
        description: 'Jouer 50 cartes.',
        type: 'playCards',
        target: 50,
        reward: { gold: 50 }
      },
      {
        id: 'q3_upgrade_1',
        title: 'Amélioration',
        description: 'Améliorer une carte.',
        type: 'upgradeCards',
        target: 1,
        reward: { gems: 10 }
      },
      // ✅ NOUVELLES QUÊTES
      {
        id: 'q4_wins_2',
        title: 'Conquérant',
        description: 'Gagner 10 combats en arène.',
        type: 'winBattles',
        target: 10,
        reward: { gold: 250, gems: 20 }
      },
      {
        id: 'q5_play_2',
        title: 'Stratège',
        description: 'Jouer 200 cartes.',
        type: 'playCards',
        target: 200,
        reward: { gold: 150 }
      },
      {
        id: 'q6_upgrade_2',
        title: 'Forgeron',
        description: 'Améliorer 5 cartes.',
        type: 'upgradeCards',
        target: 5,
        reward: { gold: 200, gems: 10 }
      },
      {
        id: 'q7_shop_packs',
        title: 'Collectionneur',
        description: 'Ouvrir 3 packs de cartes.',
        type: 'openPacks',
        target: 3,
        reward: { gold: 50 }
      },
      {
        id: 'q8_shop_gold',
        title: 'Investisseur',
        description: 'Dépenser 1000 Or (Boutique ou améliorations).',
        type: 'spendGold',
        target: 1000,
        reward: { gems: 10 }
      },
    ];
  }
  
  setUIManager(uiManager) {
      this.uiManager = uiManager;
  }

  /**
   * Retourne toutes les quêtes avec leur état de progression.
   */
  getAllQuestsStatus() {
    return this.questDatabase.map(quest => {
      const progress = this.player.getQuestProgress(quest.id);
      const isCompleted = this.player.isQuestCompleted(quest.id);
      const isClaimable = progress >= quest.target && !isCompleted;
      
      return {
        ...quest,
        progress: progress,
        isCompleted: isCompleted,
        isClaimable: isClaimable,
      };
    });
  }

  /**
   * Appelé pour signaler un événement.
   */
  progress(type, amount) {
    const relevantQuests = this.questDatabase.filter(q => q.type === type);
    
    for (const quest of relevantQuests) {
      if (this.player.isQuestCompleted(quest.id)) continue;
      
      const currentProgress = this.player.getQuestProgress(quest.id);
      if (currentProgress < quest.target) {
        const newProgress = Math.min(currentProgress + amount, quest.target);
        this.player.setQuestProgress(quest.id, newProgress);
        console.log(`Progrès de quête [${quest.title}]: ${newProgress}/${quest.target}`);
      }
    }
  }

  /**
   * Tente de réclamer la récompense d'une quête.
   */
  claimReward(questId) {
    const quest = this.questDatabase.find(q => q.id === questId);
    if (!quest) return false;
    
    const progress = this.player.getQuestProgress(quest.id);
    if (progress < quest.target || this.player.isQuestCompleted(quest.id)) {
      console.log("Impossible de réclamer : quête non terminée ou déjà réclamée.");
      return false;
    }
    
    // Préparer le HTML pour le modal
    let rewardHtml = '<div class="modal-reward-list">';
    
    // Donner les récompenses
    if (quest.reward.gold) {
      this.player.addGold(quest.reward.gold);
      rewardHtml += `<div class="modal-reward-item"><span class="reward-text">🪙 +${quest.reward.gold} Or</span></div>`;
    }
    if (quest.reward.gems) {
      this.player.addGems(quest.reward.gems);
      rewardHtml += `<div class="modal-reward-item"><span class="reward-text">💎 +${quest.reward.gems} Gemmes</span></div>`;
    }
    
    rewardHtml += '</div>';
    
    // ✅ MODIFIÉ : Affiche le modal au lieu de l'alerte
    if (this.uiManager) {
        this.uiManager.showModal("Récompense Réclamée !", rewardHtml);
    } else {
        alert("Récompense réclamée ! (Mais l'UI Manager n'est pas lié)");
    }
    
    // Marquer comme complétée
    this.player.completeQuest(questId);
    return true;
  }
}

export default QuestManager;