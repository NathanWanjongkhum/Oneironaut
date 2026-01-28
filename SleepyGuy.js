const NUM_ANIMATIONS = 2;

class SleepyGuy {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });

        this.game.knight = this;

        this.spritesheet = ASSET_MANAGER.getAsset("./assets/Knight_1/Idle.png");

        this.width = 50;
        this.height = 50;

        this.state = 0; // 0: idle, 1: damaged
        this.currentFrame = 0;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {
        for (let i = 0; i < NUM_ANIMATIONS; i++) {
            this.animations.push([]);
        }

        // this.animations[0][0] = new Animator(this.spritesheet, 0, 0, 128, 128, 4, 0.5, 0, false, true);
    }

    update() {
        const TICK = this.game.clockTick;
    }

    draw(ctx) {
        ctx.fillStyle = "Blue";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // this.animations[this.state][this.currentFrame].drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
    }
}