class Entity {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });
        
        // Dimensions
        this.width = 0;
        this.height = 0;
        this.scale = 1;
        
        // Assets
        this.spritesheet = null;
        this.animations = [];
        
        // Physics
        this.velocity = { x: 0, y: 0 };
        this.BB = null;
        this.dead = false;
    }

    update() {
        this.updateBB();
    }

    draw(ctx) {
        if (PARAMS.DEBUG && this.BB) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 1;
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }

    updateBB() {
        this.BB = new BoundingBox(
            this.x,
            this.y,
            this.width * this.scale,
            this.height * this.scale
        );
    }

    loadAnimation(xStart, yStart, frameCount, frameDuration) {
        return new Animator(
            this.spritesheet, 
            xStart, yStart, 
            this.width, this.height, 
            frameCount, frameDuration, 
            0, false, true
        );
    }
}

class Block extends Entity {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = PARAMS.BLOCKWIDTH;
        this.height = PARAMS.BLOCKWIDTH;
        this.updateBB();
    }

    draw(ctx) {
        ctx.fillStyle = "saddlebrown";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        super.draw(ctx);
    }
}