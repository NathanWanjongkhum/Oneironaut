class Bed {
    constructor(game, positionX, postionY) {
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/bed.png");

        
        this.x = positionX;//top left corner position
        this.y = postionY;
        this.radius = 100;
        this.scale = 0.2;
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
        //TODO: this should be handled in sleepy guy, this is just a temp setup for prototype

        //Collision
        for(var i = 0; i < this.game.entities.length; i++) {
            if(!(this.game.entities[i] instanceof SleepyGuy)) continue; //if not sleepy guy ignore

            if(this.BB.collide(this.game.entities[i].BB)) {
                //Win condition
                this.game.gameWon = true;
                this.game.gameOver = true;
            }
        }
    
    };

    updateBB() {
    const w = 540 * this.scale; //540 = sprite pixel width
    const h = 460 * this.scale;
    this.BB = new BoundingBox(
        this.x,
        this.y,
        w,
        h
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