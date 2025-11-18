// src/GachaManager.js
// Gère la logique d'ouverture des packs (Gacha).
// ✅ VERSION CORRIGÉE (Ne contient plus le bug de la boucle infinie)

class GachaManager {
  constructor(cardDatabase) {
    this.cardDatabase = cardDatabase;

    // Sépare les cartes par rareté pour les tirages
    this.pools = {
      basic: this.cardDatabase.cards.filter(c => c.rarity === 'basic').map(c => c.id),
      common: this.cardDatabase.cards.filter(c => c.rarity === 'common').map(c => c.id),
      rare: this.cardDatabase.cards.filter(c => c.rarity === 'rare').map(c => c.id),
      epic: this.cardDatabase.cards.filter(c => c.rarity === 'epic').map(c => c.id),
      legendary: this.cardDatabase.cards.filter(c => c.rarity === 'legendary').map(c => c.id),
      mythic: this.cardDatabase.cards.filter(c => c.rarity === 'mythic').map(c => c.id),
    };
  }

  /**
   * Ouvre un "Pack de Base" et renvoie les cartes gagnées.
   * @returns {Array} Une liste d'objets { cardId, amount }
   */
  openBasePack() {
    const results = [];
    const packSize = 5; // 5 cartes par pack

    for (let i = 0; i < packSize; i++) {
      const rarity = this.getRandomRarity();
      const cardId = this.getRandomCardFromPool(rarity);
      
      if (cardId) {
        // Regroupe les résultats
        const existing = results.find(r => r.cardId === cardId);
        if (existing) {
          existing.amount += 1;
        } else {
          results.push({ cardId: cardId, amount: 1, rarity: rarity });
        }
      }
    }
    return results;
  }

  /**
   * Détermine la rareté d'une carte tirée.
   */
  getRandomRarity() {
    const roll = Math.random() * 100;
    
    // Probabilités (ajustables)
    if (roll < 0.5) return 'mythic';      // 0.5% chance
    if (roll < 2.0) return 'legendary';   // 1.5% chance
    if (roll < 12.0) return 'epic';       // 10% chance
    if (roll < 35.0) return 'rare';       // 23% chance
    if (roll < 70.0) return 'common';     // 35% chance
    return 'basic';                       // 30% chance
  }

  /**
   * Tire une carte aléatoire d'un pool de rareté spécifique.
   * @param {string} rarity - La rareté ('common', 'rare', etc.)
   */
  getRandomCardFromPool(rarity) {
    const pool = this.pools[rarity];
    if (!pool || pool.length === 0) {
      console.warn(`Pool de rareté vide pour: ${rarity}. Utilisation de 'basic'.`);
      const basicPool = this.pools['basic'];
      return basicPool[Math.floor(Math.random() * basicPool.length)];
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }
}

export default GachaManager;