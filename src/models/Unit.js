// src/models/Unit.js
// ✅ CORRIGÉ : createHTMLElement() complété
// ✅ MODIFIÉ : takeDamage() envoie le type de dégât (ally/enemy)

import ElementalCalculator from '../utils/ElementalCalculator.js';

class Unit {
  constructor(cardData, position, isFriendly, audioManager, arenaManager) {
    this.id = `unit_${Date.now()}_${Math.random()}`;
    this.name = cardData.name;
    this.isFriendly = isFriendly;
    this.cardData = cardData;
    this.elementalType = cardData.element || 'omni';
    
    this.audioManager = audioManager;
    this.arenaManager = arenaManager;
    
    // Stats de combat
    this.stats = cardData.stats;
    this.currentHealth = this.stats.health;
    this.maxHealth = this.stats.health;
    this.attackSpeed = this.stats.attackSpeed || 1.5;
    this.range = (this.stats.range || 1) * 20;
    this.attackCooldown = 0;
    
    // Position et Mouvement
    this.position = position;
    this.speed = (this.stats.speed || 1.5) * 20;
    this.target = null;
    
    // Rendu
    this.element = this.createHTMLElement();
    this.healthBarFill = this.element.querySelector('.unit-hp-fill');
    this.updateElementPosition();

    this.isDead = false;
  }

  // ✅ CORRIGÉ : Fonction complète
  createHTMLElement() {
    const el = document.createElement('div');
    el.className = `unit ${this.isFriendly ? 'friendly' : 'enemy'}`;
    if (this.stats.isFlying) {
      el.classList.add('flying');
    }
    
    // Couleur selon l'élément
    const elementColors = {
      fire: '#e74c3c',
      water: '#3498db',
      air: '#ecf0f1',
      earth: '#7d5a3b',
      omni: '#9b59b6',
      void: '#2c3e50',
      alliance: '#f39c12'
    };
    
    const color = elementColors[this.elementalType] || elementColors.omni;
    el.style.setProperty('--unit-icon-color', color);
    
    el.innerHTML = `
      <div class="unit-hp-bar">
        <div class="unit-hp-fill"></div>
      </div>
      <span>${this.cardData.icon || '❓'}</span>
    `;
    
    return el;
  }

  update(deltaTime, allUnits, allTowers) {
    if (this.isDead) return;

    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }

    // Recherche de cible
    if (!this.target || this.target.isDead) {
      this.target = this.findNewTarget(allUnits, allTowers);
    }
    else if (this.target.isTower && this.stats.targetPriority !== 'towers') {
        const closerUnit = this.findNewTarget(allUnits, []);
        if (closerUnit) {
            const distToTower = this.getDistanceTo(this.target);
            const distToUnit = this.getDistanceTo(closerUnit);
            if (distToUnit < distToTower && distToUnit < 100) { 
                this.target = closerUnit;
            }
        }
    }

    if (!this.target) {
      return; 
    }

    const distance = this.getDistanceTo(this.target);

    // Attaque si à portée
    if (distance <= this.range) {
      if (this.attackCooldown <= 0) {
        this.performAttack();
        this.attackCooldown = this.attackSpeed;
      }
    } 
    // Déplacement vers la cible
    else {
      if (this.stats.attack >= 0) { // Ne bouge pas si c'est un soigneur statique
        const dx = this.target.position.x - this.position.x;
        const dy = this.target.position.y - this.position.y;
        const vectorX = dx / distance;
        const vectorY = dy / distance;
        
        this.position.x += vectorX * this.speed * deltaTime;
        this.position.y += vectorY * this.speed * deltaTime;
        
        this.updateElementPosition();
      }
    }
  }

  getDistanceTo(target) {
    const dx = target.position.x - this.position.x;
    const dy = target.position.y - this.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  performAttack() {
    if (!this.target || this.isDead) return;
    
    this.audioManager.play('attack');
    
    const attackValue = this.stats.attack || 0;
    
    // Soin si attaque négative
    if (attackValue < 0) {
      this.target.takeDamage(-healAmount);
      return;
    }

    let damage = attackValue;
    
    // Bonus contre bâtiments
    if (this.target.isTower && this.stats.attackBuildingBonus) {
        damage += this.stats.attackBuildingBonus;
    }

    // Calcul élémentaire
    const targetElement = this.target.elementalType || this.target.element || 'omni';
    const multiplier = ElementalCalculator.getMultiplier(this.elementalType, targetElement);
    const finalDamage = Math.floor(damage * multiplier);
    
    this.target.takeDamage(finalDamage);
  }

  updateElementPosition() {
    this.element.style.left = `${this.position.x}px`;
    this.element.style.top = `${this.position.y}px`;
    this.element.style.transform = 'translate(-50%, -50%)';
  }

  findNewTarget(allUnits, allTowers) {
    const enemies = allUnits.filter(u => u.isFriendly !== this.isFriendly && !u.isDead);
    const enemyTowers = allTowers.filter(t => t.isFriendly !== this.isFriendly && !t.isDead);

    let potentialTargets = [];

    // Priorité selon targetPriority
    if (this.stats.targetPriority === 'towers') {
      potentialTargets = [...enemyTowers, ...enemies];
    } else {
      potentialTargets = [...enemies, ...enemyTowers];
    }

    if (potentialTargets.length === 0) return null;

    // Trouve le plus proche
    let closest = potentialTargets[0];
    let minDistance = this.getDistanceTo(closest);

    for (const target of potentialTargets) {
      const dist = this.getDistanceTo(target);
      if (dist < minDistance) {
        minDistance = dist;
        closest = target;
      }
    }

    return closest;
  }

  takeDamage(amount) {
    this.currentHealth -= amount;
    
    if (this.currentHealth > this.maxHealth) {
      this.currentHealth = this.maxHealth;
    }
    
    // ✅ MODIFIÉ : Logique des couleurs de dégâts
    if (amount > 0) { // C'est un dégât
        // Si 'this.isFriendly' (je suis allié), c'est un 'damage-enemy' (rouge)
        // Si '!this.isFriendly' (je suis ennemi), c'est un 'damage-ally' (bleu)
        const damageType = this.isFriendly ? 'damage-enemy' : 'damage-ally';
        this.arenaManager.createFloatingText(amount, this.position, damageType);
    } else { // C'est un soin
        this.arenaManager.createFloatingText(Math.abs(amount), this.position, 'heal');
    }

    // Mise à jour barre de vie
    const hpPercent = (this.currentHealth / this.maxHealth) * 100;
    if (this.healthBarFill) {
        this.healthBarFill.style.width = `${hpPercent}%`;
    }
    
    // Mort
    if (this.currentHealth <= 0 && !this.isDead) {
      this.currentHealth = 0;
      this.isDead = true;
      this.destroy();
    }
  }

  destroy() {
    this.element.classList.add('unit-dying'); 
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.remove();
      }
    }, 500);
  }
}

export default Unit;