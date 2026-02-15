const ASSET_MANAGER = new AssetManager();
const gameEngine = new GameEngine();

ASSET_MANAGER.queueDownload("./assets/background/menu/DayDream.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/NightDream.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/DaydreamRoom.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/NightDreamRoom.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/newDream.png");
ASSET_MANAGER.queueDownload("./assets/background/menu/endgamemessage.png");

ASSET_MANAGER.queueDownload("./assets/background/clouds7/1.png");
ASSET_MANAGER.queueDownload("./assets/background/clouds7/2.png");
ASSET_MANAGER.queueDownload("./assets/background/clouds7/3.png");
ASSET_MANAGER.queueDownload("./assets/background/clouds7/4.png");

ASSET_MANAGER.queueDownload("./assets/InventorySlots.png");
ASSET_MANAGER.queueDownload("./assets/entities/bed.png");
ASSET_MANAGER.queueDownload("./assets/entities/ghost1.png");
ASSET_MANAGER.queueDownload("./assets/entities/sleepyguy.png");

// Items
ASSET_MANAGER.queueDownload("./assets/items/Sword.png");
ASSET_MANAGER.queueDownload("./assets/items/ToothBrush.png");
ASSET_MANAGER.queueDownload("./assets/items/TeddyBear.png");
ASSET_MANAGER.queueDownload("./assets/items/SleepDust.png");
ASSET_MANAGER.queueDownload("./assets/items/SandBag1.png");
ASSET_MANAGER.queueDownload("./assets/items/SandBag3.png");

ASSET_MANAGER.queueDownload("./assets/items/DreamCatcher.png");
ASSET_MANAGER.queueDownload("./assets/items/Rocket.png");
ASSET_MANAGER.queueDownload("./assets/items/SleepMask.png");
ASSET_MANAGER.queueDownload("./assets/items/TheStrangeLamp.png");
ASSET_MANAGER.queueDownload("./assets/items/Pijama.png");

ASSET_MANAGER.queueDownload("./assets/items/DreamBubble.png");

ASSET_MANAGER.downloadAll(() => {
	PARAMS.BLOCKWIDTH = PARAMS.BITWIDTH * PARAMS.SCALE;

	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");

	PARAMS.CANVAS_WIDTH = canvas.width;
	PARAMS.CANVAS_HEIGHT = canvas.height;

	gameEngine.init(ctx);
	gameEngine.start();

	gameEngine.mode = "menu";
	gameEngine.entities = [];
	gameEngine.addEntity(new MenuRoomController(gameEngine));

	// TEST: drop some items near the player
	gameEngine.addEntity(new PickupItem(gameEngine, 220, 140, "Sword"));
	gameEngine.addEntity(new PickupItem(gameEngine, 280, 140, "ToothBrush"));
	gameEngine.addEntity(new PickupItem(gameEngine, 340, 140, "TeddyBear"));

	gameEngine.addEntity(new PickupItem(gameEngine, 220, 220, "DreamCatcher"));
	gameEngine.addEntity(new PickupItem(gameEngine, 280, 220, "Rocket"));
	gameEngine.addEntity(new PickupItem(gameEngine, 340, 220, "Pajama"));


	Music.init();
	if (window.setMusicMode) window.setMusicMode("menu");

	// tryStart once (prevents repeated calls)
	canvas.addEventListener("pointerdown", () => Music.tryStart(), { once: true });
});