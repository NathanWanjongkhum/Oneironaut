// music.js
// Global Music manager (no modules). Works with your current script-tag setup.

(function () {
  const Music = {
    started: false,
    mode: "menu", // "menu" or "dream"
    muted: false,
    userVolume: 0.10, // matches your HTML slider default

    tracks: {
      menu: new Audio("./assets/music/Oneironaut.mp3"),
      dream: new Audio("./assets/music/DayDream1-1.mp3"),
    },

    init() {
      // configure tracks
      for (const k in this.tracks) {
        const a = this.tracks[k];
        a.loop = true;
        a.preload = "auto";
      }

      // read UI (if present)
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

      // apply initial volume/mute
      this._applyVolume();
    },

    tryStart() {
      if (this.started) return;

      const a = this.tracks[this.mode];
      // must be called from a user gesture
      a.play()
        .then(() => {
          this.started = true;
          // ensure correct volume after playback starts
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
      // v expected 0..1
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

  // expose globally
  window.Music = Music;

  // keep compatibility with your existing MenuRoomController calls
  window.setMusicMode = function (mode) {
    Music.setMode(mode);
  };
})();
