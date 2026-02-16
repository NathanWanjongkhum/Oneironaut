class Background {
    constructor(game) {
        this.game = game;

        this.layers = [
            ASSET_MANAGER.getAsset("./assets/background/clouds7/1.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds7/2.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds7/3.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds7/4.png")
        ];
    }

    update() {}

    draw(ctx) {
        for (const img of this.layers) {
            ctx.drawImage(img, 0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
        }
    }
    
}