// src/ai/EnemyAI.js
// ✅ VERSION AVEC SYSTÈME DE DIFFICULTÉ

class EnemyAI {
  constructor(gameManager, arenaManager, cardDatabase) {
    this.gameManager = gameManager;
    this.arenaManager = arenaManager;
    this.cardDatabase = cardDatabase;
    
    this.elixir = 3;
    this.maxElixir = 10;
    this.elixirRate = 1.0;
    
    this.deck = [];
    this.hand = [];
    this.deckPool = [];
    
    this.thinkTimer = 0;
    this.thinkInterval = 2.0;
    
    // ✅ NOUVEAU : Paramètres de difficulté
    this.difficulty = 'normal';
    this.difficultySettings = {
      easy: {
        thinkInterval: 3.0,    // Réfléchit lentement
        elixirRate: 0.8,       // Génère moins d'élixir
        cardLevelBonus: -1,    // Cartes niveau -1
        aggressiveness: 0.3    // Peu agressif
      },
      normal: {
        thinkInterval: 2.0,
        elixirRate: 1.0,
        cardLevelBonus: 0,
        aggressiveness: 0.5
      },
      hard: {
        thinkInterval: 1.5,    // Réfléchit plus vite
        elixirRate: 1.2,       // Plus d'élixir
        cardLevelBonus: 1,     // Cartes niveau +1
        aggressiveness: 0.7    // Très agressif
      },
      expert: {
        thinkInterval: 1.0,    // Très rapide
        elixirRate: 1.5,       // Beaucoup d'élixir
        cardLevelBonus: 2,     // Cartes niveau +2
        aggressiveness: 0.9    // Extrêmement agressif
      }
    };
  }
  
  // ✅ NOUVEAU : Configure la difficulté
  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    const settings = this.difficultySettings[difficulty] || this.difficultySettings.normal;
    
    this.thinkInterval = settings.thinkInterval;
    this.elixirRate = settings.elixirRate;
    
    console.log(`🤖 IA configurée en mode ${difficulty}`);
  }

  reset() {
    this.elixir = 3;
    this.thinkTimer = 0;
    
    this.deck = this.cardDatabase.createEnemyDeck();
    this.deckPool = [...this.deck];
    this.hand = [];
    
    // ✅ APPLIQUE BONUS DE NIVEAU SELON DIFFICULTÉ
    const settings = this.difficultySettings[this.difficulty] || this.difficultySettings.normal;
    
    if (settings.cardLevelBonus !== 0) {
      this.deck = this.deck.map(card => {
        const newLevel = Math.max(1, (card.level || 1) + settings.cardLevelBonus);
        const player = this.gameManager.player;
        const { stats, effect } = player.getScaledStats(card, newLevel);
        return { ...card, level: newLevel, stats, effect };
      });
      this.deckPool = [...this.deck];
    }
    
    this.drawInitialHand(4);
  }

  drawInitialHand(count) {
    this.hand = [];
    for (let i = 0; i < count && this.deckPool.length > 0; i++) {
      this.hand.push(this.deckPool.pop());
    }
  }

  update(deltaTime) {
    this.updateElixir(deltaTime);
    
    this.thinkTimer -= deltaTime;
    if (this.thinkTimer <= 0) {
      this.thinkTimer = this.thinkInterval;
      this.makeDecision();
    }
  }

  updateElixir(deltaTime) {
    if (this.elixir < this.maxElixir) {
      this.elixir += this.elixirRate * deltaTime;
      if (this.elixir > this.maxElixir) {
        this.elixir = this.maxElixir;
      }
    }
  }

  makeDecision() {
    const affordableCards = this.hand.filter(c => c.cost <= this.elixir);
    if (affordableCards.length === 0) return;
    
    // ✅ MODIFIÉ : Agressivité selon difficulté
    const settings = this.difficultySettings[this.difficulty] || this.difficultySettings.normal;
    
    if (Math.random() > settings.aggressiveness) {
      return; // Ne joue pas cette fois
    }
    
    const chosenCard = affordableCards[Math.floor(Math.random() * affordableCards.length)];
    
    const arenaRect = this.arenaManager.arenaEl.getBoundingClientRect();
    const x = arenaRect.width * (0.3 + Math.random() * 0.4);
    const y = arenaRect.height * (0.1 + Math.random() * 0.3);
    
    this.playCard(chosenCard, { x, y });
  }

  playCard(card, position) {
    if (this.elixir < card.cost) return;
    
    this.elixir -= card.cost;
    this.arenaManager.playCard(card, position, false);
    
    const index = this.hand.indexOf(card);
    if (index > -1) {
      this.hand.splice(index, 1);
      this.deckPool.unshift(card);
    }
    
    this.drawNextCard();
  }

  drawNextCard() {
    if (this.deckPool.length === 0) {
      this.deckPool = [...this.deck].sort(() => 0.5 - Math.random());
    }
    
    if (this.deckPool.length > 0) {
      this.hand.push(this.deckPool.pop());
    }
  }
}

export default EnemyAI;