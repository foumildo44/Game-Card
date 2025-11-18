// src/models/Card.js
// Représente une carte dans le deck ou la main du joueur.

class Card {
  constructor(cardData) {
    this.id = cardData.id;
    this.name = cardData.name;
    this.cost = cardData.cost;
    this.type = cardData.type;
    this.icon = cardData.icon;
    this.description = cardData.description;
    
    // Garde une référence à toutes les données de la base
    this.rawData = cardData;
  }
}

export default Card;