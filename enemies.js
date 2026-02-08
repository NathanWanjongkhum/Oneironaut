class Monster extends Entity {
    constructor(game, x, y) {
        super(game, x, y);

        this.dead = false;

        this.velocity = { x: 0, y: 0 };
        this.speed = 0;         // Pixels per second
    }

    /**
     * Checks player collision.
     */
    update() {
        if (this.dead) return;

        this.checkPlayerCollision();
        super.update();
    }

    /**
     * Handles collision with the SleepyGuy.
     * If a collision occurs, it triggers monster collision handling.
     */
    checkPlayerCollision() {
        const guy = this.game.sleepyGuy;

        if (!guy || guy.dead || !guy.BB || !this.BB) return;

        if (this.BB.collide(guy.BB)) {
            this.onCollision(guy);
        }
    }

    /**
     * Get distance to the SleepyGuy.
     * Returns Infinity if player is dead/missing.
     */
    getDistToPlayer() {
        const player = this.game.sleepyGuy;
        if (!player || player.dead) return Infinity;

        // Calculate center-to-center distance
        const thisCX = this.x + (this.width * this.scale) / 2;
        const thisCY = this.y + (this.height * this.scale) / 2;

        return Math.sqrt(
            Math.pow(player.x - thisCX, 2) + 
            Math.pow(player.y - thisCY, 2)
        );
    }

    /**
     * Get a normalized vector {x, y} pointing toward the player.
     * Returns {x: 0, y: 0} if already at target or player missing.
     */
    getVectorToPlayer() {
        const player = this.game.sleepyGuy;
        if (!player || player.dead) return { x: 0, y: 0 };

        const thisCX = this.x + (this.width * this.scale) / 2;
        const thisCY = this.y + (this.height * this.scale) / 2;

        const dx = player.x - thisCX;
        const dy = player.y - thisCY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) return { x: 0, y: 0 };

        return { x: dx / dist, y: dy / dist };
    }
}

class Ghost extends Monster {
    constructor(game, x, y) {
        super(game, x, y);

        this.width = 128;
        this.height = 128;

        this.radius = 100;
        this.visualRadius = 300;
        this.scale = 1.5;
        this.dead = false;
        
        this.state = 0;
        this.type = 0;
        this.facing = { x: 0, y: 0 };

        this.spritesheet1 = ASSET_MANAGER.getAsset("./assets/entities/ghost1.png");
        this.spritesheet2 = ASSET_MANAGER.getAsset("./assets/entities/ghost1.png");
        this.spritesheet3 = ASSET_MANAGER.getAsset("./assets/entities/ghost1.png");

        this.animations = [];
        this.loadAnimations();
        
        this.updateBB();
    };

    onCollision(guy) {
        if (guy.onHitByGhost) {
            guy.onHitByGhost(this);
        }
    }

    update() {
        if (this.game.mode !== "gameplay") return;
        if (this.dead) return;

        const TICK = this.game.clockTick;

        if (this.state === 3 || this.game.gameOver) return;

        // Reset velocity
        this.velocity = { x: 0, y: 0 };

        const dist = this.getDistToPlayer();
        const vec = this.getVectorToPlayer();

        if (dist !== Infinity && dist < this.visualRadius) {
            if (dist < 200) {
                this.speed = 120; // Run
                this.state = 2;
            } else {
                this.speed = 80;  // Walk
                this.state = 1;
            }
            
            // Move towards player
            this.velocity.x = vec.x * this.speed;
            this.velocity.y = vec.y * this.speed;

        } else {
            // Idle
            this.speed = 0;
            this.state = 0;
        }

        // Apply Movement
        this.x += this.velocity.x * TICK;
        this.y += this.velocity.y * TICK;

        super.update();
    }

    updateBB() {
        const w = 128 * this.scale;
        const h = 128 * this.scale;
        this.BB = new BoundingBox(
            this.x + (w / 6),
            this.y + (h / 2),
            w * 4/6,
            h / 2
        );
    }

    draw(ctx) {
        this.animations[this.state][this.type].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

        super.draw(ctx);
    };

    loadAnimations() { // states
        for(let i = 0; i < 10; i++) { 
            this.animations.push([]);
            for(let j = 0; j < 3; j++) { // ghost types 
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
}


class Sheep {
    SPRITE_WIDTH = 32;
    SPRITE_HEIGHT = 32;

    constructor(game, positionX, postionY) {
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/sheep_shadow.png");
        this.x = positionX;
        this.y = postionY;
        this.velocity = { x: 0, y: 0 };
        this.dead = false;

        this.alertRadius = 200;

        this.scale = 2;
        this.state = 4; // 0: left, 1: right, 2: panicking left, 3: panicking right, 4: idle
        this.facing = true; //true = right, false = left
        this.BB = null;

        this.animations = [];
        this.loadAnimations();
        this.updateBB();
    }

    draw(ctx) {
        this.animations[this.state].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        if (PARAMS.DEBUG && this.BB) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
        if (PARAMS.DEBUG && this.alertBB) {
            ctx.strokeStyle = "yellow";
            ctx.strokeRect(this.alertBB.x, this.alertBB.y, this.alertBB.width, this.alertBB.height);
        }
    }

    update() {
        if (this.game.mode !== "gameplay") return;
        if (this.dead) return;

        const TICK = this.game.clockTick;

        if (this.game.gameOver) {
            return;
        }

        // Reset movement each frame
        this.velocity.x = 0;
        this.velocity.y = 0;

        // Direct reference to SleepyGuy
        const ent = this.game.sleepyGuy;

        if (ent && !ent.dead) {
            if (!ent.BB) ent.updateBB();

            const thisCX = this.x + (this.SPRITE_WIDTH * this.scale) / 2;
            const thisCY = this.y + (this.SPRITE_HEIGHT * this.scale) / 2;

            // SleepyGuy treats x,y as center
            const entCX = ent.x;
            const entCY = ent.y;

            const dx = entCX - thisCX;
            const dy = entCY - thisCY;
            const dist = getDistance({ x: thisCX, y: thisCY }, { x: entCX, y: entCY });

            if (dist !== 0) {
                const nx = dx / dist;
                let speed = 0;

                if (dist < this.alertRadius) {
                    speed = 150;

                    // Run away
                    this.velocity.x = -nx * speed;
                    this.velocity.y = 0;

                    // Face direction of movement
                    this.facing = this.velocity.x > 0;
                    this.state = this.facing ? 3 : 2;
                } else {
                    speed = 0;
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                    this.state = 4;
                }
            }
        } else {
            // No sleepy guy or he is dead -> idle
            this.state = 0;
        }

        this.x += this.velocity.x * TICK;
        this.y += this.velocity.y * TICK;

        this.updateBB();
    }


    updateBB() {
        const w = this.SPRITE_WIDTH * this.scale;
        const h = this.SPRITE_HEIGHT * this.scale;
        this.BB = new BoundingBox(
            this.x,
            this.y,
            w,
            h
        );
    }

    loadAnimations() {
        for(let i = 0; i < 5; i++) { //states
            this.animations.push([]);
        }

        //spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop
        this.animations[0] = new Animator(this.spritesheet, 0, this.SPRITE_HEIGHT*2, this.SPRITE_WIDTH, this.SPRITE_HEIGHT, 6, 0.5, 0, 0, 1);// left
        this.animations[1] = new Animator(this.spritesheet, 0, this.SPRITE_HEIGHT*3, this.SPRITE_WIDTH, this.SPRITE_HEIGHT, 6, 0.5, 0, 0, 1); // right
        this.animations[2] = new Animator(this.spritesheet, 0, this.SPRITE_HEIGHT*2, this.SPRITE_WIDTH, this.SPRITE_HEIGHT, 6, 0.25, 0, 0, 1); // panicking left
        this.animations[3] = new Animator(this.spritesheet, 0, this.SPRITE_HEIGHT*3, this.SPRITE_WIDTH, this.SPRITE_HEIGHT, 6, 0.25, 0, 0, 1); // panicking right
        this.animations[4] = new Animator(this.spritesheet, 0, 0, this.SPRITE_WIDTH, this.SPRITE_HEIGHT, 1, 1, 0, 0, 1); //idle
    }
}

class Spider {
    constructor(game, path) {
        this.game = game;
        
        this.path = path; 
        
        this.x = path[0].x;
        this.y = path[0].y;
        
        this.targetIndex = 1; 
        
        // TODO:: Get actual sprite and dimensions
        this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/ghost1.png"); 
        
        this.width = 64;
        this.height = 64;
        this.scale = 2;
        
        this.speed = 150;
        this.dead = false;
        
        this.BB = null;
        this.updateBB();

        this.animations = [];
        this.loadAnimations();
    };

    loadAnimations() {
        this.animations.push(new Animator(this.spritesheet, 0, 0, this.width, this.height, 4, 0.2, 0, false, true));
    }

    updateBB() {
        const drawWidth = this.width * this.scale;
        const drawHeight = this.height * this.scale;
        
        this.BB = new BoundingBox(
            this.x, 
            this.y, 
            drawWidth, 
            drawHeight
        );
    }

    update() {
        if (this.game.mode !== "gameplay") return;
        if (this.dead) return;

        const TICK = this.game.clockTick;

        if (this.path && this.path.length > 0) {
            const target = this.path[this.targetIndex];
            
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const move = this.speed * TICK;

            if (dist <= move) {
                this.x = target.x;
                this.y = target.y;

                this.targetIndex++;
                
                if (this.targetIndex >= this.path.length) {
                    this.targetIndex = 0;
                }
            } else {
                this.x += (dx / dist) * move;
                this.y += (dy / dist) * move;
            }
        }

        this.updateBB();
    }

    draw(ctx) {
        if (this.path && this.path.length > 1) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.path[0].x + (this.width*this.scale)/2, this.path[0].y + (this.height*this.scale)/2);
            for (let i = 1; i < this.path.length; i++) {
                ctx.lineTo(this.path[i].x + (this.width*this.scale)/2, this.path[i].y + (this.height*this.scale)/2);
            }
            ctx.lineTo(this.path[0].x + (this.width*this.scale)/2, this.path[0].y + (this.height*this.scale)/2);
            ctx.stroke();
        }

        this.animations[0].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

        if (PARAMS.DEBUG && this.BB) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}