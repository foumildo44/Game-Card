// src/ui/HubUI.js
// ✅ VERSION AVEC NOTIFICATIONS SÉPARÉES

class HubUI {
  constructor(uiManager, gameManager) {
    this.uiManager = uiManager;
    this.gameManager = gameManager;
    this.audioManager = gameManager.audioManager;
    this.container = document.getElementById('hub-screen');
  }

  render() {
    const player = this.gameManager.player;
    if (!player) {
      console.error("❌ Player manquant dans HubUI.render()");
      return;
    }

    console.log("🏠 Rendu du Hub pour:", player.name, "Niveau:", player.level);

    // --- Historique ---
    let historyHtml = '';
    if (!player.battleHistory || player.battleHistory.length === 0) {
      historyHtml = '<p class="empty-text">Aucun combat récent.</p>';
    } else {
      historyHtml = player.battleHistory.map(battle => {
        let resultClass = '';
        let resultIcon = '';
        let resultText = '';
        
        switch(battle.result) {
          case 'victory':
            resultClass = 'victory';
            resultIcon = '🎉';
            resultText = 'Victoire';
            break;
          case 'defeat':
            resultClass = 'defeat';
            resultIcon = '💀';
            resultText = 'Défaite';
            break;
          case 'tie':
            resultClass = 'tie';
            resultIcon = '⏱️';
            resultText = 'Égalité';
            break;
          default:
            resultClass = 'tie';
            resultIcon = '➡️';
            resultText = 'Quitté';
        }
        
        const trophyText = battle.trophies > 0 ? `+${battle.trophies}` : battle.trophies;
        const trophyColor = battle.trophies > 0 ? 'var(--accent-success)' : 'var(--accent-danger)';
        
        return `
          <div class="history-item ${resultClass}">
            <span class="history-icon">${resultIcon}</span>
            <span class="history-result">${resultText}</span>
            <span class="history-reward">
              +${battle.gold}🪙 / +${battle.xp} XP
              <br>
              <span style="color: ${trophyColor};">🏆 ${trophyText}</span>
            </span>
          </div>
        `;
      }).join('');
    }

    const xpPercent = (player.xp / player.xpToNextLevel) * 100;
    const rank = player.getCurrentRank();
    
    // ✅ NOUVEAU : Notifications séparées
    const questsClaimable = this.uiManager.getClaimableQuestsCount();
    const trophiesClaimable = this.uiManager.getClaimableTrophiesCount();

    this.container.innerHTML = `
      <div class="hub-wrapper">
        <div class="hub-topbar">
          <div class="hub-logo">
            <span class="hub-logo-icon">⚔️</span>
            <span class="hub-logo-text">DARK FANTASY</span>
          </div>
          
          <div class="hub-player-info">
            <div class="player-avatar-small">
              <span class="avatar-level">${player.level}</span>
            </div>
            <div class="player-details">
              <h3>${player.name}</h3>
              <div class="xp-bar-small">
                <div class="xp-fill-small" style="width: ${xpPercent}%"></div>
              </div>
            </div>
          </div>
          
          <div class="hub-resources">
            <div class="resource-item">
              <span class="resource-icon">🪙</span>
              <span class="resource-amount">${player.gold.toLocaleString()}</span>
            </div>
            <div class="resource-item">
              <span class="resource-icon">💎</span>
              <span class="resource-amount">${player.gems.toLocaleString()}</span>
            </div>
            <div class="resource-item trophy-item" id="btn-trophy-road" title="Voir la Route des Trophées">
              <span class="resource-icon">🏆</span>
              <span class="resource-amount">${player.trophies.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="hub-menu-actions">
            <button class="hub-icon-btn" id="btn-hub-settings" title="Paramètres">⚙️</button>
            <button class="hub-icon-btn" id="btn-hub-menu" title="Menu principal">🚪</button>
          </div>
        </div>

        <div class="hub-content-main">
          
          <div class="hub-card player-profile-card">
            <h4>Profil du Héros</h4>
            <p>Niveau ${player.level}</p>
            
            <div class="xp-bar-large-container">
              <div class="xp-bar-large">
                <div class="xp-fill-large" style="width: ${xpPercent}%"></div>
                <span class="xp-text">${player.xp} / ${player.xpToNextLevel} XP</span>
              </div>
            </div>
            
            <p>Prochaine récompense: Nv. ${player.level + 1}</p>
            
            <div class="player-rank-display" style="margin-top: var(--spacing-md); padding: var(--spacing-md); background: var(--bg-tertiary); border-radius: var(--radius-md); border: 2px solid ${rank.color};">
              <div style="display: flex; align-items: center; gap: var(--spacing-sm); justify-content: center;">
                <span style="font-size: 2rem;">${rank.icon}</span>
                <div>
                  <h4 style="color: ${rank.color}; margin: 0;">${rank.name}</h4>
                  <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">🏆 ${player.trophies} Trophées</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="hub-action-card combat-card" id="btn-start-battle">
            <div class="action-card-header">
              <span class="action-card-icon">⚔️</span>
              <h2>COMBATTRE</h2>
            </div>
            <p class="action-card-desc">Lancez-vous dans l'arène !</p>
            
            <!-- ✅ NOUVEAU : Sélecteur de difficulté -->
            <div class="difficulty-selector">
              <label for="difficulty-select">Difficulté:</label>
              <select id="difficulty-select">
                <option value="easy">Facile (+20% Or, -20% XP)</option>
                <option value="normal" selected>Normal (100% Or, 100% XP)</option>
                <option value="hard">Difficile (+50% Or, +50% XP)</option>
                <option value="expert">Expert (+100% Or, +100% XP)</option>
              </select>
            </div>
            
            <button class="action-card-btn">Lancer un combat</button>
          </div>
          
          <div class="hub-card battle-history-card">
            <h4>Historique des Combats</h4>
            <div class="history-list custom-scrollbar">
              ${historyHtml}
            </div>
          </div>
        </div>

        <div class="hub-bottom-nav">
          <button class="nav-btn" id="btn-nav-deck">
            <span class="nav-icon">🃏</span>
            <span class="nav-label">Deck</span>
          </button>
          <button class="nav-btn" id="btn-nav-shop">
            <span class="nav-icon">🛒</span>
            <span class="nav-label">Boutique</span>
          </button>
          <button class="nav-btn" id="btn-nav-encyclopedia">
            <span class="nav-icon">📚</span>
            <span class="nav-label">Cartes</span>
          </button>
          <!-- ✅ CORRIGÉ : Notifications séparées -->
          <button class="nav-btn nav-btn-notif" id="btn-nav-quests">
            <span class="nav-icon">📜</span>
            <span class="nav-label">Quêtes</span>
            ${questsClaimable > 0 ? `<span class="notification-badge">${questsClaimable}</span>` : ''}
          </button>
          <button class="nav-btn nav-btn-notif" id="btn-nav-trophy-road">
            <span class="nav-icon">🏆</span>
            <span class="nav-label">Trophées</span>
            ${trophiesClaimable > 0 ? `<span class="notification-badge">${trophiesClaimable}</span>` : ''}
          </button>
        </div>
      </div>
    `;
    
    this.attachEvents();
  }

  attachEvents() {
    const btnStartBattle = document.getElementById('btn-start-battle');
    if (btnStartBattle) {
      btnStartBattle.addEventListener('click', () => {
        this.audioManager.play('click');
        
        // ✅ NOUVEAU : Récupère la difficulté
        const difficultySelect = document.getElementById('difficulty-select');
        const difficulty = difficultySelect ? difficultySelect.value : 'normal';
        
        this.gameManager.startBattle(difficulty);
      });
    }

    document.getElementById('btn-nav-deck')?.addEventListener('click', () => {
      this.audioManager.play('click');
      this.uiManager.showScreen('deck');
    });
    
    document.getElementById('btn-nav-shop')?.addEventListener('click', () => {
      this.audioManager.play('click');
      this.uiManager.showScreen('shop');
    });
    
    document.getElementById('btn-nav-encyclopedia')?.addEventListener('click', () => {
      this.audioManager.play('click');
      this.uiManager.showScreen('encyclopedia');
    });
    
    document.getElementById('btn-nav-quests')?.addEventListener('click', () => {
      this.audioManager.play('click');
      this.uiManager.showScreen('quests');
    });

    document.getElementById('btn-nav-trophy-road')?.addEventListener('click', () => {
      this.audioManager.play('click');
      this.uiManager.showScreen('trophy-road');
    });

    document.getElementById('btn-trophy-road')?.addEventListener('click', () => {
      this.audioManager.play('click');
      this.uiManager.showScreen('trophy-road');
    });

    // ✅ NOUVEAU : Bouton Paramètres
    document.getElementById('btn-hub-settings')?.addEventListener('click', () => {
      this.audioManager.play('click');
      this.uiManager.showScreen('settings');
    });

    document.getElementById('btn-hub-menu')?.addEventListener('click', () => {
      this.audioManager.play('click');
      this.uiManager.showScreen('main-menu');
    });
  }
}

export default HubUI;