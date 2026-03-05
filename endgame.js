class EndGame {
    constructor(game) {
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset("./assets/background/menu/endgamemessage.png");

        this.w = 900;
        this.h = 520;
        this.scale = 0.7;
        this.x = (PARAMS.CANVAS_WIDTH / 2) - (this.w * this.scale) / 2;
        this.y = (PARAMS.CANVAS_HEIGHT / 2) - (this.h * this.scale) / 2;
        this.playRect = null;
        this.quitRect = null;

        this.animations = [];
        this.loadAnimations();
    };

    loadAnimations() {

        //spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop
        this.animations[0] = new Animator(this.spritesheet, 0, 0, 900, 520, 1, 1, 0, 0, 1); //win
        this.animations[1] = new Animator(this.spritesheet, 0, 560, 900, 520, 1, 1, 0, 0, 1); //lose
    }

    update() {
        if (!this.game.gameOver) return;

        const click = this.game.click;
        if (!click) return;

        this.game.click = null; // consume click

        if (this.playRect && this.pointInRect(click, this.playRect)) {
            this.game.restartToGameplay();  
            return;
        }

        if (this.quitRect && this.pointInRect(click, this.quitRect)) {
            this.game.restartToMenu();   
            return;
        }

    }



    draw(ctx) {
        if (!this.game.gameOver) return;

        // Draw win/lose image
        if (this.game.gameWon) {
            this.animations[0].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        } else {
            this.animations[1].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        }

        // --- Buttons ---
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;

        const btnW = 260;
        const btnH = 56;
        const gap = 16;

        const x = cw / 2 - btnW / 2;
        const y0 = this.y + this.h * this.scale + 20;

        this.playRect = { x, y: y0, w: btnW, h: btnH };
        this.quitRect = { x, y: y0 + btnH + gap, w: btnW, h: btnH };

        this.drawButton(ctx, this.playRect, "Play Again");
        this.drawButton(ctx, this.quitRect, "Quit to Menu");
    }

    drawButton(ctx, r, label) {
        ctx.save();
        ctx.fillStyle = "white";
        ctx.fillRect(r.x, r.y, r.w, r.h);

        ctx.fillStyle = "black";
        ctx.font = "600 20px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2);
        ctx.restore();
    }

    pointInRect(p, r) {
        return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
    }
}

