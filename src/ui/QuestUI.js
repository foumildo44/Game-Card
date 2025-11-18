// src/ui/QuestUI.js
// Gère l'écran des Quêtes.

class QuestUI {
  constructor(uiManager, gameManager, questManager) {
    this.uiManager = uiManager;
    this.gameManager = gameManager;
    this.questManager = questManager;
    this.audioManager = gameManager.audioManager; // <- AJOUT
    this.container = document.getElementById('quest-screen');
  }

  render() {
    // ... (pas de changement dans le HTML) ...
  }

  renderQuestItem(quest) {
    // ... (pas de changement dans le HTML) ...
  }

  attachEvents() {
    document.getElementById('btn-quest-back')?.addEventListener('click', () => {
      this.uiManager.showScreen('hub');
    });

    this.container.querySelectorAll('.quest-claim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        this.audioManager.play('click');
        
        const questId = btn.dataset.questId;
        const success = this.questManager.claimReward(questId);
        
        if (success) {
          this.audioManager.play('reward'); // <- SON
          this.gameManager.player.save();
          this.render();
          this.uiManager.hubUI.render();
        }
      });
    });
  }
}

// Colle le HTML de la fonction render() ici
QuestUI.prototype.render = function() {
  const quests = this.questManager.getAllQuestsStatus();
  this.container.innerHTML = `
    <div class="quest-wrapper">
      <div class="deck-ui-header">
        <h2>Quêtes</h2>
        <button id="btn-quest-back" class="hub-icon-btn">↩️</button>
      </div>
      <div class="quest-list">
        ${quests.map(quest => this.renderQuestItem(quest)).join('')}
      </div>
    </div>
  `;
  this.attachEvents();
};

QuestUI.prototype.renderQuestItem = function(quest) {
  const progressPercent = (quest.progress / quest.target) * 100;
  let buttonHtml = '';
  if (quest.isClaimable) {
    buttonHtml = `<button class="quest-claim-btn" data-quest-id="${quest.id}">Réclamer</button>`;
  } else if (quest.isCompleted) {
    buttonHtml = `<button class="quest-claim-btn" disabled>Terminée</button>`;
  } else {
    buttonHtml = `<button class="quest-claim-btn" disabled>${quest.progress} / ${quest.target}</button>`;
  }
  return `
    <div class="quest-item ${quest.isClaimable ? 'claimable' : ''}">
      <div class="quest-info">
        <h4>${quest.title}</h4>
        <p>${quest.description}</p>
        <div class="quest-reward">
          Récompense: 
          ${quest.reward.gold ? `<span>🪙 ${quest.reward.gold}</span>` : ''}
          ${quest.reward.gems ? `<span>💎 ${quest.reward.gems}</span>` : ''}
        </div>
      </div>
      <div class="quest-progress">
        <div class="quest-progress-bar">
          <div class="quest-progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        ${buttonHtml}
      </div>
    </div>
  `;
};

export default QuestUI;