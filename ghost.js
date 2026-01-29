class Ghost {
    constructor(game) {
        this.game = game;
        this.spritesheet1 = ASSET_MANAGER.getAsset("./assets/ghost1.png");
        this.spritesheet2 = ASSET_MANAGER.getAsset("./assets/ghost1.png");
        this.spritesheet3 = ASSET_MANAGER.getAsset("./assets/ghost1.png");
        
        this.x = 0;
        this.y = 10;
        this.velocity = { x: 0, y: 0 };
        this.scale = 2;
        this.state = 0;
        this.type = 0;
        this.facing = { x: 0, y: 0 };
        this.dead = false;

        this.animations = [];
        this.loadAnimations();
    };

    loadAnimations() {
        for(let i = 0; i < 10; i++) { //states
            this.animations.push([]);
            for(let j = 0; j < 3; j++) { //ghost version
                this.animations.push([]);
            }
        }

        //spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop
        this.animations[0][0] = new Animator(this.spritesheet1, 0, 0, 128, 128, 5, 0.3, 0, 0, 1); //idle
        this.animations[1][0] = new Animator(this.spritesheet1, 0, 128, 128, 128, 5, 0.2, 0, 0, 1); //walk
        this.animations[2][0] = new Animator(this.spritesheet1, 0, 256, 128, 128, 5, 0.2, 0, 0, 1); //run
        this.animations[3][0] = new Animator(this.spritesheet1, 0, 384, 128, 128, 4, 0.2, 0, 0, 1); //attack1
        this.animations[4][0] = new Animator(this.spritesheet1, 0, 512, 128, 128, 4, 0.2, 0, 0, 1); //attack2
        this.animations[5][0] = new Animator(this.spritesheet1, 0, 640, 128, 128, 7, 0.2, 0, 0, 1); //attack3
        this.animations[6][0] = new Animator(this.spritesheet1, 0, 768, 128, 128, 7, 0.2, 0, 0, 1); //attack4
        this.animations[7][0] = new Animator(this.spritesheet1, 0, 896, 128, 128, 4, 0.2, 0, 0, 1); //scream
        this.animations[8][0] = new Animator(this.spritesheet1, 0, 1024, 128, 128, 3, 0.3, 0, 0, 1); //hurt
        this.animations[9][0] = new Animator(this.spritesheet1, 0, 1152, 128, 128, 4, 0.3, 0, 0, 0); //dead

        this.animations[0][1] = new Animator(this.spritesheet2, 0, 0, 128, 128, 6, 0.3, 0, 0, 1); //idle
        this.animations[1][1] = new Animator(this.spritesheet2, 0, 128, 128, 128, 7, 0.2, 0, 0, 1); //walk
        this.animations[2][1] = new Animator(this.spritesheet2, 0, 256, 128, 128, 7, 0.2, 0, 0, 1); //run
        this.animations[3][1] = new Animator(this.spritesheet2, 0, 384, 128, 128, 5, 0.2, 0, 0, 1); //attack1
        this.animations[4][1] = new Animator(this.spritesheet2, 0, 512, 128, 128, 4, 0.2, 0, 0, 1); //attack2
        this.animations[5][1] = new Animator(this.spritesheet2, 0, 640, 128, 128, 4, 0.2, 0, 0, 1); //idle
        this.animations[6][1] = new Animator(this.spritesheet2, 0, 768, 128, 128, 7, 0.2, 0, 0, 1); //walk
        this.animations[7][1] = new Animator(this.spritesheet2, 0, 896, 128, 128, 6, 0.2, 0, 0, 1); //run
        this.animations[8][1] = new Animator(this.spritesheet2, 0, 1024, 128, 128, 3, 0.3, 0, 0, 1); //attack1
        this.animations[9][1] = new Animator(this.spritesheet2, 0, 1152, 128, 128, 6, 0.3, 0, 0, 0); //attack2

        this.animations[0][2] = new Animator(this.spritesheet3, 0, 0, 128, 128, 5, 0.3, 0, 0, 1); //idle
        this.animations[1][2] = new Animator(this.spritesheet3, 0, 128, 128, 128, 6, 0.2, 0, 0, 1); //walk
        this.animations[2][2] = new Animator(this.spritesheet3, 0, 256, 128, 128, 7, 0.2, 0, 0, 1); //run
        this.animations[3][2] = new Animator(this.spritesheet3, 0, 384, 128, 128, 4, 0.2, 0, 0, 1); //attack1
        this.animations[4][2] = new Animator(this.spritesheet3, 0, 512, 128, 128, 4, 0.2, 0, 0, 1); //attack2
        this.animations[5][2] = new Animator(this.spritesheet3, 0, 640, 128, 128, 4, 0.2, 0, 0, 1); //attack3
        this.animations[6][2] = new Animator(this.spritesheet3, 0, 768, 128, 128, 4, 0.2, 0, 0, 1); //scream
        this.animations[7][2] = new Animator(this.spritesheet3, 0, 896, 128, 128, 9, 0.2, 0, 0, 1); //jump
        this.animations[8][2] = new Animator(this.spritesheet3, 0, 1024, 128, 128, 3, 0.3, 0, 0, 1); //hurt
        this.animations[9][2] = new Animator(this.spritesheet3, 0, 1152, 128, 128, 5, 0.3, 0, 0, 0); //dead
    }

    update() {
        if(this.facing.x === 0) {
            this.x += this.velocity.x * this.game.clockTick;
        } else {
            this.x -= this.velocity.x * this.game.clockTick;
        }
        if(this.facing.y === 0) {
            this.y += this.velocity.x * this.game.clockTick;
        } else {
            this.y -= this.velocity.x * this.game.clockTick;
        }
        if(this.x > 1024) this.x = -100;
        if(this.x < -100) this.x = 1024;
        if(this.y > 325) this.y = 325;
    };

    draw(ctx) {
        this.demoDraw(ctx);
        //this.animations[this.state][this.type].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    };

    demoDraw(ctx) {
        this.animations[0][0].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        this.animations[1][0].drawFrame(this.game.clockTick, ctx, this.x+128, this.y, this.scale);
        this.animations[2][0].drawFrame(this.game.clockTick, ctx, this.x+256, this.y, this.scale);
        this.animations[3][0].drawFrame(this.game.clockTick, ctx, this.x+384, this.y, this.scale);
        this.animations[4][0].drawFrame(this.game.clockTick, ctx, this.x+512, this.y, this.scale);
        this.animations[5][0].drawFrame(this.game.clockTick, ctx, this.x, this.y+200, this.scale);
        this.animations[6][0].drawFrame(this.game.clockTick, ctx, this.x+256, this.y+200, this.scale);
        this.animations[7][0].drawFrame(this.game.clockTick, ctx, this.x, this.y+400, this.scale);
        this.animations[8][0].drawFrame(this.game.clockTick, ctx, this.x+256, this.y+400, this.scale);
        this.animations[9][0].drawFrame(this.game.clockTick, ctx, this.x+512, this.y+300, this.scale);
    }

}