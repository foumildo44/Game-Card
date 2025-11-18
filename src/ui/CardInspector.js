// src/ui/CardInspector.js
// NOUVEAU FICHIER - Gère l'infobulle (tooltip) globale

class CardInspector {
  constructor(uiManager, gameManager) {
    this.uiManager = uiManager;
    this.gameManager = gameManager;
    this.tooltipElement = document.getElementById('card-tooltip');
    
    if (!this.tooltipElement) {
        console.error("Élément #card-tooltip manquant dans index.html!");
    }
  }

  // Affiche les détails d'une carte
  render(cardId) {
    const player = this.gameManager.player;
    const cardData = this.gameManager.cardDatabase.getCardById(cardId);
    const cardInCollection = player.collection[cardId];
    if (!cardData || !cardInCollection) {
        this.hide();
        return;
    }

    const currentLevel = cardInCollection.level;
    const { stats: currentStats, effect: currentEffect } = player.getScaledStats(cardData, currentLevel);
    const { stats: nextStats, effect: nextEffect } = player.getScaledStats(cardData, currentLevel + 1);

    const upgradeCost = this.gameManager.cardDatabase.getUpgradeCost(cardId, currentLevel);
    const cardsNeeded = this.gameManager.cardDatabase.getUpgradeCardCount(cardData.rarity, currentLevel);
    const canAffordGold = player.gold >= upgradeCost;
    const hasEnoughCards = cardInCollection.count >= cardsNeeded;

    let upgradeHtml = '';
    if (upgradeCost) {
      let reason = "";
      if (!canAffordGold) reason = "(Pas assez d'or)";
      else if (!hasEnoughCards) reason = `(Manque ${cardsNeeded - cardInCollection.count} cartes)`;
      
      let comparisonHtml = '';
      if (cardData.type === 'spell') {
        comparisonHtml = `<span>Dégâts: ${currentEffect.value || 0} <span class="upgrade-arrow">→</span> ${nextEffect.value || 0}</span>`;
      } else {
        comparisonHtml = `
          <span>PV: ${currentStats.health || 0} <span class="upgrade-arrow">→</span> ${nextStats.health || 0}</span>
          <span>ATQ: ${currentStats.attack || 0} <span class="upgrade-arrow">→</span> ${nextStats.attack || 0}</span>
        `;
      }
      
      upgradeHtml = `
        <h5>Prochain Niveau (Lvl ${currentLevel + 1})</h5>
        <div class="stat-comparison">
          ${comparisonHtml}
        </div>
        <button id="inspector-btn-upgrade" class="btn-upgrade" 
                data-card-id="${cardId}" 
                data-cost="${upgradeCost}" 
                ${(!canAffordGold || !hasEnoughCards) ? 'disabled' : ''}>
          Améliorer ${reason}
          <div class="cost">
            <span>${cardInCollection.count} / ${cardsNeeded} Cartes</span>
            <span class="resource-icon">🪙</span>
            <span class="resource-amount">${upgradeCost}</span>
          </div>
        </button>
      `;
    } else {
      upgradeHtml = `<div class="cost">Niveau Maximum</div>`;
    }

    let statsHtml = '';
    if (cardData.type === 'spell') {
      statsHtml = `
        <span>Dégâts: ${currentEffect.value || 'N/A'}</span>
        <span>Rayon: ${currentEffect.radius || 'N/A'}</span>
      `;
    } else {
      statsHtml = `
        <span>PV: ${currentStats.health || 'N/A'}</span>
        <span>ATQ: ${currentStats.attack || 'N/A'}</span>
        <span>Vit: ${currentStats.speed !== undefined ? currentStats.speed : 'N/A'}</span>
      `;
    }

    this.tooltipElement.innerHTML = `
      <button id="inspector-btn-close" class="tooltip-close-btn">✖️</button>
      <h4>${cardData.name} <span class="cost">(${cardData.cost} Élixir)</span></h4>
      <p class="rarity-${cardData.rarity}">${cardData.type} - ${cardData.element || 'omni'}</p>
      <p>${cardData.description}</p>
      <div class="card-stats">
        ${statsHtml}
      </div>
      <div class="upgrade-section">
        ${upgradeHtml}
      </div>
    `;

    this.tooltipElement.style.display = 'flex';

    // Attache les événements
    this.tooltipElement.querySelector('#inspector-btn-upgrade')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const cost = parseInt(e.currentTarget.dataset.cost, 10);
      
      const result = this.gameManager.upgradeCard(cardId);
      if (result.success) {
        this.gameManager.audioManager.play('upgrade');
        if(cost) {
            this.gameManager.questManager.progress('spendGold', cost);
        }
      }
      
      // Re-rend l'écran actuel (Deck ou Encyclopédie) ET l'inspecteur
      this.uiManager.loadScreenContent(this.uiManager.screens['deck'].classList.contains('hidden') ? 'encyclopedia' : 'deck');
      this.render(cardId);
    });
    
    this.tooltipElement.querySelector('#inspector-btn-close')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hide();
    });
  }

  hide() {
    if (this.tooltipElement) {
        this.tooltipElement.style.display = 'none';
    }
  }
}

export default CardInspector;