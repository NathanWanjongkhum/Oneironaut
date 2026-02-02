class EndGame {
    constructor(game) {
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset("./assets/background/menu/endgamemessage.png");

        this.w = 900;
        this.h = 520;
        this.scale = 0.7;
        this.x = (PARAMS.CANVAS_WIDTH / 2) - (this.w * this.scale) / 2;
        this.y = (PARAMS.CANVAS_HEIGHT / 2) - (this.h * this.scale) / 2;
        this.animations = [];
        this.loadAnimations();
    };

    loadAnimations() {
        for(let i = 0; i < 1; i++) {
            this.animations.push([]);
        }
        //spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop
        this.animations[0] = new Animator(this.spritesheet, 0, 0, 900, 520, 1, 1, 0, 0, 1); //win
        this.animations[1] = new Animator(this.spritesheet, 0, 560, 900, 520, 1, 1, 0, 0, 1); //lose
    }

    update() {
        if(this.game.gameOver) {
            this.game.mode = "menu";
        }
    };


    draw(ctx) {
        if (this.game.mode !== "gameplay") {
            if(this.game.gameOver) {
                if(this.game.gameWon) {
                    this.animations[0].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);//won
                } else {
                    this.animations[1].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);//lost
                }
                if (PARAMS.DEBUG) {
                    ctx.strokeStyle = "red";
                    ctx.strokeRect(this.x, this.y, this.w, this.h);
                }
            }
        };
        
    };

}