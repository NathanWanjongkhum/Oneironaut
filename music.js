// music.js
// Global Music manager (no modules). Works with your current script-tag setup.

(function () {
  const Music = {
    started: false,
    mode: "menu",
    muted: false,
    userVolume: 0.10,

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

      if (volEl) {
        this.userVolume = Number(volEl.value);
        volEl.addEventListener("input", () => {
          this.setVolume(Number(volEl.value));
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
      a.play().catch(() => {});
      this._applyVolume();
    },

    setMuted(m) {
      this.muted = m;
      this._applyVolume();
    },

    setVolume(v) {
      this.userVolume = Math.max(0, Math.min(1, v));
      this._applyVolume();
    },

    _applyVolume() {
      const vol = this.muted ? 0 : this.userVolume;

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