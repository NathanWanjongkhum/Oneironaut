class Bed {
    constructor(game, positionX, postionY) {
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/bed.png");

        
        this.x = positionX;
        this.y = postionY;
        this.radius = 100;
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
        //TODO: this should be handled in sleepy guy, this is just a temp setup for prototype

        //Collision
        for(var i = 0; i < this.game.entities.length; i++) {
            if(!(this.game.entities[i] instanceof SleepyGuy)) continue;

            if(this.BB.collide(ent.BB)) {
                if(ent instanceof SleepyGuy) {
                    //Win condition
                    this.game.gameWon = true;
                    this.game.gameOver = true;
                }
            }
        }
    
    };

    updateBB() {
        this.lastBB = this.BB;
        this.BB = new BoundingBox(
            this.x,
            this.y,
            540 * this.scale, //540 = sprite pixel size
            460 * this.scale
        );
    }


    collide(other) {
        return getDistance(this, other) < this.radius + other.radius;
    };


    draw(ctx) {
        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    };

}