const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./assets/background/menu/DayDream.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/NightDream.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/DaydreamRoom.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/NightDreamRoom.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/newDream.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/endgamemessage.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/Selected.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/Unselected.png");


ASSET_MANAGER.queueDownload("./assets/background/clouds7/1.png");
ASSET_MANAGER.queueDownload("./assets/background/clouds7/2.png");
ASSET_MANAGER.queueDownload("./assets/background/clouds7/3.png");
ASSET_MANAGER.queueDownload("./assets/background/clouds7/4.png");
  


ASSET_MANAGER.queueDownload("./assets/entities/bed.png")
ASSET_MANAGER.queueDownload("./assets/entities/ghost1.png");
ASSET_MANAGER.queueDownload("./assets/entities/sheep_shadow.png");
ASSET_MANAGER.queueDownload("./assets/entities/sleepyguy.png")


ASSET_MANAGER.downloadAll(() => {
	PARAMS.BLOCKWIDTH = PARAMS.BITWIDTH * PARAMS.SCALE;

	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");

	PARAMS.CANVAS_WIDTH = canvas.width;
	PARAMS.CANVAS_HEIGHT = canvas.height;
	PARAMS.DEBUG = true;

  gameEngine.init(ctx);

  // Builds a fresh set of game entities (used for initial load and replay)
  function buildWorld(engine) {
    engine.addEntity(new Background(engine)); // keep first entity added!

    const spiderPath = [
      { x: 400, y: 100 },
      { x: 600, y: 100 },
      { x: 600, y: 300 },
    ];

    engine.addEntity(new Spider(engine, spiderPath));
    engine.addEntity(new Sheep(engine, 500, 50));
    engine.addEntity(new Ghost(engine, 700, 50));
    engine.addEntity(new Ghost(engine, 775, 350));
    engine.addEntity(new Ghost(engine, 300, 400));
    engine.addEntity(new Bed(engine, 700, 300));
    engine.addEntity(new SleepyGuy(engine, 100, 100));
    engine.addEntity(new WaypointBuilder(engine));
    engine.addEntity(new EndGame(engine));
    engine.addEntity(new MenuRoomController(engine));
  }

  // Clears current world state and rebuilds it
  function resetWorld(engine, mode) {
    engine.gameOver = false;
    engine.gameWon = false;
    engine.mode = mode;

    engine.entities = [];
    engine.sleepyGuy = null;
    engine.waypoints = [];
    engine.click = null; // prevent button-click carryover

    buildWorld(engine);

    // Optional: music switch based on mode
    if (window.setMusicMode) {
      window.setMusicMode(mode === "menu" ? "menu" : "dream");
    }
  }

  gameEngine.restartToGameplay = () => resetWorld(gameEngine, "gameplay");
  gameEngine.restartToMenu = () => resetWorld(gameEngine, "menu");

  // Initial world
  buildWorld(gameEngine);

  // Start engine loop
  gameEngine.start();

  // Start music after any user interaction
  canvas.addEventListener("pointerdown", tryStartMusic);

  window.addEventListener("keydown", (e) => {
      if (!gameEngine.gameOver) return;
      if (e.key === "r" || e.key === "R") gameEngine.restartToGameplay();
      if (e.key === "Escape") gameEngine.restartToMenu();
  });
});

//TODO: This belongs in its own file/controller. Main should not have this music handling!
// Music (starts on first click / tap)
const MUSIC = {
  mode: "menu", // "menu" or "dream"
  started: false,
  tracks: {
    menu: new Audio("./assets/music/Oneironaut.mp3"),
    dream: new Audio("./assets/music/Lucid_Journey.mp3"),
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
