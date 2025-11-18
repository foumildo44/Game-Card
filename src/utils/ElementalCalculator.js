// src/utils/ElementalCalculator.js
// Gère la logique de multiplicateur de dégâts élémentaires.

class ElementalCalculator {
  /**
   * Calcule le multiplicateur de dégâts en fonction des éléments.
   * @param {string} attackerElement - L'élément de l'attaquant (fire, water, air, earth, omni, void...)
   * @param {string} defenderElement - L'élément du défenseur
   * @returns {number} - Le multiplicateur de dégâts (ex: 1.3, 1.0, 0.7)
   */
  static getMultiplier(attackerElement, defenderElement) {
    if (!attackerElement || !defenderElement) return 1.0;

    // Omni (dégât pur) et Void (défense pure) ne sont pas dans le cycle.
    if (attackerElement === 'omni' || defenderElement === 'omni' || 
        attackerElement === 'void' || defenderElement === 'void' ||
        attackerElement === 'alliance') { // Alliance est spécial
      return 1.0;
    }

    const strongVs = {
      fire: 'earth',
      earth: 'air',
      air: 'water',
      water: 'fire',
    };

    // Dégâts augmentés
    if (strongVs[attackerElement] === defenderElement) {
      return 1.3; // +30%
    }

    // Dégâts réduits
    if (strongVs[defenderElement] === attackerElement) {
      return 0.7; // -30%
    }

    return 1.0; // Neutre
  }
}

export default ElementalCalculator;