// src/models/Player.js
// ✅ VERSION AVEC SYSTÈME DE TROPHÉES

import SaveManager from "../utils/SaveManager.js";

class Player {
  constructor(cardDatabase) {
    this.cardDatabase = cardDatabase;

    // Valeurs par défaut
    this.name = "Le Héros";
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 100;
    this.gold = 500;
    this.gems = 20;
    this.collection = {};
    
    // ✅ NOUVEAU : Système de trophées
    this.trophies = 0;
    this.claimedTrophyRewards = []; // IDs des récompenses déjà réclamées
    
    this.hasCompletedTutorial = false;
    
    this.decks = [
        new Array(6).fill(null),
        new Array(6).fill(null),
        new Array(6).fill(null)
    ];
    this.activeDeckIndex = 0;

    this.questProgress = {};
    this.completedQuests = [];
    this.battleHistory = [];
  }

  loadData(data) {
    this.name = data.name || this.name;
    this.level = data.level || this.level;
    this.xp = data.xp || this.xp;
    this.xpToNextLevel = data.xpToNextLevel || this.xpToNextLevel;
    this.gold = data.gold || this.gold;
    this.gems = data.gems || this.gems;
    this.collection = data.collection || this.collection;
    this.decks = data.decks || this.decks;
    this.activeDeckIndex = data.activeDeckIndex || this.activeDeckIndex;
    this.questProgress = data.questProgress || this.questProgress;
    this.completedQuests = data.completedQuests || this.completedQuests;
    this.battleHistory = data.battleHistory || this.battleHistory;
    this.hasCompletedTutorial = data.hasCompletedTutorial || false;
    
    // ✅ NOUVEAU : Charge les trophées
    this.trophies = data.trophies || 0;
    this.claimedTrophyRewards = data.claimedTrophyRewards || [];

    this.decks = this.decks.map(deck => {
        if (!deck || !Array.isArray(deck)) return new Array(6).fill(null);
        if (deck.length > 6) return deck.slice(0, 6);
        if (deck.length < 6) return deck.concat(new Array(6 - deck.length).fill(null));
        return deck;
    });
    
    console.log("Données du joueur chargées. Trophées:", this.trophies);
  }

  initializeStarterCollection() {
    const starterDeckIDs = this.cardDatabase.createStarterDeck();
    
    for (let i = 0; i < starterDeckIDs.length; i++) {
        this.decks[0][i] = starterDeckIDs[i];
    }

    starterDeckIDs.forEach((cardId) => {
      this.addCardToCollection(cardId, 1);
    });
    
    this.decks[1] = [...this.decks[0]];
    this.decks[2] = [...this.decks[0]];

    this.addCardToCollection('card_c_004', 1);
    this.addCardToCollection('card_b_006', 1);
    this.addCardToCollection('card_r_002', 1);
    this.addCardToCollection('card_l_001', 1);
    this.addCardToCollection('card_m_001', 1);
    
    console.log("Nouvelle collection de départ initialisée.");
  }
  
  completeTutorial() {
    this.hasCompletedTutorial = true;
    this.save();
    console.log("✅ Tutoriel marqué comme complété et sauvegardé");
  }
  
  // ✅ NOUVEAU : Ajoute des trophées (peut être négatif)
  addTrophies(amount) {
    this.trophies += amount;
    if (this.trophies < 0) this.trophies = 0; // Ne peut pas être négatif
    console.log(`🏆 Trophées: ${amount > 0 ? '+' : ''}${amount} (Total: ${this.trophies})`);
  }
  
  // ✅ NOUVEAU : Récupère le rang actuel
  getCurrentRank() {
    if (this.trophies >= 2000) return { name: 'Légende', icon: '👑', color: '#f1c40f' };
    if (this.trophies >= 1500) return { name: 'Champion', icon: '💎', color: '#9b59b6' };
    if (this.trophies >= 1000) return { name: 'Expert', icon: '⚔️', color: '#e74c3c' };
    if (this.trophies >= 500) return { name: 'Vétéran', icon: '🛡️', color: '#3498db' };
    return { name: 'Novice', icon: '🎖️', color: '#95a5a6' };
  }
  
  // ✅ NOUVEAU : Vérifie si une récompense a été réclamée
  hasClaimedReward(milestoneId) {
    return this.claimedTrophyRewards.includes(milestoneId);
  }
  
  // ✅ NOUVEAU : Réclame une récompense de trophées
  claimTrophyReward(milestoneId) {
    if (!this.claimedTrophyRewards.includes(milestoneId)) {
      this.claimedTrophyRewards.push(milestoneId);
      this.save();
      return true;
    }
    return false;
  }
  
  addBattleHistory(result, goldWon, xpWon, trophiesChange = 0) {
    this.battleHistory.unshift({
      result: result,
      gold: goldWon,
      xp: xpWon,
      trophies: trophiesChange, // ✅ NOUVEAU
      date: new Date().toISOString()
    });
    
    if (this.battleHistory.length > 5) {
      this.battleHistory.pop();
    }
  }

  clearActiveDeck() {
    if (this.activeDeckIndex >= 0 && this.activeDeckIndex < this.decks.length) {
      this.decks[this.activeDeckIndex] = new Array(6).fill(null);
      console.log(`Deck ${this.activeDeckIndex} vidé.`);
    }
  }

  addCardToCollection(cardId, amount) {
    if (!this.collection[cardId]) {
      this.collection[cardId] = { level: 1, count: amount };
    } else {
      this.collection[cardId].count += amount;
    }
  }

  setActiveDeck(index) {
    if (index >= 0 && index < this.decks.length) {
      this.activeDeckIndex = index;
    }
  }

  getActiveDeck() {
    const deck = this.decks[this.activeDeckIndex];
    if (!deck || deck.length !== 6) {
        console.warn(`Deck ${this.activeDeckIndex} corrompu, réinitialisation.`);
        this.decks[this.activeDeckIndex] = new Array(6).fill(null);
        return this.decks[this.activeDeckIndex];
    }
    return deck;
  }

  getBattleDeck() {
    const activeDeckIDs = this.decks[this.activeDeckIndex].filter(id => id != null);
    
    if(activeDeckIDs.length < 6) {
        console.warn("Deck actif incomplet! Utilisation du Deck 1 (ou starter) par défaut.");
        let defaultDeckIDs = this.decks[0].filter(id => id != null);
        
        if(defaultDeckIDs.length < 6) {
            defaultDeckIDs = this.cardDatabase.createStarterDeck();
        }
        
        return defaultDeckIDs.map(cardId => {
            const cardData = this.cardDatabase.getCardById(cardId);
            const level = this.getCardLevel(cardId);
            const { stats, effect } = this.getScaledStats(cardData, level);
            return { ...cardData, level: level, stats: stats, effect: effect };
        });
    }
    
    return activeDeckIDs.map(cardId => {
      const cardData = this.cardDatabase.getCardById(cardId);
      const level = this.getCardLevel(cardId);
      const { stats, effect } = this.getScaledStats(cardData, level);
      return { ...cardData, level: level, stats: stats, effect: effect };
    });
  }

  swapDeckCard(deckSlotIndex, collectionCardId) {
    const activeDeck = this.getActiveDeck();
    
    const existingIndex = activeDeck.indexOf(collectionCardId);
    if (existingIndex > -1 && existingIndex !== deckSlotIndex) {
        console.log("Carte déjà dans le deck.");
        return null;
    }

    const oldCardId = activeDeck[deckSlotIndex];
    activeDeck[deckSlotIndex] = collectionCardId;
    this.decks[this.activeDeckIndex] = activeDeck;
    
    return oldCardId;
  }

  addXp(amount) {
    this.xp += amount;
    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
    }
  }

  addGold(amount) {
    this.gold += amount;
  }

  spendGold(amount) {
    if (this.gold < amount) return false;
    this.gold -= amount;
    return true;
  }
  
  addGems(amount) {
    this.gems += amount;
  }
  
  spendGems(amount) {
    if (this.gems < amount) return false;
    this.gems -= amount;
    return true;
  }

  upgradeCard(cardId) {
    const card = this.cardDatabase.getCardById(cardId);
    const cardInCollection = this.collection[cardId];

    if (!card || !cardInCollection) {
      return { success: false, reason: "Carte non possédée." };
    }

    const cost = this.cardDatabase.getUpgradeCost(cardId, cardInCollection.level);
    if (cost === null) {
      return { success: false, reason: "Niveau maximum atteint." };
    }

    const cardsNeeded = this.cardDatabase.getUpgradeCardCount(card.rarity, cardInCollection.level);
    if (cardInCollection.count < cardsNeeded) {
        return { success: false, reason: `Pas assez de cartes (${cardInCollection.count} / ${cardsNeeded})` };
    }

    if (!this.spendGold(cost)) {
      return { success: false, reason: "Pas assez d'or." };
    }

    cardInCollection.level++;
    cardInCollection.count -= cardsNeeded;
    console.log(`Carte ${card.name} améliorée au niveau ${cardInCollection.level}!`);
    return { success: true, cardName: card.name };
  }

  getCardLevel(cardId) {
    return this.collection[cardId]?.level || 1;
  }
  
  getQuestProgress(questId) {
    return this.questProgress[questId] || 0;
  }
  
  setQuestProgress(questId, progress) {
    this.questProgress[questId] = progress;
  }
  
  completeQuest(questId) {
    if (!this.completedQuests.includes(questId)) {
      this.completedQuests.push(questId);
    }
  }
  
  isQuestCompleted(questId) {
    return this.completedQuests.includes(questId);
  }
  
  save() {
    SaveManager.save(this);
  }

  getScaledStats(cardData, level) {
    let scaledStats = null;
    if (cardData.stats) {
        scaledStats = JSON.parse(JSON.stringify(cardData.stats));
    }
    
    let scaledEffect = null;
    if (cardData.effect) {
        scaledEffect = JSON.parse(JSON.stringify(cardData.effect));
    }
    
    const multiplier = Math.pow(1.1, level - 1);
    
    if (scaledStats) {
      if (scaledStats.health) scaledStats.health = Math.floor(scaledStats.health * multiplier);
      if (scaledStats.attack) scaledStats.attack = Math.floor(scaledStats.attack * multiplier);
      if (scaledStats.attackBuildingBonus) scaledStats.attackBuildingBonus = Math.floor(scaledStats.attackBuildingBonus * multiplier);
      if (scaledStats.areaDamageAura) scaledStats.areaDamageAura = Math.floor(scaledStats.areaDamageAura * multiplier);
    }
    
    if (scaledEffect) {
      if (scaledEffect.value) scaledEffect.value = Math.floor(scaledEffect.value * multiplier);
      if (scaledEffect.dot && scaledEffect.dot.damage) {
        scaledEffect.dot.damage = Math.floor(scaledEffect.dot.damage * multiplier);
      }
    }
    
    return { stats: scaledStats, effect: scaledEffect };
  }

  getCollectionSummary() {
    const allCards = this.cardDatabase.cards;
    const summary = {
      totalOwned: 0,
      totalInGame: allCards.length,
      rarities: {
        mythic: { owned: 0, total: 0 },
        legendary: { owned: 0, total: 0 },
        epic: { owned: 0, total: 0 },
        rare: { owned: 0, total: 0 },
        common: { owned: 0, total: 0 },
        basic: { owned: 0, total: 0 },
      }
    };

    const ownedCardIds = new Set(Object.keys(this.collection));
    summary.totalOwned = ownedCardIds.size;

    for (const card of allCards) {
      const rarity = card.rarity;
      if (summary.rarities[rarity]) {
        summary.rarities[rarity].total++;
        if (ownedCardIds.has(card.id)) {
          summary.rarities[rarity].owned++;
        }
      }
    }
    return summary;
  }
}

export default Player;