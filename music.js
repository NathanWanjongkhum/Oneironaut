// music.js
// Global Music manager (no modules). Works with your current script-tag setup.

(function () {
  const clamp01 = (v) => Math.max(0, Math.min(1, Number(v) || 0));

  const Music = {
    started: false,
    mode: "menu",
    muted: false,

    // NEW
    masterVolume: 1.0,
    musicVolume: 0.10,

    // Compatibility with your older code
    get userVolume() {
      return this.musicVolume;
    },
    set userVolume(v) {
      this.musicVolume = clamp01(v);
    },

    tracks: {
      menu: new Audio("./assets/music/Oneironaut.mp3"),

      // World themes
      daydream: new Audio("./assets/music/DayDream1-1.mp3"),
      lucidsunset: new Audio("./assets/music/LucidSunset 2-1.mp3"),
      nightfall: new Audio("./assets/music/NightFall 3-1.mp3"),
    },

    init() {
      for (const k in this.tracks) {
        const a = this.tracks[k];
        a.loop = true;
        a.preload = "auto";
      }

      const muteEl = document.getElementById("mute");
      const volEl = document.getElementById("volume");

      if (muteEl) {
        this.muted = !!muteEl.checked;
        muteEl.addEventListener("change", () => {
          this.setMuted(!!muteEl.checked);
        });
      }

      // keep old HTML slider working as MUSIC volume only
      if (volEl) {
        this.musicVolume = clamp01(Number(volEl.value));
        volEl.addEventListener("input", () => {
          this.setMusicVolume(Number(volEl.value));
        });
      }

      this._applyVolume();
    },

    tryStart() {
      if (this.started) return;

      const a = this.tracks[this.mode];
      if (!a) return;

      a.play()
        .then(() => {
          this.started = true;
          this._applyVolume();
        })
        .catch(() => {
          this.started = false;
        });
    },

    stopAll() {
      for (const k in this.tracks) {
        const a = this.tracks[k];
        a.pause();
        a.currentTime = 0;
      }
    },

    setMode(mode) {
      if (!this.tracks[mode]) {
        console.warn("Music mode not found:", mode);
        return;
      }

      this.mode = mode;
      if (!this.started) return;

      this.stopAll();
      const a = this.tracks[mode];
      a.play().catch(() => { });
      this._applyVolume();
    },

    setMuted(m) {
      this.muted = !!m;
      this._applyVolume();
    },

    setMasterVolume(v) {
      this.masterVolume = clamp01(v);
      this._applyVolume();
    },

    setMusicVolume(v) {
      this.musicVolume = clamp01(v);
      this._applyVolume();
    },

    // compatibility alias
    setVolume(v) {
      this.setMusicVolume(v);
    },

    getAudibleMaster() {
      return this.muted ? 0 : this.masterVolume;
    },

    _applyVolume() {
      const vol = this.getAudibleMaster() * this.musicVolume;

      for (const k in this.tracks) {
        this.tracks[k].volume = vol;
      }
    },
  };

  window.Music = Music;

  window.setMusicMode = function (mode) {
    Music.setMode(mode);
  };
})();
