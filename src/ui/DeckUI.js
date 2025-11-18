// src/ui/DeckUI.js
// ✅ MODIFIÉ : renderInspector() génère le HTML du nouveau tooltip unifié.

class DeckUI {
  constructor(uiManager, gameManager) {
    this.uiManager = uiManager;
    this.gameManager = gameManager;
    this.container = document.getElementById('deck-screen');
    
    this.selectedDeckSlot = null;
    this.selectedCollectionCard = null;
    this.inspectedCardId = null; 
    
    this.activeDeckTab = 0;
    this.sortBy = 'rarity';
    this.sortOrder = 'desc'; 
    this.rarityFilter = 'all';
    
    this.tooltipElement = null;
    
    this.rarityOrder = {
      'mythic': 5,
      'legendary': 4,
      'epic': 3,
      'rare': 2,
      'common': 1,
      'basic': 0
    };
    
    // ✅ NOUVEAU : Map d'icônes
    this.elementIconMap = {
      fire: '🔥',
      water: '💧',
      air: '💨',
      earth: '🌍',
      omni: '🌟',
      void: '💀',
      alliance: '🤝'
    };
  }

  render() {
    const player = this.gameManager.player;
    if (!player) return;

    player.setActiveDeck(this.activeDeckTab);
    const deckCardIds = player.getActiveDeck();
    const deckSize = 6;
    const cardsInDeck = deckCardIds.filter(id => id != null).length;
    
    let collectionCards = Object.keys(player.collection)
      .filter(cardId => !deckCardIds.includes(cardId))
      .map(cardId => {
        const card = this.gameManager.cardDatabase.getCardById(cardId);
        return {
          id: cardId,
          level: player.getCardLevel(cardId),
          rarity: this.rarityOrder[card.rarity] || 0,
          rarityName: card.rarity,
          cost: card.cost,
          name: card.name
        };
      });

    if (this.rarityFilter !== 'all') {
      collectionCards = collectionCards.filter(card => card.rarityName === this.rarityFilter);
    }

    collectionCards.sort((a, b) => {
      let valA, valB;
      
      if (this.sortBy === 'rarity') {
        valA = a.rarity;
        valB = b.rarity;
      } else if (this.sortBy === 'level') {
        valA = a.level;
        valB = b.level;
      } else if (this.sortBy === 'cost') {
        valA = a.cost;
        valB = b.cost;
      }
      
      let result = (valA > valB) ? 1 : (valA < valB) ? -1 : 0;
      if (result === 0) result = a.name.localeCompare(b.name);
      return result * (this.sortOrder === 'desc' ? -1 : 1);
    });
    
    let deckSlotsHtml = '';
    for (let i = 0; i < deckSize; i++) {
        const cardId = deckCardIds[i];
        if (cardId) {
            deckSlotsHtml += this.renderCard(cardId, 'deck', i);
        } else {
            deckSlotsHtml += `<div class="deck-card-item empty-slot" data-deck-index="${i}">Vide</div>`;
        }
    }

    this.container.innerHTML = `
      <div class="deck-ui-wrapper">
        <div class="deck-ui-header">
          <h2>Ma Collection</h2>
          <div class="hub-resources">
            <div class="resource-item">
              <span class="resource-icon">🪙</span>
              <span class="resource-amount">${player.gold.toLocaleString()}</span>
            </div>
          </div>
          <button id="btn-deck-back" class="hub-icon-btn">↩️</button>
        </div>

        <div class="deck-content-wrapper">
          
          <div class="collection-section">
            <div class="collection-header">
              <h3>Collection (Cartes disponibles)</h3>
              
              <div class="filter-controls">
                <span>Filtrer par rareté:</span>
                <button class="filter-btn ${this.rarityFilter === 'all' ? 'active' : ''}" data-filter="all">Toutes</button>
                <button class="filter-btn rarity-mythic ${this.rarityFilter === 'mythic' ? 'active' : ''}" data-filter="mythic">Mythique</button>
                <button class="filter-btn rarity-legendary ${this.rarityFilter === 'legendary' ? 'active' : ''}" data-filter="legendary">Légendaire</button>
                <button class="filter-btn rarity-epic ${this.rarityFilter === 'epic' ? 'active' : ''}" data-filter="epic">Épique</button>
                <button class="filter-btn rarity-rare ${this.rarityFilter === 'rare' ? 'active' : ''}" data-filter="rare">Rare</button>
                <button class="filter-btn rarity-common ${this.rarityFilter === 'common' ? 'active' : ''}" data-filter="common">Commune</button>
                <button class="filter-btn rarity-basic ${this.rarityFilter === 'basic' ? 'active' : ''}" data-filter="basic">Basique</button>
              </div>
              
              <div class="sort-controls">
                <span>Trier par:</span>
                <button class="sort-btn ${this.sortBy === 'rarity' ? 'active' : ''}" data-sort="rarity">Rareté</button>
                <button class="sort-btn ${this.sortBy === 'level' ? 'active' : ''}" data-sort="level">Niveau</button>
                <button class="sort-btn ${this.sortBy === 'cost' ? 'active' : ''}" data-sort="cost">Coût</button>
              </div>
            </div>
            <div class="collection-grid custom-scrollbar" id="collection-grid">
              ${collectionCards.length > 0 ? collectionCards.map(card => this.renderCard(card.id, 'collection')).join('') : '<p class="empty-text" style="grid-column: 1 / -1;">Aucune carte trouvée</p>'}
            </div>
          </div>

          <div class="deck-sidebar">
            <div class="deck-tabs">
              <button class="deck-tab ${this.activeDeckTab === 0 ? 'active' : ''}" data-deck="0">Deck 1</button>
              <button class="deck-tab ${this.activeDeckTab === 1 ? 'active' : ''}" data-deck="1">Deck 2</button>
              <button class="deck-tab ${this.activeDeckTab === 2 ? 'active' : ''}" data-deck="2">Deck 3</button>
            </div>
            
            <div class="deck-button-group">
                <button id="btn-save-deck" class="btn-deck-action save">Sauvegarder</button>
                <button id="btn-clear-deck" class="btn-deck-action clear">Vider</button>
            </div>
            
            <div class="deck-section">
              <h3>Deck Actif (${cardsInDeck}/${deckSize})</h3>
              <div class="deck-grid custom-scrollbar" id="deck-grid">
                ${deckSlotsHtml}
              </div>
            </div>
            
            <div class="deck-instructions">
              <p>Cliquez sur une carte pour voir ses détails.</p>
              <p>Cliquez sur une carte de la collection, PUIS sur un slot (vide ou plein) de votre deck pour l'ajouter ou l'échanger.</p>
            </div>
          </div>
        </div>
        
        </div>
    `;
    
    // ✅ MODIFIÉ : Récupère le tooltip depuis le body
    this.tooltipElement = document.getElementById('card-tooltip');
    
    this.attachEvents();
  }

  renderCard(cardId, location, index = null) {
    const card = this.gameManager.cardDatabase.getCardById(cardId);
    if (!card) return `<div class="deck-card-item">CARTE MANQUANTE</div>`;
    
    const level = this.gameManager.player.getCardLevel(cardId);

    return `
      <div class="deck-card-item ${location}" 
           data-card-id="${cardId}" 
           ${location === 'deck' ? `data-deck-index="${index}"` : ''}>
        
        <div class="card-cost">${card.cost}</div>
        <div class="card-level">Lvl ${level}</div>
        <div class="card-icon">${card.icon}</div>
        <div class="card-name">${card.name}</div>
      </div>
    `;
  }

  // ✅✅✅ MODIFIÉ : Génère le HTML pour le nouveau style de tooltip
  renderInspector(cardId) {
    this.inspectedCardId = cardId;
    
    const player = this.gameManager.player;
    const cardData = this.gameManager.cardDatabase.getCardById(cardId);
    const cardInCollection = player.collection[cardId];
    if (!cardData || !cardInCollection) return;

    const currentLevel = cardInCollection.level;
    const { stats: currentStats, effect: currentEffect } = player.getScaledStats(cardData, currentLevel);
    const { stats: nextStats, effect: nextEffect } = player.getScaledStats(cardData, currentLevel + 1);

    const upgradeCost = this.gameManager.cardDatabase.getUpgradeCost(cardId, currentLevel);
    const cardsNeeded = this.gameManager.cardDatabase.getUpgradeCardCount(cardData.rarity, currentLevel);
    const canAffordGold = player.gold >= upgradeCost;
    const hasEnoughCards = cardInCollection.count >= cardsNeeded;

    // === Section Amélioration ===
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
        <div class="upgrade-section">
          <h5>Prochain Niveau (Lvl ${currentLevel + 1})</h5>
          <div class="stat-comparison">
            ${comparisonHtml}
          </div>
          <button id="btn-upgrade-card" class="btn-upgrade" data-cost="${upgradeCost}" ${(!canAffordGold || !hasEnoughCards) ? 'disabled' : ''}>
            Améliorer ${reason}
            <div class="cost">
              <span>${cardInCollection.count} / ${cardsNeeded} Cartes</span>
              <span class="resource-icon">🪙</span>
              <span class="resource-amount">${upgradeCost}</span>
            </div>
          </button>
        </div>
      `;
    } else {
      upgradeHtml = `<div class="upgrade-section"><div class="cost">Niveau Maximum</div></div>`;
    }

    // === Section Stats ===
    let statsHtml = '';
    if (cardData.type === 'spell') {
      statsHtml = `
        <div class="tooltip-stats">
          <span>💥 Dégâts: ${currentEffect.value || 'N/A'}</span>
          <span>📏 Rayon: ${currentEffect.radius || 'N/A'}</span>
        </div>
      `;
    } else {
      statsHtml = `
        <div class="tooltip-stats">
          <span>❤️ PV: ${currentStats.health || 'N/A'}</span>
          <span>⚔️ ATQ: ${currentStats.attack || 'N/A'}</span>
          <span>💨 Vit: ${currentStats.speed !== undefined ? currentStats.speed : 'N/A'}</span>
        </div>
      `;
    }
    
    // === Infos de base ===
    const elementIcon = this.elementIconMap[cardData.element || 'omni'];
    const ownershipBadge = `<span class="tooltip-badge owned">✅ Possédée (Niv ${currentLevel})</span>`;

    // === Assemblage final ===
    this.tooltipElement.innerHTML = `
      <div class="tooltip-header rarity-${cardData.rarity}">
        <button id="btn-tooltip-close" class="tooltip-close-btn">✖️</button>
        <h4>${cardData.icon} ${cardData.name}</h4>
        ${ownershipBadge}
      </div>
      <div class="tooltip-body">
        <div class="tooltip-meta">
          <span class="tooltip-element">${elementIcon} ${cardData.element || 'omni'}</span>
          <span class="tooltip-cost">💧 ${cardData.cost} Élixir</span>
          <span class="tooltip-rarity rarity-${cardData.rarity}">${cardData.rarity}</span>
        </div>
        <p class="tooltip-description">${cardData.description}</p>
        ${statsHtml}
        ${upgradeHtml}
      </div>
    `;

    this.tooltipElement.style.display = 'flex';

    this.tooltipElement.querySelector('#btn-upgrade-card')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const cost = parseInt(e.currentTarget.dataset.cost, 10);
      
      const result = this.gameManager.upgradeCard(cardId);
      if (result.success) {
        this.gameManager.audioManager.play('upgrade');
        if(cost) {
            this.gameManager.questManager.progress('spendGold', cost);
        }
      }
      this.render(); // Re-rend le DeckUI
      this.renderInspector(cardId); // Re-rend l'inspecteur
    });
    
    this.tooltipElement.querySelector('#btn-tooltip-close')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideInspector();
    });
  }

  hideInspector() {
    if (this.tooltipElement) {
        this.tooltipElement.style.display = 'none';
    }
    this.inspectedCardId = null;
    this.clearSelections();
  }
  
  clearSelections() {
    this.selectedDeckSlot = null;
    this.selectedCollectionCard = null;
    this.container.querySelectorAll('.deck-card-item.selected').forEach(el => {
        el.classList.remove('selected');
    });
    this.container.querySelectorAll('.empty-slot.selected').forEach(el => {
        el.classList.remove('selected');
    });
  }

  attachEvents() {
    document.getElementById('btn-deck-back')?.addEventListener('click', () => {
      this.gameManager.audioManager.play('click');
      this.uiManager.showScreen('hub');
    });
    
    document.getElementById('btn-clear-deck')?.addEventListener('click', () => {
        this.gameManager.audioManager.play('click');
        if (confirm("Êtes-vous sûr de vouloir vider ce deck ?")) {
            this.gameManager.player.clearActiveDeck();
            this.gameManager.player.save();
            this.hideInspector();
            this.render();
        }
    });

    document.getElementById('btn-save-deck')?.addEventListener('click', () => {
        this.gameManager.audioManager.play('click');
        const deck = this.gameManager.player.getActiveDeck().filter(id => id != null);
        if (deck.length < 6) {
            this.uiManager.showModal("Deck Incomplet", "<p>Votre deck doit contenir 6 cartes pour être sauvegardé.</p>");
        } else {
            this.gameManager.player.save();
            this.uiManager.showModal("Deck Sauvegardé", "<p>Votre deck est prêt pour le combat !</p>");
        }
    });
    
    this.container.querySelectorAll('.deck-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            this.gameManager.audioManager.play('click');
            const deckIndex = parseInt(tab.dataset.deck, 10);
            this.activeDeckTab = deckIndex;
            this.gameManager.player.setActiveDeck(deckIndex);
            this.hideInspector();
            this.render();
        });
    });
    
    this.container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            this.gameManager.audioManager.play('click');
            this.rarityFilter = btn.dataset.filter;
            this.render();
        });
    });
    
    this.container.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            this.gameManager.audioManager.play('click');
            const sortBy = btn.dataset.sort;
            if (this.sortBy === sortBy) {
                this.sortOrder = (this.sortOrder === 'desc' ? 'asc' : 'desc');
            } else {
                this.sortBy = sortBy;
                this.sortOrder = 'desc';
            }
            this.render();
        });
    });

    this.container.querySelectorAll('.deck-grid .deck-card-item, .deck-grid .empty-slot').forEach(el => {
      el.addEventListener('click', () => { 
        this.gameManager.audioManager.play('click');
        
        const deckIndex = parseInt(el.dataset.deckIndex, 10);
        const cardId = el.dataset.cardId; 

        if (this.selectedCollectionCard) {
          this.gameManager.player.swapDeckCard(deckIndex, this.selectedCollectionCard);
          this.clearSelections();
          this.hideInspector();
          this.render(); 
          return;
        }
        
        if (this.selectedDeckSlot === deckIndex) {
            this.hideInspector();
            return;
        }

        this.clearSelections();
        this.selectedDeckSlot = deckIndex;
        el.classList.add('selected');
        
        if (cardId) {
          this.renderInspector(cardId);
        }
      });
    });

    this.container.querySelectorAll('.deck-card-item.collection').forEach(el => {
      el.addEventListener('click', () => {
        this.gameManager.audioManager.play('click');
        const cardId = el.dataset.cardId;

        if (this.selectedDeckSlot !== null) {
          this.gameManager.player.swapDeckCard(this.selectedDeckSlot, cardId);
          this.clearSelections();
          this.hideInspector();
          this.render();
          return;
        }
        
        if (this.selectedCollectionCard === cardId) {
            this.hideInspector();
            return;
        }

        this.clearSelections();
        this.selectedCollectionCard = cardId;
        el.classList.add('selected');
        this.renderInspector(cardId);
      });
    });
  }
}

export default DeckUI;
