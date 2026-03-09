class Background {
    constructor(game) {
        this.game = game;

        this.level = this.game.currentLevel % 4;
        this.theme = (this.game.menuRoomController?.theme === "day")? 0 : 1;
        
        this.layers = []; //[version][day/night]
        this.parallaxFactors = []; //[version][day/night]
        this.loadlayers();
    }

    update() {
        this.level = this.game.currentLevel % 4;
        this.theme = (this.game.menuRoomController.theme === "day")? 0 : 1;
    }

    draw(ctx) {

        //TODO fiddle with vertical stretch
        const bglayers = this.layers[this.level][this.theme];
        const layerFactors = this.parallaxFactors[this.level][this.theme];
        const verticalScale = 1.5;
        const drawHeight = PARAMS.CANVAS_HEIGHT * verticalScale;
        const scale = drawHeight / bglayers[0].height; //Assumes all layers in a bg are the same height
        const drawWidth = bglayers[0].width * scale; //Assumes all layers in a bg are the same width
        

        for (let i = 0; i < bglayers.length; i++) {
            const img = bglayers[i];
            const factor = layerFactors[i] || 1;

            let offsetX = (this.game.camera.x * factor) % drawWidth;
            if (offsetX < 0) offsetX += drawWidth;
            let y = -this.game.camera.y * factor * 0.5;

            let startX = -offsetX;

            const maxVerticalOffset = drawHeight - PARAMS.CANVAS_HEIGHT;
            y = Math.min(0, Math.max(-maxVerticalOffset, y));
        
            while (startX < PARAMS.CANVAS_WIDTH) {
                ctx.drawImage(img, startX, y, drawWidth, drawHeight);
                startX += drawWidth;
            }
        }
    }

    loadlayers() {
        /*  Img# (Frame count) - short description
            1 (4) - bright day
            2 (4) - bright some stars
            3 (4) - night w moon
            4 (4) - purple dawn
            5 (5) - day
            6 (6) - orange hazy
            7 (4) - orange skies
            8 (6) - purple dusk
            day Imgs = 1, 5, 2, 6
            night Imgs = 3, 8, 4, 7
        */
        // this.layers.push([]);
        // this.parallaxFactors.push([]);
        for (let i = 0; i < 4; i++) {
            this.layers[i] = [];
            this.parallaxFactors[i] = [];
            for (let j = 0; j < 2; j++) {
                this.layers[i][j] = [];
                this.parallaxFactors[i][j] = [];
            }
        }
        this.parallaxFactors.push([]);
        //Pick from layers based on current level
        this.layers[0][0] = [
            ASSET_MANAGER.getAsset("./assets/background/clouds1/1.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds1/2.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds1/3.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds1/4.png")
        ]
        this.parallaxFactors[0][0] = [0.1, 0.25, 0.5, 0.75];
        this.layers[1][0] = [
            ASSET_MANAGER.getAsset("./assets/background/clouds5/1.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds5/2.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds5/3.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds5/4.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds5/5.png")
        ]
        this.parallaxFactors[1][0] = [0.1, 0.2, 0.35, 0.5, 0.8];
        this.layers[2][0] = [
            ASSET_MANAGER.getAsset("./assets/background/clouds2/1.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds2/2.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds2/3.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds2/4.png")
        ]
        this.parallaxFactors[2][0] = [0.1, 0.25, 0.5, 0.75];
        this.layers[3][0] = [
            ASSET_MANAGER.getAsset("./assets/background/clouds6/1.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds6/2.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds6/3.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds6/4.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds6/5.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds6/6.png")
        ]
        this.parallaxFactors[3][0] = [0.1, 0.2, 0.3, 0.4, 0.5, 0.7];
        this.layers[0][1] = [
            ASSET_MANAGER.getAsset("./assets/background/clouds3/1.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds3/2.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds3/3.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds3/4.png")
        ]
        this.parallaxFactors[0][1] = [0.1, 0.25, 0.5, 0.75];
        this.layers[1][1] = [
            ASSET_MANAGER.getAsset("./assets/background/clouds8/1.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds8/2.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds8/3.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds8/4.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds8/5.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds8/6.png")
        ]
        this.parallaxFactors[1][1] = [0.1, 0.2, 0.3, 0.4, 0.5, 0.7];
        this.layers[2][1] = [
            ASSET_MANAGER.getAsset("./assets/background/clouds4/1.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds4/2.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds4/3.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds4/4.png")
        ]
        this.parallaxFactors[2][1] = [0.1, 0.25, 0.5, 0.75];
        this.layers[3][1] = [
            ASSET_MANAGER.getAsset("./assets/background/clouds7/1.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds7/2.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds7/3.png"),
            ASSET_MANAGER.getAsset("./assets/background/clouds7/4.png")
        ]
        this.parallaxFactors[3][1] = [0.1, 0.25, 0.5, 0.75];
    }
}