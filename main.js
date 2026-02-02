// Music (starts on first click / tap)
const MUSIC = {
  mode: "menu", // "menu" or "dream"
  started: false,
  tracks: {
    menu: new Audio("./Oneironaut.mp3"),
    dream: new Audio("./Lucid_Journey.mp3"),
  },
};

for (const k in MUSIC.tracks) {
  MUSIC.tracks[k].loop = true;
  MUSIC.tracks[k].volume = 0.55;
  MUSIC.tracks[k].preload = "auto";
}

function stopAllMusic() {
  for (const k in MUSIC.tracks) {
    const a = MUSIC.tracks[k];
    a.pause();
    a.currentTime = 0;
  }
}

function playMusic(mode) {
  MUSIC.mode = mode;
  if (!MUSIC.started) return;

  stopAllMusic();
  const a = MUSIC.tracks[mode];
  a.play().catch(() => {});
}

// Expose so MenuRoomController can call it
window.setMusicMode = playMusic;

function tryStartMusic() {
  if (MUSIC.started) return;

  const a = MUSIC.tracks[MUSIC.mode];
  a.play()
    .then(() => (MUSIC.started = true))
    .catch(() => (MUSIC.started = false));
}

// ---- Asset loading ----
const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./DayDream.png");
ASSET_MANAGER.queueDownload("./NightDream.png");
ASSET_MANAGER.queueDownload("./DaydreamRoom.png");
ASSET_MANAGER.queueDownload("./NightDreamRoom.png");
ASSET_MANAGER.queueDownload("./newDream.png");

ASSET_MANAGER.queueDownload("./assets/background/clouds7/1.png");
ASSET_MANAGER.queueDownload("./assets/background/clouds7/2.png");
ASSET_MANAGER.queueDownload("./assets/background/clouds7/3.png");
ASSET_MANAGER.queueDownload("./assets/background/clouds7/4.png");
ASSET_MANAGER.queueDownload("./assets/ghost1.png");
ASSET_MANAGER.queueDownload("./assets/sleepyguy.png")

ASSET_MANAGER.downloadAll(() => {
	PARAMS.BLOCKWIDTH = PARAMS.BITWIDTH * PARAMS.SCALE;

  const canvas = document.getElementById("gameWorld");
  const ctx = canvas.getContext("2d");

	PARAMS.CANVAS_WIDTH = canvas.width;
	PARAMS.CANVAS_HEIGHT = canvas.height;

  const game = new GameEngine();
  game.init(ctx);

  game.addEntity(new MenuRoomController(game));

  // Start music after any user interaction
  canvas.addEventListener("pointerdown", tryStartMusic);

  game.start();
});

gameEngine.addEntity(new Ghost(gameEngine, 300, 400));
gameEngine.addEntity(new SleepyGuy(gameEngine, 100, 100));
gameEngine.addEntity(new WaypointBuilder(gameEngine));
gameEngine.addEntity(new Background(gameEngine));//keep this last!