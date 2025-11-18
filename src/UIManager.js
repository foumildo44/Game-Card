// src/UIManager.js
// ✅ VERSION AVEC SETTINGS + NOTIFICATIONS SÉPARÉES

import MainMenuUI from './ui/MainMenuUI.js';
import HubUI from './ui/HubUI.js';
import DeckUI from './ui/DeckUI.js';
import ShopUI from './ui/ShopUI.js';
import QuestUI from './ui/QuestUI.js';
import EncyclopediaUI from './ui/EncyclopediaUI.js';
import TutorialUI from './ui/TutorialUI.js';
import TrophyRoadUI from './ui/TrophyRoadUI.js';
import SettingsUI from './ui/SettingsUI.js'; // ✅ AJOUT

class UIManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.audioManager = gameManager.audioManager;

    this.screens = {
      'main-menu': document.getElementById('main-menu-screen'),
      'tutorial': document.getElementById('tutorial-screen'),
      'hub': document.getElementById('hub-screen'),
      'game': document.getElementById('game-screen'),
      'deck': document.getElementById('deck-screen'),
      'shop': document.getElementById('shop-screen'),
      'quests': document.getElementById('quest-screen'),
      'encyclopedia': document.getElementById('encyclopedia-screen'),
      'trophy-road': document.getElementById('trophy-road-screen'),
      'settings': document.getElementById('settings-screen'), // ✅ AJOUT
    };

    for (const key in this.screens) {
      if (!this.screens[key]) {
        console.error(`❌ Écran manquant dans index.html: ${key}-screen`);
      }
    }

    this.handEl = document.getElementById('player-hand');
    this.elixirBarEl = document.getElementById('elixir-bar-fill-v2');
    this.elixirValueEl = document.getElementById('elixir-value-v2');
    this.timerEl = document.getElementById('game-timer');
    this.playerHand = [];
    this.selectedCard = null;

    this.modalOverlay = document.getElementById('global-modal-overlay');
    this.modalTitle = document.getElementById('modal-title');
    this.modalBody = document.getElementById('modal-body');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    
    this.mainMenuUI = new MainMenuUI(this);
    this.tutorialUI = new TutorialUI(this);
    this.hubUI = new HubUI(this, this.gameManager);
    this.deckUI = new DeckUI(this, this.gameManager);
    this.shopUI = new ShopUI(this, this.gameManager);
    this.questUI = new QuestUI(this, this.gameManager, this.gameManager.questManager);
    this.encyclopediaUI = new EncyclopediaUI(this, this.gameManager);
    this.trophyRoadUI = new TrophyRoadUI(this, this.gameManager);
    this.settingsUI = new SettingsUI(this, this.gameManager); // ✅ AJOUT

    document.getElementById('btn-quit-battle')?.addEventListener('click', () => {
      this.audioManager.play('click');
      this.gameManager.endBattle('quit');
    });
    
    this.modalCloseBtn?.addEventListener('click', () => {
      this.hideModal();
    });
  }
  
  showModal(title, contentHtml, closeButtonText = "Fermer") {
    if(!this.modalOverlay) return;
    this.modalTitle.textContent = title;
    this.modalBody.innerHTML = contentHtml;
    this.modalCloseBtn.textContent = closeButtonText;
    this.modalOverlay.classList.remove('hidden');
    this.audioManager.play('gacha');
  }
  
  hideModal() {
    if(!this.modalOverlay) return;
    this.modalOverlay.classList.add('hidden');
    this.audioManager.play('click');
  }

  showScreen(screenName) {
    console.log(`🎬 Affichage de l'écran: ${screenName}`);
    
    if (!this.screens[screenName]) {
      console.error(`❌ L'écran "${screenName}" n'existe pas !`);
      return;
    }
    
    switch(screenName) {
      case 'main-menu':
        this.audioManager.playMusic('music_menu');
        break;
      case 'hub':
      case 'deck':
      case 'shop':
      case 'quests':
      case 'encyclopedia':
      case 'tutorial':
      case 'trophy-road':
      case 'settings': // ✅ AJOUT
        this.audioManager.playMusic('music_hub');
        break;
      case 'game':
        this.audioManager.playMusic('music_battle');
        break;
    }
    
    if (screenName !== 'main-menu' && screenName !== 'hub' && screenName !== 'game' && screenName !== 'tutorial') {
      this.audioManager.play('click');
    }
    
    for (const key in this.screens) {
      if (this.screens[key]) {
        this.screens[key].classList.add('hidden');
      }
    }

    const screenToShow = this.screens[screenName];
    screenToShow.classList.remove('hidden');
    
    this.loadScreenContent(screenName);
  }

  loadScreenContent(screenName) {
    console.log(`📄 Chargement du contenu: ${screenName}`);
    
    switch(screenName) {
      case 'main-menu': 
        this.mainMenuUI.render(); 
        break;
      case 'tutorial':
        this.tutorialUI.render();
        break;
      case 'hub':
        if (!this.gameManager.player) {
          console.error("❌ Player manquant dans GameManager !");
          return;
        }
        this.hubUI.render();
        break;
      case 'deck': 
        this.deckUI.render(); 
        break;
      case 'shop': 
        this.shopUI.render(); 
        break;
      case 'quests': 
        this.questUI.render(); 
        break;
      case 'encyclopedia':
        this.encyclopediaUI.render();
        break;
      case 'trophy-road':
        this.trophyRoadUI.render();
        break;
      case 'settings': // ✅ AJOUT
        this.settingsUI.render();
        break;
      case 'game':
        this.updateHand(this.gameManager.playerHand);
        this.updateElixir(this.gameManager.elixir, this.gameManager.maxElixir);
        this.updateTimer(this.gameManager.gameTimer);
        break;
    }
  }
  
  // ✅ CORRIGÉ : Notifications séparées
  getClaimableQuestsCount() {
    const quests = this.gameManager.questManager.getAllQuestsStatus();
    return quests.filter(q => q.isClaimable).length;
  }
  
  getClaimableTrophiesCount() {
    const player = this.gameManager.player;
    const milestones = this.trophyRoadUI.milestones;
    return milestones.filter(m => {
      const isUnlocked = player.trophies >= m.trophies;
      const isClaimed = player.hasClaimedReward(`trophy_${m.trophies}`);
      return isUnlocked && !isClaimed;
    }).length;
  }
  
  setGameManager(manager) { 
    this.gameManager = manager; 
  }
  
  updateHand(hand) {
    this.playerHand = hand;
    if (!this.handEl) return;
    this.handEl.innerHTML = '';
    
    hand.forEach(card => {
      const cardEl = this.createCardElement(card);
      this.handEl.appendChild(cardEl);
    });

    this.updateCardAffordability();
  }

  createCardElement(card) {
    const el = document.createElement('div');
    el.className = 'card-in-hand';
    el.dataset.cardId = card.id;
    
    el.innerHTML = `
      <div class="card-cost">${card.cost}</div>
      <div class="card-icon">${card.icon}</div>
      <div class="card-name">${card.name}</div>
    `;
    
    el.addEventListener('click', () => {
      this.onCardClick(card, el);
    });
    
    return el;
  }

  onCardClick(card, cardElement) {
    this.audioManager.play('click');
    
    if (card === null) {
      this.selectedCard = null;
      if (this.handEl) {
        this.handEl.querySelectorAll('.card-in-hand').forEach(el => el.classList.remove('selected'));
      }
      if (this.gameManager) {
        this.gameManager.onCardSelected(null);
      }
      return;
    }

    if (this.gameManager.getElixir() < card.cost) {
      console.log("Pas assez d'élixir !");
      return;
    }

    if (this.selectedCard === card) {
      this.selectedCard = null;
      cardElement.classList.remove('selected');
      this.gameManager.onCardSelected(null);
    } else {
      this.selectedCard = card;
      if (this.handEl) {
        this.handEl.querySelectorAll('.card-in-hand').forEach(el => el.classList.remove('selected'));
      }
      cardElement.classList.add('selected');
      this.gameManager.onCardSelected(card);
    }
  }

  updateElixir(current, max) {
    if (!this.elixirBarEl || !this.elixirValueEl) return;
    const percent = (current / max) * 100;
    this.elixirBarEl.style.width = `${percent}%`;
    this.elixirValueEl.textContent = `${Math.floor(current)} / ${max}`;
    this.updateCardAffordability();
  }

  updateTimer(seconds) {
    if (!this.timerEl) return;
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const timeString = `${minutes}:${secs.toString().padStart(2, '0')}`;
    
    this.timerEl.textContent = timeString;
    
    if (seconds <= 30 && seconds > 0) {
      this.timerEl.style.color = 'var(--accent-danger)';
      this.timerEl.style.borderColor = 'var(--accent-danger)';
    } else {
      this.timerEl.style.color = 'var(--text-primary)';
      this.timerEl.style.borderColor = 'var(--accent-info)';
    }
  }

  updateCardAffordability() {
    if (!this.gameManager || !this.playerHand) return;
    const currentElixir = this.gameManager.getElixir();
    
    this.playerHand.forEach(card => {
      if (!this.handEl) return;
      const cardEl = this.handEl.querySelector(`[data-card-id="${card.id}"]`);
      if (cardEl) {
        if (card.cost > currentElixir) {
          cardEl.classList.add('not-affordable');
        } else {
          cardEl.classList.remove('not-affordable');
        }
      }
    });
  }

  removeCardFromHand(cardId) {
    this.playerHand = this.playerHand.filter(card => card.id !== cardId);
    this.updateHand(this.playerHand);
  }
}

export default UIManager;