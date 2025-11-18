// src/ArenaManager.js
// ✅ MODIFIÉ : Les sorts peuvent être lancés n'importe où

import Unit from './models/Unit.js';
import ElementalCalculator from './utils/ElementalCalculator.js';

class ArenaManager {
  constructor(arenaElement, unitContainerElement, audioManager) {
    this.arenaEl = arenaElement;
    this.unitContainerEl = unitContainerElement;
    this.audioManager = audioManager;
    
    this.towers = [];
    this.units = [];
    this.particles = [];
    
    this.dropPreviewEl = null;
    this.createDropPreview();
  }

  createDropPreview() {
    if (this.dropPreviewEl) return;
    
    this.dropPreviewEl = document.createElement('div');
    this.dropPreviewEl.id = 'drop-preview';
    this.dropPreviewEl.style.cssText = `
      position: absolute;
      width: 80px;
      height: 80px;
      border: 3px dashed #3498db;
      border-radius: 50%;
      background: rgba(52, 152, 219, 0.2);
      pointer-events: none;
      display: none;
      z-index: 15;
      transform: translate(-50%, -50%);
      transition: all 0.1s ease;
    `;
    this.unitContainerEl.appendChild(this.dropPreviewEl);
  }

  showDropPreview(position, isValid, cardType) {
    if (!this.dropPreviewEl) return;
    
    this.dropPreviewEl.style.display = 'block';
    this.dropPreviewEl.style.left = `${position.x}px`;
    this.dropPreviewEl.style.top = `${position.y}px`;
    
    // ✅ MODIFIÉ : Les sorts ont un style différent
    if (cardType === 'spell') {
        this.dropPreviewEl.style.borderColor = 'var(--accent-warning)';
        this.dropPreviewEl.style.background = 'rgba(243, 156, 18, 0.3)';
    } else if (isValid) {
      this.dropPreviewEl.style.borderColor = 'var(--accent-success)';
      this.dropPreviewEl.style.background = 'rgba(39, 174, 96, 0.3)';
    } else {
      this.dropPreviewEl.style.borderColor = 'var(--accent-danger)';
      this.dropPreviewEl.style.background = 'rgba(231, 76, 60, 0.3)';
    }
  }

  hideDropPreview() {
    if (this.dropPreviewEl) {
      this.dropPreviewEl.style.display = 'none';
    }
  }

  getTowerPositions() {
    const arenaRect = this.arenaEl.getBoundingClientRect();
    const arenaWidth = arenaRect.width;
    const arenaHeight = arenaRect.height;
    
    return {
      enemy: {
        main: { x: arenaWidth / 2, y: arenaHeight * 0.10 },
        side1: { x: arenaWidth * 0.20, y: arenaHeight * 0.20 },
        side2: { x: arenaWidth * 0.80, y: arenaHeight * 0.20 },
      },
      player: {
        main: { x: arenaWidth / 2, y: arenaHeight * 0.90 },
        side1: { x: arenaWidth * 0.20, y: arenaHeight * 0.80 },
        side2: { x: arenaWidth * 0.80, y: arenaHeight * 0.80 },
      }
    };
  }

  initializeTowers() {
    const positions = this.getTowerPositions();
    
    const towerIds = [
      'enemy-main-tower', 'enemy-side-tower-1', 'enemy-side-tower-2',
      'player-main-tower', 'player-side-tower-1', 'player-side-tower-2'
    ];
    
    towerIds.forEach(id => {
      const towerEl = document.getElementById(id);
      if (towerEl) {
        towerEl.style.opacity = '1';
        towerEl.style.visibility = 'visible';
        const hpFill = towerEl.querySelector('.tower-hp-fill');
        if (hpFill) {
          hpFill.style.width = '100%';
        }
      } else {
        console.error(`Élément tour non trouvé pendant la réinitialisation: ${id}`);
      }
    });

    this.towers = [];
    
    this.towers.push(this.createTower('enemy-main-tower', false, positions.enemy.main));
    this.towers.push(this.createTower('enemy-side-tower-1', false, positions.enemy.side1));
    this.towers.push(this.createTower('enemy-side-tower-2', false, positions.enemy.side2));
    
    this.towers.push(this.createTower('player-main-tower', true, positions.player.main));
    this.towers.push(this.createTower('player-side-tower-1', true, positions.player.side1));
    this.towers.push(this.createTower('player-side-tower-2', true, positions.player.side2));
    
    console.log("✅ Tours ré-initialisées:", this.towers.length);
  }

  createTower(elementId, isFriendly, position) {
    const towerEl = document.getElementById(elementId);
    if (!towerEl) {
      console.error("❌ Élément tour introuvable:", elementId);
      return null;
    }
    
    towerEl.style.position = 'absolute';
    towerEl.style.left = `${position.x - 40}px`;
    towerEl.style.top = `${position.y - 50}px`;
    towerEl.style.transform = 'none';
    
    const tower = {
      id: elementId,
      element: towerEl,
      hpFill: towerEl.querySelector('.tower-hp-fill'),
      isFriendly: isFriendly,
      elementalType: isFriendly ? 'omni' : 'void',
      name: elementId,
      currentHealth: 1000,
      maxHealth: 1000,
      isDead: false,
      isTower: true,
      position: position,
      
      takeDamage: (amount) => {
        if (amount < 0) {
          tower.currentHealth -= amount;
          if (tower.currentHealth > tower.maxHealth) {
            tower.currentHealth = tower.maxHealth;
          }
          this.createFloatingText(Math.abs(amount), tower.position, 'heal');
        } else {
          if (tower.isDead) return;
          tower.currentHealth -= amount;
          this.createHitEffect(tower.position, isFriendly ? '#e74c3c' : '#3498db');
          
          const damageType = tower.isFriendly ? 'damage-enemy' : 'damage-ally';
          this.createFloatingText(amount, tower.position, damageType);
        }

        const hpPercent = (tower.currentHealth / tower.maxHealth) * 100;
        if(tower.hpFill) {
            tower.hpFill.style.width = `${hpPercent}%`;
        }
        
        if (tower.currentHealth <= 0 && !tower.isDead) {
          tower.currentHealth = 0;
          tower.isDead = true;
          tower.element.style.opacity = '0.3';
          this.createExplosionEffect(tower.position);
        }
      }
    };
    
    return tower;
  }

  spawnUnit(cardData, position, isFriendly) {
    const unit = new Unit(cardData, position, isFriendly, this.audioManager, this);
    this.units.push(unit);
    this.unitContainerEl.appendChild(unit.element);
    
    this.createSpawnEffect(position, isFriendly);
    
    return unit;
  }

  playCard(card, position, isFriendly) {
    console.log("Jeu de carte:", card.name, "à", position);
    
    if (card.type === 'unit' || card.type === 'building') {
      const count = card.stats.spawnCount || 1;
      for (let i = 0; i < count; i++) {
        const spawnPos = {
          x: position.x + (Math.random() - 0.5) * 30 * (count - 1),
          y: position.y + (Math.random() - 0.5) * 30 * (count - 1),
        };
        this.spawnUnit(card, spawnPos, isFriendly);
      }
    } 
    else if (card.type === 'spell') {
      this.executeSpell(card, position, isFriendly); // Passe "isFriendly"
    }
  }

  executeSpell(card, position, isCasterFriendly) {
    console.log(`Lancement de ${card.name} à ${position.x}, ${position.y}`);
    
    this.createSpellEffect(position, card.effect.radius);
    
    const targets = [ ...this.units, ...this.towers ];
    const effect = card.effect;
    const cardElement = card.element || 'omni';

    for (const target of targets) {
      if(target.isDead) continue;

      const dx = target.position.x - position.x;
      const dy = target.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const effectRadiusInPixels = (effect.radius || 1) * 20;

      if (distance <= effectRadiusInPixels) {
        let canBeHit = false;
        
        // Cible 'friendly' (par rapport au lanceur)
        if (effect.target === 'friendly' && target.isFriendly === isCasterFriendly) canBeHit = true;
        // Cible 'enemy' (par rapport au lanceur)
        else if (effect.target === 'enemy' && target.isFriendly !== isCasterFriendly) canBeHit = true;
        // Cible 'all' ou non défini (tout le monde)
        else if (!effect.target || effect.target === 'all') canBeHit = true;

        if (canBeHit) {
          if (effect.type === 'damage') {
            const targetElement = target.elementalType || target.element || 'omni';
            const multiplier = ElementalCalculator.getMultiplier(cardElement, targetElement);
            const finalDamage = Math.floor(effect.value * multiplier);
            
            target.takeDamage(finalDamage);
          }
          else if ((effect.type === 'heal' || effect.type === 'heal_over_time') && target.isFriendly === isCasterFriendly) {
            target.takeDamage(-effect.value);
          }
          // ... (autres effets)
        }
      }
    }
  }

  /**
   * ✅ MODIFIÉ : Vérifie le type de carte
   */
  isValidDropZone(position, isFriendly, cardType) {
    // Les sorts peuvent être lancés n'importe où
    if (cardType === 'spell') {
      return true;
    }
    
    // Logique pour les unités et bâtiments
    const arenaRect = this.arenaEl.getBoundingClientRect();
    const arenaHeight = arenaRect.height;
    
    if (isFriendly) {
      return position.y >= arenaHeight * 0.5;
    } else {
      return position.y < arenaHeight * 0.5;
    }
  }

  update(deltaTime) {
    for (let i = this.units.length - 1; i >= 0; i--) {
      const unit = this.units[i];
      
      if (unit.isDead) {
        this.units.splice(i, 1);
        continue;
      }
      
      unit.update(deltaTime, this.units, this.towers);
    }
    
    this.updateParticles(deltaTime);
  }

  getArenaPosition(event) {
    const rect = this.arenaEl.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  // === EFFETS VISUELS ===
  
  createFloatingText(amount, position, type) {
    const textEl = document.createElement('div');
    textEl.className = `floating-text ${type}`;
    textEl.textContent = Math.floor(amount);
    
    const x = position.x + (Math.random() - 0.5) * 30;
    const y = position.y - 20;
    
    textEl.style.left = `${x}px`;
    textEl.style.top = `${y}px`;
    
    this.unitContainerEl.appendChild(textEl);
    
    setTimeout(() => {
      textEl.remove();
    }, 1000);
  }
  
  createHitEffect(position, color) {
    const effect = document.createElement('div');
    effect.className = 'hit-effect';
    effect.style.cssText = `
      position: absolute;
      left: ${position.x}px;
      top: ${position.y}px;
      width: 30px;
      height: 30px;
      background: ${color};
      border-radius: 50%;
      opacity: 0.8;
      pointer-events: none;
      animation: hitFlash 0.3s ease-out;
      transform: translate(-50%, -50%);
    `;
    this.unitContainerEl.appendChild(effect);
    setTimeout(() => effect.remove(), 300);
  }

  createSpawnEffect(position, isFriendly) {
    const effect = document.createElement('div');
    effect.className = 'spawn-effect';
    const color = isFriendly ? '#3498db' : '#e74c3c';
    effect.style.cssText = `
      position: absolute;
      left: ${position.x}px;
      top: ${position.y}px;
      width: 60px;
      height: 60px;
      background: ${color};
      border-radius: 50%;
      opacity: 0.6;
      pointer-events: none;
      animation: spawnPulse 0.5s ease-out;
      transform: translate(-50%, -50%);
    `;
    this.unitContainerEl.appendChild(effect);
    setTimeout(() => effect.remove(), 500);
  }

  createSpellEffect(position, radius) {
    const effect = document.createElement('div');
    effect.className = 'spell-effect';
    const size = (radius || 1) * 40;
    effect.style.cssText = `
      position: absolute;
      left: ${position.x}px;
      top: ${position.y}px;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, rgba(233, 69, 96, 0.6), transparent);
      border: 2px solid #e94560;
      border-radius: 50%;
      opacity: 0.8;
      pointer-events: none;
      animation: spellBlast 0.8s ease-out;
      transform: translate(-50%, -50%);
    `;
    this.unitContainerEl.appendChild(effect);
    setTimeout(() => effect.remove(), 800);
  }

  createExplosionEffect(position) {
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      const angle = (Math.PI * 2 * i) / 8;
      const distance = 40 + (Math.random() * 20);
      
      particle.style.cssText = `
        position: absolute;
        left: ${position.x}px;
        top: ${position.y}px;
        width: 10px;
        height: 10px;
        background: #f39c12;
        border-radius: 50%;
        pointer-events: none;
        z-index: 20;
      `;
      
      this.unitContainerEl.appendChild(particle);
      
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      
      particle.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
      ], {
        duration: 600 + (Math.random() * 200),
        easing: 'ease-out'
      }).onfinish = () => particle.remove();
    }
  }

  updateParticles(deltaTime) {
    // Placeholder
  }
}

// Styles d'animations
if (!document.getElementById('arena-animations')) {
  const style = document.createElement('style');
  style.id = 'arena-animations';
  style.textContent = `
    @keyframes hitFlash {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
    }
    @keyframes spawnPulse {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
    }
    @keyframes spellBlast {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

export default ArenaManager;