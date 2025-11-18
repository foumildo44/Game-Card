// src/main.js - VERSION AVEC SAUVEGARDE & AUDIO
import GameManager from './GameManager.js';
import UIManager from './UIManager.js';
import ArenaManager from './ArenaManager.js';
import CardDatabase from './data/CardDatabase.js';
import SaveManager from './utils/SaveManager.js';
import Player from './models/Player.js';
import AudioManager from './AudioManager.js'; // <- AJOUT

// État global
const State = {
    gameManager: null,
    uiManager: null,
    arenaManager: null,
    audioManager: null, // <- AJOUT
};

// Point d'entrée quand le DOM est chargé
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM chargé. Initialisation du jeu...");

    const arenaEl = document.getElementById('arena');
    const unitContainerEl = document.getElementById('unit-container');

    if (!arenaEl || !unitContainerEl) {
        console.error("Éléments d'arène critiques manquants ! Vérifiez index.html.");
        return;
    }

    // 1. Initialiser la base de données
    const cardDatabase = new CardDatabase();
    
    // 2. Initialiser le Manager Audio
    State.audioManager = new AudioManager();
    
    // 3. Initialiser le Player (avec chargement de sauvegarde)
    const player = new Player(cardDatabase);
    const savedData = SaveManager.load();
    if (savedData) {
        player.loadData(savedData);
    } else {
        player.initializeStarterCollection();
    }
    
    // 4. Initialiser les managers
    State.arenaManager = new ArenaManager(arenaEl, unitContainerEl, State.audioManager);
    
    // 5. Initialiser le GameManager (le coeur du jeu)
    State.gameManager = new GameManager(
        State.arenaManager, 
        null, // L'UIManager sera créé juste après
        cardDatabase,
        player,
        State.audioManager // <- Injecte l'audio
    );

    // 6. Initialiser l'UIManager
    State.uiManager = new UIManager(State.gameManager);
    
    // 7. Connecter l'UIManager au GameManager
    State.gameManager.uiManager = State.uiManager;

    // 8. Démarrer le jeu !
    try {
        State.gameManager.init(); // Ceci va afficher le Menu Principal
        console.log("✅ Jeu initialisé ! Affichage du Menu.");
    } catch (e) {
        console.error("❌ Erreur lors de l'initialisation du jeu:", e);
    }
});