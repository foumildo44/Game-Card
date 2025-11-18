// src/ui/ShopUI.js
// ✅ AJOUT : Plus d'items dans le shop

import GachaManager from '../GachaManager.js';
import SaveManager from '../utils/SaveManager.js';

class ShopUI {
  constructor(uiManager, gameManager) {
    this.uiManager = uiManager;
    this.gameManager = gameManager;
    this.player = gameManager.player;
    this.container = document.getElementById('shop-screen');
    
    this.gachaManager = new GachaManager(this.gameManager.cardDatabase);
    
    this.packCost = 250;
    this.goldSackCost = 10;
    this.goldSackAmount = 1000;
    
    // ✅ NOUVEAUX ITEMS
    this.goldPileCost = 1;
    this.goldPileAmount = 100;
    this.goldChestCost = 100;
    this.goldChestAmount = 12000;
  }

  render() {
    this.container.innerHTML = `
      <div class="shop-wrapper">
        <div class="deck-ui-header"> <h2>Boutique</h2>
          <div class="hub-resources">
            <div class="resource-item">
              <span class="resource-icon">🪙</span>
              <span class="resource-amount">${this.player.gold.toLocaleString()}</span>
            </div>
             <div class="resource-item">
              <span class="resource-icon">💎</span>
              <span class="resource-amount">${this.player.gems.toLocaleString()}</span>
            </div>
          </div>
          <button id="btn-shop-back" class="hub-icon-btn">↩️</button>
        </div>
        
        <div class="shop-content custom-scrollbar">
          <div class="shop-item card-pack" id="btn-buy-pack">
            <div class="pack-icon">🎁</div>
            <h3>Pack de Cartes</h3>
            <p>Contient 4-5 cartes de raretés aléatoires.</p>
            <div class="shop-item-cost">
              <span class="resource-icon">🪙</span>
              <span class="resource-amount">${this.packCost}</span>
            </div>
          </div>
          
          <div class="shop-item" id="btn-buy-gold-pile">
            <div class="pack-icon">💰</div>
            <h3>Pile d'Or</h3>
            <p>Recevez ${this.goldPileAmount.toLocaleString()} Or.</p>
            <div class="shop-item-cost">
              <span class="resource-icon">💎</span>
              <span class="resource-amount">${this.goldPileCost}</span>
            </div>
          </div>
          
          <div class="shop-item" id="btn-buy-gold-sack">
            <div class="pack-icon">💰💰</div>
            <h3>Sac d'Or</h3>
            <p>Recevez ${this.goldSackAmount.toLocaleString()} Or.</p>
            <div class="shop-item-cost">
              <span class="resource-icon">💎</span>
              <span class="resource-amount">${this.goldSackCost}</span>
            </div>
          </div>
          
          <div class="shop-item" id="btn-buy-gold-chest">
            <div class="pack-icon">📦</div>
            <h3>Coffre d'Or</h3>
            <p>Recevez ${this.goldChestAmount.toLocaleString()} Or.</p>
            <div class="shop-item-cost">
              <span class="resource-icon">💎</span>
              <span class="resource-amount">${this.goldChestCost}</span>
            </div>
          </div>
          
          <div class="shop-item disabled">
            <div class="pack-icon">💎</div>
            <h3>Sac de Gemmes</h3>
            <p>100 Gemmes</p>
            <div class="shop-item-cost">
              <span>(Indisponible)</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.attachEvents();
  }

  attachEvents() {
    document.getElementById('btn-shop-back')?.addEventListener('click', () => {
      this.uiManager.showScreen('hub');
    });

    document.getElementById('btn-buy-pack')?.addEventListener('click', () => {
      this.buyBasePack();
    });
    
    // ✅ NOUVEAUX LISTENERS
    document.getElementById('btn-buy-gold-pile')?.addEventListener('click', () => {
      this.buyGold(this.goldPileAmount, this.goldPileCost);
    });
    
    document.getElementById('btn-buy-gold-sack')?.addEventListener('click', () => {
      this.buyGold(this.goldSackAmount, this.goldSackCost);
    });
    
    document.getElementById('btn-buy-gold-chest')?.addEventListener('click', () => {
      this.buyGold(this.goldChestAmount, this.goldChestCost);
    });
  }

  buyBasePack() {
    if (this.player.spendGold(this.packCost)) {
      this.gameManager.audioManager.play('buy');
      
      this.gameManager.questManager.progress('openPacks', 1);
      this.gameManager.questManager.progress('spendGold', this.packCost);
      
      const results = this.gachaManager.openBasePack();
      results.forEach(item => {
        this.player.addCardToCollection(item.cardId, item.amount);
      });
      SaveManager.save(this.player);
      this.showGachaResults(results);
      this.render();
    } else {
      this.uiManager.showModal("Achat Échoué", "<p>Vous n'avez pas assez d'or pour cet achat.</p>");
    }
  }
  
  // ✅ NOUVELLE FONCTION GÉNÉRIQUE
  buyGold(goldAmount, gemCost) {
    if (this.player.spendGems(gemCost)) {
      this.gameManager.audioManager.play('buy');
      this.player.addGold(goldAmount);
      SaveManager.save(this.player);
      this.render();
      
      const modalHtml = `<div class="modal-reward-list"><div class="modal-reward-item"><span class="reward-text">🪙 +${goldAmount.toLocaleString()} Or !</span></div></div>`;
      this.uiManager.showModal("Achat Réussi !", modalHtml);
    } else {
      this.uiManager.showModal("Achat Échoué", "<p>Vous n'avez pas assez de gemmes pour cet achat.</p>");
    }
  }

  showGachaResults(results) {
    let resultsHtml = '<div class="modal-reward-list">';
    
    results.forEach(item => {
        const card = this.gameManager.cardDatabase.getCardById(item.cardId);
        resultsHtml += `
            <div class="modal-reward-item rarity-${card.rarity}">
                <span class="card-icon">${card.icon}</span>
                <span class="card-name">${card.name} (x${item.amount})</span>
                <span class="card-rarity">${card.rarity}</span>
            </div>
        `;
    });
    resultsHtml += '</div>';
    
    this.uiManager.showModal("Cartes Obtenues !", resultsHtml);
  }
}

export default ShopUI;