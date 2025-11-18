// src/AudioManager.js
// ✅ VERSION CORRIGÉE : Noms des fichiers musicaux réparés
// ✅ VERSION CORRIGÉE : Ne plante pas si un MP3 est corrompu

class AudioManager {
  constructor() {
    this.sounds = {};
    this.isMuted = false;
    
    this.currentMusic = null; // L'objet Audio de la musique en cours
    this.currentMusicTrack = null; // La clé (ex: 'music_menu')
    this.fadeInterval = null; // Pour gérer le fondu
    
    // --- Pré-charger les sons ---
    this.loadSound('click', 'sounds/ui_click.mp3');
    this.loadSound('start_battle', 'sounds/battle_start.mp3');
    this.loadSound('victory', 'sounds/victory_fanfare.mp3');
    this.loadSound('defeat', 'sounds/defeat_sound.mp3');
    this.loadSound('spawn', 'sounds/spawn_unit.mp3');
    this.loadSound('spell', 'sounds/spell_cast.mp3');
    this.loadSound('attack', 'sounds/attack_hit.mp3');
    this.loadSound('buy', 'sounds/buy_item.mp3');
    this.loadSound('gacha', 'sounds/gacha_open.mp3');
    this.loadSound('upgrade', 'sounds/upgrade_card.mp3');
    this.loadSound('reward', 'sounds/quest_reward.mp3');
    
    // --- Pré-charger la musique (Noms de fichiers CORRIGÉS) ---
    this.loadSound('music_menu', 'sounds/music_menu.mp3', true);
    this.loadSound('music_hub', 'sounds/music_hub.mp3', true);
    this.loadSound('music_battle', 'sounds/music_battle.mp3', true);
  }

  loadSound(key, path, isMusic = false) {
    if (this.sounds[key]) return;
    try {
      const audio = new Audio(path);
      audio.preload = 'auto';
      if (isMusic) {
        audio.loop = true;
      }
      this.sounds[key] = audio;
    } catch (e) {
      console.error(`Impossible de charger le son: ${key} depuis ${path}`, e);
    }
  }

  play(key) {
    if (this.isMuted || !this.sounds[key]) {
      return;
    }
    try {
      this.sounds[key].currentTime = 0;
      this.sounds[key].play().catch(e => {
        if (e.name !== 'AbortError') {
          console.warn(`Impossible de jouer le son ${key}:`, e);
        }
      });
    } catch (e) {
      console.error(`Erreur de lecture (fichier corrompu?) ${key}:`, e);
    }
  }

  playMusic(key, fadeTime = 1000) {
    if (!this.sounds[key]) {
        console.warn(`Musique non trouvée: ${key}`);
        return; 
    }
    
    if (this.currentMusicTrack === key) {
        return; 
    }
    
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    if (this.currentMusic) {
      this.fadeVolume(this.currentMusic, 0, fadeTime, () => {
        this.currentMusic.pause();
      });
    }

    const newMusic = this.sounds[key];
    this.currentMusic = newMusic;
    this.currentMusicTrack = key;
    
    newMusic.currentTime = 0;
    newMusic.volume = 0;
    
    // ✅ CORRECTION DE ROBUSTESSE
    try {
      const playPromise = newMusic.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          if(e.name === "NotAllowedError") {
              console.warn("L'audio sera joué après la première interaction de l'utilisateur.");
          } else {
              // Affiche l'erreur (ex: NotSupportedError) mais ne plante pas
              console.warn(`Erreur de lecture audio (${key}):`, e);
          }
        }).then(() => {
            // S'il réussit, on joue la musique
            if (!this.isMuted && newMusic.paused === false) { // Vérifie s'il est bien en train de jouer
                this.fadeVolume(newMusic, 1, fadeTime);
            }
        });
      }
    } catch (e) {
        console.error(`Impossible de jouer ${key} (fichier corrompu?):`, e);
    }
  }
  
  stopAllMusic(fadeTime = 1000) {
    if (this.currentMusic) {
      this.fadeVolume(this.currentMusic, 0, fadeTime, () => {
        this.currentMusic.pause();
        this.currentMusic = null;
        this.currentMusicTrack = null;
      });
    }
    this.currentMusicTrack = null;
  }

  fadeVolume(audio, targetVolume, duration, onComplete = null) {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }
    
    const steps = 50;
    const interval = duration / steps;
    const startVolume = audio.volume;
    const delta = (targetVolume - startVolume) / steps;
    
    let currentStep = 0;

    this.fadeInterval = setInterval(() => {
      currentStep++;
      let newVolume = startVolume + (delta * currentStep);
      
      if (newVolume < 0) newVolume = 0;
      if (newVolume > 1) newVolume = 1;
      
      try {
          if (Math.abs(newVolume - targetVolume) < 0.01 || currentStep >= steps) {
            audio.volume = targetVolume;
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
            if (onComplete) {
              onComplete();
            }
          } else {
            audio.volume = newVolume;
          }
      } catch (e) {
          // Si l'audio plante en cours de fondu, on arrête tout
          console.warn("Erreur pendant le fondu audio, arrêt.", e);
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
      }
    }, interval);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.currentMusic) this.currentMusic.volume = 0;
    } else {
      if (this.currentMusic) this.currentMusic.volume = 1;
    }
  }
}

export default AudioManager;