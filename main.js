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

ASSET_MANAGER.queueDownload("./assets/entities/bed.png");
ASSET_MANAGER.queueDownload("./assets/entities/ghost1.png");
ASSET_MANAGER.queueDownload("./assets/entities/ghost3.png");
ASSET_MANAGER.queueDownload("./assets/entities/spider.png");
ASSET_MANAGER.queueDownload("./assets/entities/plant1_idle.png");
ASSET_MANAGER.queueDownload("./assets/entities/sheep_shadow.png");
ASSET_MANAGER.queueDownload("./assets/entities/sleepyguy.png");
ASSET_MANAGER.queueDownload("./assets/entities/Bush_simple2_1.png");
ASSET_MANAGER.queueDownload("./assets/entities/Bush_simple2_2.png");
ASSET_MANAGER.queueDownload("./assets/entities/Bush_simple2_3.png");
ASSET_MANAGER.queueDownload("./assets/entities/spikes.png");

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
	PARAMS.DEBUG = false;

	gameEngine.init(ctx);

	gameEngine.mode = "menu";

	gameEngine.currentLevel = 1; //switch to 0 as initial state marking not yet in level?


	// Builds a fresh set of game entities (used for initial load and replay)
	function buildWorld(engine) {
		engine.addEntity(new Background(engine));

		// Level-specific spawns
		Levels.buildLevel(engine)

		// Common entities
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

		engine.inventory?.clear?.();
		engine.swordSwing = null;
		engine.swordCooldown = 0;
		engine.swordSwingId = 0;

		engine.brushSwing = null;
		engine.brushCooldown = 0;
		engine.brushSwingId = 0;

		engine.gridMap = {};        // IMPORTANT: clears old blocks/spikes/sandbags
		engine.blockMap = {};       // optional (you rebuild this anyway)

		engine.brushSwing = null;   // if ToothBrush exists in your build
		engine.brushCooldown = 0;
		engine.brushSwingId = 0;

		engine.prevT = false;
		engine.dreamCatcherActive = false;

		// keep half-sized defaults
		engine.dreamCatcherRadius = 85;
		engine.dreamCatcherMinRadius = 30;
		engine.dreamCatcherMaxRadius = 210;
		engine.dreamCatcherRadiusStep = 10;

		engine.prevLBracket = false;
		engine.prevRBracket = false;

		engine.sandbagCooldown = 0; // so sandbags feel fresh on restart

		// reset SleepDust + TeddyBear state too
		engine.sleepDustCooldown = 0;
		engine.sleepDustSplash = null;

		engine.rocketActive = false;

		engine.sleepMaskTimer = 0;

		engine.teddyCooldown = 0;
		if (engine.teddyDecoy) engine.teddyDecoy.removeFromWorld = true;
		engine.teddyDecoy = null;

		engine.strangeLampTimer = 0;

		engine.prevB = false;
		if (engine.dreamBubble) engine.dreamBubble.close(true);

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

