const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

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

	gameEngine.init(ctx);

	gameEngine.start();
});

gameEngine.addEntity(new Ghost(gameEngine, 300, 400));
gameEngine.addEntity(new SleepyGuy(gameEngine, 100, 100));
gameEngine.addEntity(new WaypointBuilder(gameEngine));
gameEngine.addEntity(new Background(gameEngine));//keep this last!