// src/ui/TrophyRoadUI.js
// ✅ VERSION AVEC PALIERS INTERMÉDIAIRES

class TrophyRoadUI {
  constructor(uiManager, gameManager) {
    this.uiManager = uiManager;
    this.gameManager = gameManager;
    this.container = document.getElementById('trophy-road-screen');
    
    // ✅ MODIFIÉ : Doublement des paliers (entre chaque palier existant)
    this.milestones = [
      // Paliers originaux + nouveaux intermédiaires
      { trophies: 50, reward: { gold: 100 }, icon: '🪙' },
      { trophies: 100, reward: { gold: 200 }, icon: '🪙' },
      { trophies: 150, reward: { gems: 5 }, icon: '💎' },
      { trophies: 200, reward: { gems: 10 }, icon: '💎' },
      { trophies: 250, reward: { gold: 300 }, icon: '🪙' },
      { trophies: 300, reward: { gold: 500 }, icon: '🪙' },
      { trophies: 350, reward: { gems: 12 }, icon: '💎' },
      { trophies: 400, reward: { gems: 15 }, icon: '💎' },
      { trophies: 450, reward: { gold: 600 }, icon: '🪙' },
      { trophies: 500, reward: { gold: 800, gems: 20 }, icon: '🎁' },
      { trophies: 550, reward: { gold: 900 }, icon: '🪙' },
      { trophies: 600, reward: { gold: 1000 }, icon: '🪙' },
      { trophies: 650, reward: { gems: 20 }, icon: '💎' },
      { trophies: 700, reward: { gems: 25 }, icon: '💎' },
      { trophies: 750, reward: { gold: 1200 }, icon: '🪙' },
      { trophies: 800, reward: { gold: 1500 }, icon: '🪙' },
      { trophies: 850, reward: { gems: 28 }, icon: '💎' },
      { trophies: 900, reward: { gems: 30 }, icon: '💎' },
      { trophies: 950, reward: { gold: 1800 }, icon: '🪙' },
      { trophies: 1000, reward: { gold: 2000, gems: 50 }, icon: '🎁' },
      { trophies: 1050, reward: { gold: 2200 }, icon: '🪙' },
      { trophies: 1100, reward: { gold: 2500 }, icon: '🪙' },
      { trophies: 1150, reward: { gems: 35 }, icon: '💎' },
      { trophies: 1200, reward: { gems: 40 }, icon: '💎' },
      { trophies: 1250, reward: { gold: 2800 }, icon: '🪙' },
      { trophies: 1300, reward: { gold: 3000 }, icon: '🪙' },
      { trophies: 1350, reward: { gems: 45 }, icon: '💎' },
      { trophies: 1400, reward: { gems: 50 }, icon: '💎' },
      { trophies: 1450, reward: { gold: 3500 }, icon: '🪙' },
      { trophies: 1500, reward: { gold: 4000, gems: 100 }, icon: '🎁' },
      { trophies: 1550, reward: { gold: 4500 }, icon: '🪙' },
      { trophies: 1600, reward: { gold: 5000 }, icon: '🪙' },
      { trophies: 1650, reward: { gems: 60 }, icon: '💎' },
      { trophies: 1700, reward: { gems: 75 }, icon: '💎' },
      { trophies: 1750, reward: { gold: 5500 }, icon: '🪙' },
      { trophies: 1800, reward: { gold: 6000 }, icon: '🪙' },
      { trophies: 1850, reward: { gems: 90 }, icon: '💎' },
      { trophies: 1900, reward: { gems: 100 }, icon: '💎' },
      { trophies: 1950, reward: { gold: 8000 }, icon: '🪙' },
      { trophies: 2000, reward: { gold: 10000, gems: 500 }, icon: '👑' },
    ];
  }

  render() {
    const player = this.gameManager.player;
    const rank = player.getCurrentRank();
    const currentTrophies = player.trophies;
    
    let milestonesHtml = this.milestones.map(milestone => {
      const isUnlocked = currentTrophies >= milestone.trophies;
      const isClaimed = player.hasClaimedReward(`trophy_${milestone.trophies}`);
      const canClaim = isUnlocked && !isClaimed;
      
      let rewardText = '';
      if (milestone.reward.gold) rewardText += `${milestone.reward.gold} 🪙 `;
      if (milestone.reward.gems) rewardText += `${milestone.reward.gems} 💎`;
      
      let stateClass = '';
      let buttonHtml = '';
      
      if (isClaimed) {
        stateClass = 'claimed';
        buttonHtml = '<div class="milestone-status claimed">✅ Réclamé</div>';
      } else if (canClaim) {
        stateClass = 'claimable';
        buttonHtml = `<button class="milestone-claim-btn" data-milestone="${milestone.trophies}">Réclamer</button>`;
      } else {
        stateClass = 'locked';
        buttonHtml = '<div class="milestone-status locked">🔒 Verrouillé</div>';
      }
      
      return `
        <div class="milestone-item ${stateClass}" data-trophies="${milestone.trophies}">
          <div class="milestone-icon">${milestone.icon}</div>
          <div class="milestone-trophies">🏆 ${milestone.trophies}</div>
          <div class="milestone-reward">${rewardText}</div>
          ${buttonHtml}
        </div>
      `;
    }).join('');
    
    this.container.innerHTML = `
      <div class="trophy-road-wrapper">
        <div class="trophy-road-header">
          <h2>Route des Trophées</h2>
          <button id="btn-trophy-back" class="hub-icon-btn">↩️</button>
        </div>
        
        <div class="trophy-road-stats">
          <div class="current-rank" style="border-color: ${rank.color};">
            <span class="rank-icon">${rank.icon}</span>
            <div class="rank-info">
              <h3>${rank.name}</h3>
              <p class="rank-trophies">🏆 ${currentTrophies} Trophées</p>
            </div>
          </div>
          
          <div class="trophy-info-box">
            <h4>Système de Trophées</h4>
            <p>🏆 +30 par victoire</p>
            <p>💔 -20 par défaite</p>
            <p>💡 La difficulté n'affecte PAS les trophées</p>
          </div>
        </div>
        
        <div class="trophy-road-content custom-scrollbar">
          <div class="milestones-track">
            ${milestonesHtml}
          </div>
        </div>
      </div>
    `;
    
    this.attachEvents();
  }

  attachEvents() {
    document.getElementById('btn-trophy-back')?.addEventListener('click', () => {
      this.gameManager.audioManager.play('click');
      this.uiManager.showScreen('hub');
    });
    
    this.container.querySelectorAll('.milestone-claim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.gameManager.audioManager.play('click');
        const trophies = parseInt(btn.dataset.milestone, 10);
        this.claimReward(trophies);
      });
    });
  }
  
  claimReward(trophies) {
    const player = this.gameManager.player;
    const milestone = this.milestones.find(m => m.trophies === trophies);
    
    if (!milestone) return;
    
    const milestoneId = `trophy_${trophies}`;
    
    if (player.claimTrophyReward(milestoneId)) {
      if (milestone.reward.gold) player.addGold(milestone.reward.gold);
      if (milestone.reward.gems) player.addGems(milestone.reward.gems);
      
      this.gameManager.audioManager.play('reward');
      player.save();
      
      let rewardHtml = '<div class="modal-reward-list">';
      if (milestone.reward.gold) {
        rewardHtml += `<div class="modal-reward-item"><span class="reward-text">🪙 +${milestone.reward.gold} Or</span></div>`;
      }
      if (milestone.reward.gems) {
        rewardHtml += `<div class="modal-reward-item"><span class="reward-text">💎 +${milestone.reward.gems} Gemmes</span></div>`;
      }
      rewardHtml += '</div>';
      
      this.uiManager.showModal(`🏆 Récompense ${trophies} Trophées !`, rewardHtml);
      
      this.render();
      
      if (this.uiManager.hubUI) {
        this.uiManager.hubUI.render();
      }
    }
  }
}

export default TrophyRoadUI;