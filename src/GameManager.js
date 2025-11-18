// src/GameManager.js
// ✅ VERSION AVEC DIFFICULTÉ IA + TROPHÉES CORRIGÉS

import Card from './models/Card.js';
import EnemyAI from './ai/EnemyAI.js';
import QuestManager from './QuestManager.js';

class GameManager {
  constructor(arenaManager, uiManager, cardDatabase, player, audioManager) { 
    this.arenaManager = arenaManager;
    this.uiManager = uiManager;
    this.cardDatabase = cardDatabase;
    this.player = player;
    this.audioManager = audioManager;
    
    this.enemyAI = new EnemyAI(this, arenaManager, cardDatabase);
    this.questManager = new QuestManager(this.player);
    
    if(this.uiManager) {
        this.questManager.setUIManager(this.uiManager);
    }

    this.gameState = 'menu';
    this.gameLoopId = null;
    this.lastTimestamp = 0;
    
    this.playerHand = [];
    this.playerDeckPool = [];
    this.elixir = 3;
    this.maxElixir = 10;
    this.elixirRate = 1.0;
    this.selectedCard = null;
    this.gameTimer = 180;
    this.isGameRunning = false;
    
    this.currentDifficulty = 'normal'; // ✅ NOUVEAU
    
    this.boundOnArenaClick = null;
    this.boundOnArenaMousemove = null;
    this.boundOnArenaMouseleave = null;
  }

  init() {
    console.log("GameManager: Initialisation...");
    this.gameState = 'menu';
    this.uiManager.showScreen('main-menu');
    
    if (this.uiManager && !this.questManager.uiManager) {
      this.questManager.setUIManager(this.uiManager);
    }
  }

  handlePlayClick() {
    console.log("🎮 handlePlayClick appelé");
    console.log("📊 Player hasCompletedTutorial:", this.player.hasCompletedTutorial);
    
    if (!this.player.hasCompletedTutorial) {
        console.log("➡️ Tutoriel non complété, affichage du tutoriel");
        this.uiManager.showScreen('tutorial');
    } else {
        console.log("➡️ Tutoriel déjà complété, affichage du Hub");
        this.uiManager.showScreen('hub');
    }
  }

  // ✅ MODIFIÉ : Accepte la difficulté
  startBattle(difficulty = 'normal') {
    console.log(`GameManager: Démarrage de la bataille en mode ${difficulty}...`);
    
    if (this.isGameRunning) {
      console.warn("⚠️ Bataille déjà en cours !");
      return;
    }
    
    this.currentDifficulty = difficulty; // ✅ SAUVEGARDE
    
    this.arenaManager.initializeTowers();
    this.arenaManager.units = [];
    const unitContainer = document.getElementById('unit-container');
    if (unitContainer) {
      Array.from(unitContainer.children).forEach(child => {
        if (child.id !== 'drop-preview') {
          child.remove();
        }
      });
    }

    const battleDeck = this.player.getBattleDeck();
    if(battleDeck.length < 6) {
        this.uiManager.showModal("Deck Incomplet", "<p>Votre deck doit contenir 6 cartes pour combattre. Veuillez compléter votre deck.</p>");
        this.uiManager.showScreen('deck');
        return;
    }

    this.playerHand = [];
    this.playerDeckPool = [...battleDeck];
    this.drawInitialHand(battleDeck, 4);

    this.elixir = 3;
    this.gameTimer = 180;
    this.selectedCard = null;
    
    // ✅ NOUVEAU : Configure l'IA selon la difficulté
    this.enemyAI.reset();
    this.enemyAI.setDifficulty(difficulty);

    this.uiManager.updateHand(this.playerHand);
    this.uiManager.updateElixir(this.elixir, this.maxElixir);
    this.uiManager.updateTimer(this.gameTimer);

    this.setupInputHandlers();
    
    this.gameState = 'running';
    this.isGameRunning = true;
    this.lastTimestamp = performance.now();
    this.gameLoop(this.lastTimestamp);
    
    console.log("✅ Bataille démarrée avec succès!");
    
    this.uiManager.showScreen('game');
  }

  endBattle(result) {
    console.log(`GameManager: Fin de la bataille. Résultat: ${result}`);
    
    this.gameState = 'hub';
    this.isGameRunning = false;
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
    
    this.audioManager.stopAllMusic(500);

    this.removeInputHandlers();
    this.arenaManager.hideDropPreview();
    
    let goldWon = 0;
    let xpWon = 0;
    let trophiesChange = 0;
    let title = "";
    let resultClass = "";
    let resultText = "";

    // ✅ MODIFIÉ : Bonus selon difficulté
    const difficultyMultipliers = {
      easy: { gold: 0.8, xp: 0.8 },
      normal: { gold: 1.0, xp: 1.0 },
      hard: { gold: 1.5, xp: 1.5 },
      expert: { gold: 2.0, xp: 2.0 }
    };
    
    const multiplier = difficultyMultipliers[this.currentDifficulty] || difficultyMultipliers.normal;

    if (result === 'victory') {
      goldWon = Math.floor((50 + Math.floor(Math.random() * 25)) * multiplier.gold);
      xpWon = Math.floor(20 * multiplier.xp);
      trophiesChange = 30; // ✅ CORRIGÉ : +30 au lieu de +40
      title = "🎉 VICTOIRE ! 🎉";
      resultClass = "victory";
      resultText = "Victoire";
      this.questManager.progress('winBattles', 1);
      this.audioManager.play('victory');
      
    } else if (result === 'defeat') {
      goldWon = Math.floor((10 + Math.floor(Math.random() * 5)) * multiplier.gold);
      xpWon = Math.floor(5 * multiplier.xp);
      trophiesChange = -20; // ✅ GARDE : -20
      title = "💀 DÉFAITE 💀";
      resultClass = "defeat";
      resultText = "Défaite";
      this.audioManager.play('defeat');
      
    } else if (result === 'tie') {
      goldWon = Math.floor(15 * multiplier.gold);
      xpWon = Math.floor(10 * multiplier.xp);
      trophiesChange = 0;
      title = "⏱️ TEMPS ÉCOULÉ ⏱️";
      resultClass = "tie";
      resultText = "Égalité";
    }

    this.player.addGold(goldWon);
    this.player.addXp(xpWon);
    this.player.addTrophies(trophiesChange);
    this.player.addBattleHistory(result, goldWon, xpWon, trophiesChange);
    this.player.save();
    
    if (result === 'quit') {
        this.uiManager.showScreen('hub');
    } else {
        const trophyText = trophiesChange > 0 ? `+${trophiesChange}` : trophiesChange;
        const trophyColor = trophiesChange > 0 ? 'var(--accent-success)' : 'var(--accent-danger)';
        
        const difficultyText = this.currentDifficulty === 'normal' ? '' : ` (${this.currentDifficulty})`;
        
        const recapHtml = `
          <div class="battle-recap">
            <h3 class="recap-result ${resultClass}">${resultText}${difficultyText}</h3>
            <p>Voici vos récompenses pour ce combat.</p>
            <div class="recap-rewards">
              <span>🪙 +${goldWon} Or</span>
              <span>✨ +${xpWon} XP</span>
              <span style="color: ${trophyColor};">🏆 ${trophyText} Trophées</span>
            </div>
          </div>
        `;
        this.uiManager.showModal(title, recapHtml, "Retour au Hub");
        this.uiManager.modalCloseBtn.onclick = () => {
            this.uiManager.hideModal();
            this.uiManager.showScreen('hub');
            this.uiManager.modalCloseBtn.onclick = () => this.uiManager.hideModal();
        };
    }
  }

  gameLoop(timestamp) {
    if (!this.isGameRunning || this.gameState !== 'running') {
      return;
    }
    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    if (deltaTime > 0 && deltaTime < 0.5) {
      this.gameTimer -= deltaTime;
      if (this.gameTimer < 0) this.gameTimer = 0;
      this.uiManager.updateTimer(this.gameTimer);
      this.updateElixir(deltaTime);
      this.arenaManager.update(deltaTime);
      this.enemyAI.update(deltaTime);
      this.checkWinLossCondition();
    }
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  checkWinLossCondition() {
    const playerMainTower = this.arenaManager.towers.find(t => t.id === 'player-main-tower');
    const enemyMainTower = this.arenaManager.towers.find(t => t.id === 'enemy-main-tower');
    if (playerMainTower && playerMainTower.isDead) {
      this.endBattle('defeat');
      return;
    }
    if (enemyMainTower && enemyMainTower.isDead) {
      this.endBattle('victory');
      return;
    }
    if (this.gameTimer <= 0) {
      const playerHP = playerMainTower ? playerMainTower.currentHealth : 0;
      const enemyHP = enemyMainTower ? enemyMainTower.currentHealth : 0;
      if (playerHP > enemyHP) this.endBattle('victory');
      else if (enemyHP > playerHP) this.endBattle('defeat');
      else this.endBattle('tie');
    }
  }

  updateElixir(deltaTime) {
    if (this.elixir < this.maxElixir) {
      this.elixir += this.elixirRate * deltaTime;
      if (this.elixir > this.maxElixir) this.elixir = this.maxElixir;
      this.uiManager.updateElixir(this.elixir, this.maxElixir);
    }
  }

  setupInputHandlers() {
    const arenaEl = this.arenaManager.arenaEl;
    this.removeInputHandlers();
    this.boundOnArenaClick = this.onArenaClick.bind(this);
    this.boundOnArenaMousemove = this.onArenaMousemove.bind(this);
    this.boundOnArenaMouseleave = this.onArenaMouseleave.bind(this);
    arenaEl.addEventListener('click', this.boundOnArenaClick);
    arenaEl.addEventListener('mousemove', this.boundOnArenaMousemove);
    arenaEl.addEventListener('mouseleave', this.boundOnArenaMouseleave);
  }

  removeInputHandlers() {
    const arenaEl = this.arenaManager.arenaEl;
    if (this.boundOnArenaClick) {
      arenaEl.removeEventListener('click', this.boundOnArenaClick);
      this.boundOnArenaClick = null;
    }
    if (this.boundOnArenaMousemove) {
      arenaEl.removeEventListener('mousemove', this.boundOnArenaMousemove);
      this.boundOnArenaMousemove = null;
    }
    if (this.boundOnArenaMouseleave) {
      arenaEl.removeEventListener('mouseleave', this.boundOnArenaMouseleave);
      this.boundOnArenaMouseleave = null;
    }
  }
  
  onArenaMousemove(event) {
    if (this.selectedCard) {
      const position = this.arenaManager.getArenaPosition(event);
      const isValid = this.arenaManager.isValidDropZone(position, true, this.selectedCard.type);
      this.arenaManager.showDropPreview(position, isValid, this.selectedCard.type);
    }
  }
  
  onArenaMouseleave() {
    this.arenaManager.hideDropPreview();
  }

  onCardSelected(card) {
    this.selectedCard = card;
    console.log("Carte sélectionnée:", card ? card.name : "Aucune");
  }

  onArenaClick(event) {
    if (!this.selectedCard) {
      console.log("Aucune carte sélectionnée");
      return;
    }
    const position = this.arenaManager.getArenaPosition(event);
    if (!this.arenaManager.isValidDropZone(position, true, this.selectedCard.type)) {
      console.log("❌ Zone de drop invalide");
      return;
    }
    if (this.elixir < this.selectedCard.cost) {
      console.log("❌ Pas assez d'élixir:", this.elixir, "/", this.selectedCard.cost);
      return;
    }
    this.elixir -= this.selectedCard.cost;
    this.uiManager.updateElixir(this.elixir, this.maxElixir);
    const cardData = this.selectedCard.rawData; 
    this.arenaManager.playCard(cardData, position, true);
    if (cardData.type === 'unit' || cardData.type === 'building') {
      this.audioManager.play('spawn');
    } else {
      this.audioManager.play('spell');
    }
    this.questManager.progress('playCards', 1);
    this.removeCardFromHand(this.selectedCard.id);
    this.drawNextCard();
    this.selectedCard = null;
    this.uiManager.onCardClick(null, null);
    this.arenaManager.hideDropPreview();
    console.log("✅ Carte jouée avec succès!");
  }

  drawInitialHand(battleDeck, count) {
    this.playerDeckPool = [...battleDeck].sort(() => 0.5 - Math.random());
    this.playerHand = [];
    for (let i = 0; i < count; i++) {
      if (this.playerDeckPool.length > 0) {
        const cardData = this.playerDeckPool.pop();
        this.playerHand.push(new Card(cardData));
      }
    }
  }

  removeCardFromHand(cardId) {
    const cardIndex = this.playerHand.findIndex(card => card.id === cardId);
    if (cardIndex > -1) {
      const playedCard = this.playerHand.splice(cardIndex, 1)[0];
      this.playerDeckPool.unshift(playedCard.rawData);
    }
  }

  drawNextCard() {
    if (this.playerDeckPool.length === 0) {
      console.log("Deck vide, remélange...");
      const battleDeck = this.player.getBattleDeck();
      this.playerDeckPool = [...battleDeck].sort(() => 0.5 - Math.random());
    }
    if (this.playerDeckPool.length > 0) {
      const nextCardData = this.playerDeckPool.pop();
      this.playerHand.push(new Card(nextCardData));
      this.uiManager.updateHand(this.playerHand);
    }
  }

  upgradeCard(cardId) {
    const result = this.player.upgradeCard(cardId);
    
    if (result.success) {
      this.questManager.progress('upgradeCards', 1);
      
      const card = this.cardDatabase.getCardById(cardId);
      const cost = this.cardDatabase.getUpgradeCost(cardId, this.player.getCardLevel(cardId) - 1);
      if(cost) {
          this.questManager.progress('spendGold', cost);
      }

      this.player.save();
      const modalHtml = `<div class="modal-reward-list"><div class="modal-reward-item"><span class="reward-text">✅ Carte ${result.cardName} améliorée !</span></div></div>`;
      this.uiManager.showModal("Amélioration Réussie !", modalHtml);
    } else {
      const modalHtml = `<div class="modal-reward-list"><div class="modal-reward-item"><span class="reward-text">❌ ${result.reason}</span></div></div>`;
      this.uiManager.showModal("Échec de l'amélioration", modalHtml);
    }
    return result;
  }

  getElixir() {
    return this.elixir;
  }
}

export default GameManager;