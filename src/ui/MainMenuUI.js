// src/ui/MainMenuUI.js
// ✅ VERSION AVEC SUPPORT DES SAUVEGARDES

class MainMenuUI {
  constructor(uiManager) {
    this.uiManager = uiManager;
    this.container = document.getElementById('main-menu-screen');
  }

  render() {
    // ✅ Vérifie s'il existe des sauvegardes
    const hasSaves = this.checkForSaves();
    
    this.container.innerHTML = `
      <div class="main-menu-wrapper">
        <div class="main-menu-background">
          <div class="bg-overlay"></div>
        </div>
        
        <div class="main-menu-content">
          <div class="game-logo">
            <h1 class="logo-title">
              <span class="logo-icon">⚔️</span>
              DARK FANTASY
              <span class="logo-icon">⚔️</span>
            </h1>
            <p class="logo-subtitle">Real-Time Arena</p>
            <div class="logo-decoration">
              <span class="decoration-line"></span>
              <span class="decoration-gem">💎</span>
              <span class="decoration-line"></span>
            </div>
          </div>
          
          <div class="main-menu-actions">
            <button id="btn-play" class="menu-main-btn btn-new-game">
              <span class="btn-icon">🎮</span>
              <span class="btn-text">
                <span class="btn-title">Jouer</span>
                <span class="btn-desc">Commencer l'aventure</span>
              </span>
            </button>
            
            <!-- ✅ MODIFIÉ : Activé si des sauvegardes existent -->
            <button id="btn-continue" class="menu-main-btn btn-continue" ${hasSaves ? '' : 'disabled'}>
              <span class="btn-icon">📂</span>
              <span class="btn-text">
                <span class="btn-title">Continuer</span>
                <span class="btn-desc">${hasSaves ? 'Charger une partie' : 'Aucune sauvegarde'}</span>
              </span>
            </button>
            
            <!-- ✅ NOUVEAU : Bouton Paramètres -->
            <button id="btn-settings-main" class="menu-main-btn btn-settings">
              <span class="btn-icon">⚙️</span>
              <span class="btn-text">
                <span class="btn-title">Paramètres</span>
                <span class="btn-desc">Options du jeu</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    `;
    
    this.attachEvents();
  }
  
  checkForSaves() {
    for (let i = 1; i <= 3; i++) {
      const saveKey = `darkfantasy_save_slot_${i}`;
      if (localStorage.getItem(saveKey)) {
        return true;
      }
    }
    return false;
  }
  
  attachEvents() {
    document.getElementById('btn-play')?.addEventListener('click', () => {
      this.uiManager.gameManager.handlePlayClick();
    });
    
    // ✅ NOUVEAU : Bouton Continuer
    document.getElementById('btn-continue')?.addEventListener('click', () => {
      if (this.checkForSaves()) {
        this.uiManager.gameManager.audioManager.play('click');
        this.uiManager.showScreen('settings'); // Va aux paramètres pour choisir la save
      }
    });
    
    // ✅ NOUVEAU : Bouton Paramètres
    document.getElementById('btn-settings-main')?.addEventListener('click', () => {
      this.uiManager.gameManager.audioManager.play('click');
      this.uiManager.showScreen('settings');
    });
  }
}

export default MainMenuUI;