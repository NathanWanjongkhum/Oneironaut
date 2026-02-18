const ASSET_MANAGER = new AssetManager();
const gameEngine = new GameEngine();

ASSET_MANAGER.queueDownload("./assets/background/menu/DayDream.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/NightDream.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/DaydreamRoom.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/NightDreamRoom.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/newDream.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/endgamemessage.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/Selected.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/Unselected.png");

// Level select background (corridor)
ASSET_MANAGER.queueDownload("./assets/background/selectLevel/LevelSelectCorridor.png");
ASSET_MANAGER.queueDownload("./assets/background/selectLevel/unlockedLevel.png");
ASSET_MANAGER.queueDownload("./assets/background/selectLevel/lockedLevel.png");



ASSET_MANAGER.queueDownload("./assets/background/clouds7/1.png");
ASSET_MANAGER.queueDownload("./assets/background/clouds7/2.png");
ASSET_MANAGER.queueDownload("./assets/background/clouds7/3.png");
ASSET_MANAGER.queueDownload("./assets/background/clouds7/4.png");

//ASSET_MANAGER.queueDownload("./assets/InventorySlots.png");
  


ASSET_MANAGER.queueDownload("./assets/entities/bed.png");
ASSET_MANAGER.queueDownload("./assets/entities/ghost1.png");
ASSET_MANAGER.queueDownload("./assets/entities/ghost3.png");
ASSET_MANAGER.queueDownload("./assets/entities/spider.png");
ASSET_MANAGER.queueDownload("./assets/entities/plant1_idle.png");
ASSET_MANAGER.queueDownload("./assets/entities/sheep_shadow.png");
ASSET_MANAGER.queueDownload("./assets/entities/sleepyguy.png");

// Items
ASSET_MANAGER.queueDownload("./assets/items/Sword.png");
ASSET_MANAGER.queueDownload("./assets/items/ToothBrush.png");
ASSET_MANAGER.queueDownload("./assets/items/TeddyBear.png");
ASSET_MANAGER.queueDownload("./assets/items/SleepDust.png");
//ASSET_MANAGER.queueDownload("./assets/items/SandBag1.png");
ASSET_MANAGER.queueDownload("./assets/items/SandBag3.png");

ASSET_MANAGER.queueDownload("./assets/items/DreamCatcher.png");
ASSET_MANAGER.queueDownload("./assets/items/Rocket.png");
ASSET_MANAGER.queueDownload("./assets/items/SleepMask.png");
ASSET_MANAGER.queueDownload("./assets/items/TheStrangeLamp.png");
ASSET_MANAGER.queueDownload("./assets/items/Pijama.png");

ASSET_MANAGER.queueDownload("./assets/items/DreamBubble.png");


ASSET_MANAGER.downloadAll(() => {
  PARAMS.BITWIDTH = 32;
  PARAMS.SCALE = 1;
	PARAMS.BLOCKWIDTH = PARAMS.BITWIDTH * PARAMS.SCALE;

	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");

	PARAMS.CANVAS_WIDTH = canvas.width;
	PARAMS.CANVAS_HEIGHT = canvas.height;
	PARAMS.DEBUG = true;

  gameEngine.init(ctx);

  gameEngine.mode = "menu";

  gameEngine.currentLevel = 1;


  // Builds a fresh set of game entities (used for initial load and replay)
  function buildWorld(engine) {
    engine.addEntity(new Background(engine));

    // Level-specific spawns
    if (engine.currentLevel === 1) {
      engine.addEntity(new Ghost(engine, 700, 50));
      engine.addEntity(new Ghost(engine, 775, 350));
      engine.addEntity(new Ghost(engine, 300, 400));
      engine.addEntity(new Sheep(engine, 500, 50));

    } else if (engine.currentLevel === 2) {
      const spiderPath = [
        { x: 400, y: 0 },
        { x: 600, y: 0 },
      ];
      // Add blocks 
      const builder = new LevelBuilder(engine);

      builder.spawnRow(15, 0, 20); 
      builder.spawnBlock(5, 14);
      builder.spawnBlock(5, 13);

      engine.addEntity(new Demon(engine, 300, 400))
      engine.addEntity(new Sheep(engine, 100, 200));
      engine.addEntity(new Spider(engine, spiderPath));
      engine.addEntity(new Ghost(engine, 700, 50));

    } else {
      // default/fallback
      engine.addEntity(new Ghost(engine, 700, 50));
      // Collection of some items - for demonstration purposes
      gameEngine.addEntity(new PickupItem(gameEngine, 220, 140, "Sword"));
      gameEngine.addEntity(new PickupItem(gameEngine, 280, 140, "ToothBrush"));
      gameEngine.addEntity(new PickupItem(gameEngine, 340, 140, "TeddyBear"));

      gameEngine.addEntity(new PickupItem(gameEngine, 220, 220, "DreamCatcher"));
      gameEngine.addEntity(new PickupItem(gameEngine, 280, 220, "Rocket"));
      gameEngine.addEntity(new PickupItem(gameEngine, 340, 220, "Pajama"));
    }

    // Common entities
    engine.addEntity(new Bed(engine, 700, 300));
    engine.addEntity(new SleepyGuy(engine, 100, 100));
    engine.addEntity(new WaypointBuilder(engine));
    engine.addEntity(new EndGame(engine));
    engine.addEntity(new MenuRoomController(engine));

    engine.blockMap = {};

    engine.entities.forEach(e => { // Keep this last
        if (e instanceof Block) {
            const gx = Math.floor(e.x / PARAMS.BLOCKWIDTH);
            const gy = Math.floor(e.y / PARAMS.BLOCKWIDTH);
            
            engine.blockMap[`${gx},${gy}`] = e;
        }
    });  
}


  // Clears current world state and rebuilds it
  function resetWorld(engine, mode, levelId = engine.currentLevel) {
    engine.gameOver = false;
    engine.gameWon = false;
    engine.mode = mode;
    engine.currentLevel = levelId;

    engine.entities = [];
    engine.sleepyGuy = null;
    engine.waypoints = [];
    engine.click = null;

    buildWorld(engine);

    if (window.setMusicMode) {
      window.setMusicMode(mode === "menu" ? "menu" : "dream");
    }
  }


  gameEngine.restartToGameplay = () => resetWorld(gameEngine, "gameplay", gameEngine.currentLevel);
  gameEngine.restartToMenu = () => resetWorld(gameEngine, "menu", gameEngine.currentLevel);
  gameEngine.startLevel = (levelId) => resetWorld(gameEngine, "gameplay", levelId);

  // Initial world starts in menu mode
  gameEngine.mode = "menu";
  buildWorld(gameEngine);

  // Start engine loop
  gameEngine.start();

  // Start music after any user interaction
  canvas.addEventListener("pointerdown", Music.tryStartMusic);

  window.addEventListener("keydown", (e) => {
      if (!gameEngine.gameOver) return;
      if (e.key === "r" || e.key === "R") gameEngine.restartToGameplay();
      if (e.key === "Escape") gameEngine.restartToMenu();
  });


  Music.init();
  if (window.setMusicMode) window.setMusicMode("menu");

  // tryStart once (prevents repeated calls)
  canvas.addEventListener("pointerdown", () => Music.tryStart(), { once: true });

});






