class Background {
    constructor(game) {
        this.game = game;

        const world = game.currentWorld || "daydream";

        if (world === "lucidsunset") {
            this.layers = [
                ASSET_MANAGER.getAsset("./assets/background/clouds8/Clouds8.png")
            ];

        } else if (world === "nightfall") {
            this.layers = [
                ASSET_MANAGER.getAsset("./assets/background/clouds9/Clouds8.png")
            ];

        } else { // daydream
            this.layers = [
                ASSET_MANAGER.getAsset("./assets/background/clouds7/1.png"),
                ASSET_MANAGER.getAsset("./assets/background/clouds7/2.png"),
                ASSET_MANAGER.getAsset("./assets/background/clouds7/3.png"),
                ASSET_MANAGER.getAsset("./assets/background/clouds7/4.png")
            ];
        }
    }

    update() {}

    draw(ctx) {
        for (const img of this.layers) {
            if (!img) continue;
            ctx.drawImage(img, 0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
        }
    }
}