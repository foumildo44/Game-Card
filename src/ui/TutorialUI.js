// src/ui/TutorialUI.js
// ✅ VERSION COMPLÈTE - Marque le tutoriel comme complété

class TutorialUI {
  constructor(uiManager) {
    this.uiManager = uiManager;
    this.container = document.getElementById('tutorial-screen');
  }

  render() {
    console.log("📚 Rendu du Tutoriel");
    
    this.container.innerHTML = `
      <div class="tutorial-wrapper">
        <div class="tutorial-content custom-scrollbar">
          <h1>Bienvenue, Héros !</h1>
          
          <h3>Objectif du Jeu</h3>
          <p>
            Bienvenue dans Dark Fantasy Arena ! Votre objectif est simple : utilisez vos cartes pour invoquer des unités et lancer des sorts afin de détruire la **Tour Principale** de votre adversaire avant la fin du temps imparti.
          </p>
          <p>
            Chaque carte coûte de **l'Élixir**, qui se régénère automatiquement. Gérez votre Élixir avec sagesse pour submerger votre ennemi !
          </p>

          <h3>Synergies Élémentaires</h3>
          <p>
            Chaque carte possède un élément. Utiliser le bon élément contre un autre inflige **+30% de dégâts** (FORT). Utiliser le mauvais inflige **-30% de dégâts** (FAIBLE).
          </p>
          <div class="element-synergy">
            <span class="fire">🔥 Feu</span> > <span class="earth">🧱 Terre</span>
          </div>
          <div class="element-synergy">
            <span class="earth">🧱 Terre</span> > <span class="air">🍃 Air</span>
          </div>
          <div class="element-synergy">
            <span class="air">🍃 Air</span> > <span class="water">💧 Eau</span>
          </div>
          <div class="element-synergy">
            <span class="water">💧 Eau</span> > <span class="fire">🔥 Feu</span>
          </div>

          <h3>Éléments Spéciaux</h3>
          <p>
            Certains éléments sont spéciaux et n'ont ni force ni faiblesse :
          </p>
          <div class="element-synergy">
            <span class="omni">☯️ Omni</span>
            <span class="void">💀 Vide</span>
          </div>
        </div>
        
        <button id="btn-tutorial-continue" class="action-card-btn">Commencer l'Aventure</button>
      </div>
    `;
    this.attachEvents();
  }

  attachEvents() {
    const btn = document.getElementById('btn-tutorial-continue');
    if (!btn) {
      console.error("❌ Bouton tutoriel introuvable !");
      return;
    }

    btn.addEventListener('click', () => {
      console.log("🎯 Bouton tutoriel cliqué");
      
      // Vérifier que tout est prêt
      if (!this.uiManager || !this.uiManager.gameManager) {
        console.error("❌ UIManager ou GameManager manquant !");
        return;
      }

      const player = this.uiManager.gameManager.player;
      if (!player) {
        console.error("❌ Player non initialisé !");
        return;
      }

      console.log("✅ Player OK:", player.name, "Niveau:", player.level);

      // ✅✅✅ CRITIQUE : Marque le tutoriel comme complété
      player.completeTutorial();
      console.log("✅ Tutoriel marqué comme complété");

      // Jouer le son
      if (this.uiManager.audioManager) {
        this.uiManager.audioManager.play('click');
      }

      // Aller au Hub
      console.log("🚀 Navigation vers le Hub...");
      this.uiManager.showScreen('hub');
    });
  }
}

export default TutorialUI;