class Bed {
    constructor(game, positionX, postionY) {
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/bed.png");

        this.x = positionX;
        this.y = postionY;

        this.width = 540;
        this.height = 460;
        this.scale = 0.5;
     
        this.BB = null;

        this.animations = [];
        this.loadAnimations();
        this.updateBB();
    };

    loadAnimations() {
        for(let i = 0; i < 1; i++) {
            this.animations.push([]);
        }
        //spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop
        this.animations[0] = new Animator(this.spritesheet, 0, 0, 540, 460, 1, 1, 0, 0, 1); //bed
    }

    update() {
    if (this.game.mode !== "gameplay") return;
    };

    updateBB() {
    const w = this.width * this.scale;
    const h = this.height * this.scale;

    this.BB = new BoundingBox(
        this.x + w * 0.12,
        this.y + h * 0.35,
        w * 0.76,
        h * 0.45
    );
}


    collide(other) {
        return getDistance(this, other) < this.radius + other.radius;
    };


    draw(ctx) {
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        if (PARAMS.DEBUG && this.BB) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    };

}