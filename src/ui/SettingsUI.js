// src/ui/SettingsUI.js
// ✅ NOUVEAU FICHIER - Écran de paramètres

import SaveManager from '../utils/SaveManager.js';

class SettingsUI {
  constructor(uiManager, gameManager) {
    this.uiManager = uiManager;
    this.gameManager = gameManager;
    this.audioManager = gameManager.audioManager;
    this.container = document.getElementById('settings-screen');
  }

  render() {
    const isMuted = this.audioManager.isMuted;
    
    // Récupère les sauvegardes existantes
    const saves = this.getSavesList();
    
    let savesHtml = '';
    if (saves.length === 0) {
      savesHtml = '<p class="empty-text">Aucune sauvegarde disponible</p>';
    } else {
      savesHtml = saves.map((save, index) => `
        <div class="save-slot">
          <div class="save-info">
            <h4>Slot ${index + 1}</h4>
            <p>Niveau ${save.level} - ${save.gold}🪙 - ${save.trophies}🏆</p>
            <p class="save-date">${new Date(save.lastPlayed).toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          <div class="save-actions">
            <button class="btn-save-load" data-slot="${index}">Charger</button>
            <button class="btn-save-delete" data-slot="${index}">Supprimer</button>
          </div>
        </div>
      `).join('');
    }

    this.container.innerHTML = `
      <div class="settings-wrapper">
        <div class="settings-header">
          <h2>⚙️ Paramètres</h2>
          <button id="btn-settings-back" class="hub-icon-btn">↩️</button>
        </div>
        
        <div class="settings-content custom-scrollbar">
          
          <!-- Section Audio -->
          <div class="settings-section">
            <h3>🔊 Audio</h3>
            <div class="setting-item">
              <label for="toggle-mute">Son général</label>
              <button id="toggle-mute" class="toggle-btn ${isMuted ? '' : 'active'}">
                ${isMuted ? '🔇 Muet' : '🔊 Activé'}
              </button>
            </div>
            <div class="setting-item">
              <label>Volume de la musique</label>
              <input type="range" id="music-volume" min="0" max="100" value="100">
            </div>
            <div class="setting-item">
              <label>Volume des effets sonores</label>
              <input type="range" id="sfx-volume" min="0" max="100" value="100">
            </div>
          </div>
          
          <!-- Section Raccourcis -->
          <div class="settings-section">
            <h3>⌨️ Raccourcis</h3>
            <div class="shortcuts-info">
              <p><strong>Espace :</strong> Pause / Reprendre</p>
              <p><strong>1-4 :</strong> Sélectionner carte 1 à 4</p>
              <p><strong>Échap :</strong> Annuler sélection</p>
              <p><strong>Tab :</strong> Voir stats rapides</p>
            </div>
          </div>
          
          <!-- Section Sauvegardes -->
          <div class="settings-section">
            <h3>💾 Gestion des sauvegardes</h3>
            <div class="save-current">
              <button id="btn-save-current" class="settings-btn primary">
                💾 Sauvegarder la partie actuelle
              </button>
            </div>
            <div class="saves-list">
              ${savesHtml}
            </div>
          </div>
          
          <!-- Section Danger Zone -->
          <div class="settings-section danger-zone">
            <h3>⚠️ Zone dangereuse</h3>
            <button id="btn-reset-progress" class="settings-btn danger">
              🗑️ Réinitialiser toute la progression
            </button>
            <button id="btn-return-menu" class="settings-btn secondary">
              🚪 Retour au menu principal
            </button>
          </div>
          
        </div>
      </div>
    `;
    
    this.attachEvents();
  }
  
  getSavesList() {
    const saves = [];
    for (let i = 1; i <= 3; i++) {
      const saveKey = `darkfantasy_save_slot_${i}`;
      const saveData = localStorage.getItem(saveKey);
      if (saveData) {
        try {
          const parsed = JSON.parse(saveData);
          saves.push({
            slot: i,
            ...parsed,
            lastPlayed: parsed.lastPlayed || Date.now()
          });
        } catch (e) {
          console.error(`Erreur de lecture du slot ${i}:`, e);
        }
      }
    }
    return saves;
  }
  
  saveToSlot(slotIndex) {
    const player = this.gameManager.player;
    const saveData = {
      name: player.name,
      level: player.level,
      xp: player.xp,
      xpToNextLevel: player.xpToNextLevel,
      gold: player.gold,
      gems: player.gems,
      trophies: player.trophies,
      collection: player.collection,
      decks: player.decks,
      activeDeckIndex: player.activeDeckIndex,
      questProgress: player.questProgress,
      completedQuests: player.completedQuests,
      battleHistory: player.battleHistory,
      hasCompletedTutorial: player.hasCompletedTutorial,
      claimedTrophyRewards: player.claimedTrophyRewards,
      lastPlayed: Date.now()
    };
    
    const saveKey = `darkfantasy_save_slot_${slotIndex}`;
    localStorage.setItem(saveKey, JSON.stringify(saveData));
    
    this.audioManager.play('reward');
    this.uiManager.showModal("Sauvegarde réussie !", `<p>Partie sauvegardée dans le slot ${slotIndex}</p>`);
    this.render();
  }
  
  loadFromSlot(slotIndex) {
    const saveKey = `darkfantasy_save_slot_${slotIndex}`;
    const saveData = localStorage.getItem(saveKey);
    
    if (!saveData) {
      this.uiManager.showModal("Erreur", "<p>Aucune sauvegarde trouvée dans ce slot.</p>");
      return;
    }
    
    try {
      const parsed = JSON.parse(saveData);
      this.gameManager.player.loadData(parsed);
      this.gameManager.player.save(); // Sauvegarde automatique
      
      this.audioManager.play('reward');
      this.uiManager.showModal("Chargement réussi !", "<p>Partie chargée avec succès !</p>");
      this.uiManager.showScreen('hub');
    } catch (e) {
      console.error("Erreur de chargement:", e);
      this.uiManager.showModal("Erreur", "<p>Impossible de charger cette sauvegarde.</p>");
    }
  }
  
  deleteSlot(slotIndex) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la sauvegarde du slot ${slotIndex} ?`)) {
      return;
    }
    
    const saveKey = `darkfantasy_save_slot_${slotIndex}`;
    localStorage.removeItem(saveKey);
    
    this.audioManager.play('click');
    this.render();
  }

  attachEvents() {
    document.getElementById('btn-settings-back')?.addEventListener('click', () => {
      this.audioManager.play('click');
      this.uiManager.showScreen('hub');
    });
    
    // Toggle Mute
    document.getElementById('toggle-mute')?.addEventListener('click', (e) => {
      this.audioManager.toggleMute();
      this.render();
    });
    
    // Sauvegarder partie actuelle
    document.getElementById('btn-save-current')?.addEventListener('click', () => {
      // Trouve le premier slot vide, sinon demande
      const saves = this.getSavesList();
      let targetSlot = saves.length + 1;
      
      if (targetSlot > 3) {
        const choice = prompt("Tous les slots sont pleins. Quel slot remplacer ? (1, 2 ou 3)");
        const parsed = parseInt(choice, 10);
        if (parsed >= 1 && parsed <= 3) {
          targetSlot = parsed;
        } else {
          return;
        }
      }
      
      this.saveToSlot(targetSlot);
    });
    
    // Charger sauvegarde
    this.container.querySelectorAll('.btn-save-load').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = parseInt(btn.dataset.slot, 10) + 1;
        this.loadFromSlot(slot);
      });
    });
    
    // Supprimer sauvegarde
    this.container.querySelectorAll('.btn-save-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = parseInt(btn.dataset.slot, 10) + 1;
        this.deleteSlot(slot);
      });
    });
    
    // Réinitialiser progression
    document.getElementById('btn-reset-progress')?.addEventListener('click', () => {
      if (confirm("⚠️ ATTENTION : Cette action est IRRÉVERSIBLE et supprimera TOUTE votre progression. Continuer ?")) {
        if (confirm("Êtes-vous VRAIMENT sûr ? Toutes vos cartes, trophées et progression seront perdus !")) {
          localStorage.clear();
          location.reload();
        }
      }
    });
    
    // Retour au menu
    document.getElementById('btn-return-menu')?.addEventListener('click', () => {
      this.audioManager.play('click');
      this.uiManager.showScreen('main-menu');
    });
  }
}

export default SettingsUI;