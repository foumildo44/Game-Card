// src/ui/EncyclopediaUI.js
// ✅ REDESIGN COMPLET + TOOLTIP AU SURVOL

class EncyclopediaUI {
  constructor(uiManager, gameManager) {
    this.uiManager = uiManager;
    this.gameManager = gameManager;
    this.container = document.getElementById('encyclopedia-screen');
    
    this.rarityOrder = ['mythic', 'legendary', 'epic', 'rare', 'common', 'basic'];
    
    this.elementIconMap = {
      fire: '🔥',
      water: '💧',
      air: '💨',
      earth: '🌍',
      omni: '🌟',
      void: '💀',
      alliance: '🤝'
    };
    
    this.tooltipElement = null;
    this.isSummaryCollapsed = false;
  }

  render() {
    const player = this.gameManager.player;
    const allCards = [...this.gameManager.cardDatabase.cards];
    const summary = player.getCollectionSummary();
    
    allCards.sort((a, b) => {
      const rarityA = this.rarityOrder.indexOf(a.rarity);
      const rarityB = this.rarityOrder.indexOf(b.rarity);
      
      if (rarityA !== rarityB) {
        return rarityA - rarityB;
      }
      return a.cost - b.cost;
    });
    
    let rarityStatsHtml = '';
    this.rarityOrder.forEach(rarity => {
        const stats = summary.rarities[rarity];
        if (stats.total > 0) {
            rarityStatsHtml += `
              <div class="rarity-stat-item rarity-${rarity}">
                <strong>${rarity.charAt(0).toUpperCase() + rarity.slice(1)}:</strong>
                <span>${stats.owned} / ${stats.total}</span>
              </div>
            `;
        }
    });

    const totalPercent = (summary.totalOwned / summary.totalInGame) * 100;

    this.container.innerHTML = `
      <div class="encyclopedia-wrapper">
        <div class="encyclopedia-header">
          <h2>📚 Encyclopédie des Cartes</h2>
          <button id="btn-encyclopedia-back" class="hub-icon-btn">↩️</button>
        </div>
        
        <!-- ✅ REDESIGN : Toggle moderne -->
        <div class="encyclopedia-toggle-bar">
          <button id="btn-toggle-summary" class="toggle-summary-btn ${this.isSummaryCollapsed ? 'collapsed' : ''}">
            <span class="toggle-icon">${this.isSummaryCollapsed ? '▼' : '▲'}</span>
            <span class="toggle-text">${this.isSummaryCollapsed ? 'Afficher' : 'Masquer'} la progression</span>
          </button>
        </div>
        
        <div id="encyclopedia-stats-container" class="encyclopedia-stats ${this.isSummaryCollapsed ? 'collapsed' : ''}">
          <div class="progress-bar-container">
            <label>Progression Totale de la Collection</label>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: ${totalPercent}%"></div>
              <span class="progress-bar-text">${summary.totalOwned} / ${summary.totalInGame} Cartes</span>
            </div>
          </div>
          <div class="rarity-stats-grid">
            ${rarityStatsHtml}
          </div>
        </div>
        
        <div class="encyclopedia-grid-container">
          <div class="encyclopedia-grid custom-scrollbar">
            ${allCards.map(card => this.renderCard(card, player.collection)).join('')}
          </div>
          
          <!-- ✅ NOUVEAU : Tooltip stylisé -->
          <div id="encyclopedia-tooltip" class="encyclopedia-tooltip"></div>
        </div>
      </div>
    `;
    
    this.tooltipElement = this.container.querySelector('#encyclopedia-tooltip');
    this.attachEvents();
  }

  renderCard(card, collection) {
    const isOwned = collection[card.id] !== undefined;
    const rarity = card.rarity || 'common';
    const element = card.element || 'omni';
    const elementIcon = this.elementIconMap[element] || '❓';
    
    return `
      <div class="encyclopedia-card ${isOwned ? '' : 'not-owned'} rarity-${rarity}" 
           data-card-id="${card.id}">
        <div class="card-cost">${card.cost}</div>
        <div class="card-element-icon element-${element}">${elementIcon}</div>
        <div class="card-icon">${card.icon}</div>
        <div class="card-name">${card.name}</div>
      </div>
    `;
  }

  showTooltip(cardId, element) {
    const card = this.gameManager.cardDatabase.getCardById(cardId);
    if (!card) return;
    
    const isOwned = this.gameManager.player.collection[cardId] !== undefined;
    const level = isOwned ? this.gameManager.player.getCardLevel(cardId) : 1;

    let statsHtml = '';
    if (card.stats) {
        const { stats } = this.gameManager.player.getScaledStats(card, level);
        statsHtml = `
          <div class="tooltip-stats">
            <span>❤️ PV: ${stats.health || 'N/A'}</span>
            <span>⚔️ ATQ: ${stats.attack || 'N/A'}</span>
            <span>💨 Vit: ${stats.speed || 'N/A'}</span>
          </div>
        `;
    }
    if (card.effect) {
        const { effect } = this.gameManager.player.getScaledStats(card, level);
        statsHtml = `
          <div class="tooltip-stats">
            <span>💥 Dégâts: ${effect.value || 'N/A'}</span>
            <span>📏 Rayon: ${effect.radius || 'N/A'}</span>
          </div>
        `;
    }
    
    const elementIcon = this.elementIconMap[card.element || 'omni'];
    const ownershipBadge = isOwned 
      ? `<span class="tooltip-badge owned">✅ Possédée (Niv ${level})</span>` 
      : `<span class="tooltip-badge not-owned">❌ Non Possédée</span>`;
    
    this.tooltipElement.innerHTML = `
      <div class="tooltip-header rarity-${card.rarity}">
        <h4>${card.icon} ${card.name}</h4>
        ${ownershipBadge}
      </div>
      <div class="tooltip-body">
        <div class="tooltip-meta">
          <span class="tooltip-element">${elementIcon} ${card.element || 'omni'}</span>
          <span class="tooltip-cost">💧 ${card.cost} Élixir</span>
          <span class="tooltip-rarity rarity-${card.rarity}">${card.rarity}</span>
        </div>
        <p class="tooltip-description">${card.description}</p>
        ${statsHtml}
      </div>
    `;
    
    const rect = element.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    
    // Positionne intelligemment
    let left = rect.right - containerRect.left + 10;
    const tooltipWidth = 280;
    
    if (left + tooltipWidth > containerRect.width) {
      left = rect.left - containerRect.left - tooltipWidth - 10;
    }
    
    this.tooltipElement.style.display = 'block';
    this.tooltipElement.style.left = `${left}px`;
    this.tooltipElement.style.top = `${rect.top - containerRect.top}px`;
  }

  hideTooltip() {
    if (this.tooltipElement) {
      this.tooltipElement.style.display = 'none';
    }
  }

  attachEvents() {
    document.getElementById('btn-encyclopedia-back')?.addEventListener('click', () => {
      this.gameManager.audioManager.play('click');
      this.uiManager.showScreen('hub');
    });

    document.getElementById('btn-toggle-summary')?.addEventListener('click', () => {
      this.gameManager.audioManager.play('click');
      this.isSummaryCollapsed = !this.isSummaryCollapsed;
      this.render();
    });
    
    // ✅ NOUVEAU : Événements de survol pour tooltip
    this.container.querySelectorAll('.encyclopedia-card').forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const cardId = e.currentTarget.dataset.cardId;
        this.showTooltip(cardId, e.currentTarget);
      });
      el.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
    });
  }
}

export default EncyclopediaUI;