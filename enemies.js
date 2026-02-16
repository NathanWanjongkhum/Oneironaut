class Monster extends Entity {
    constructor(game, _x, _y) {
        super(game, _x, _y);

        // The radius within which the monster will actively chase the player
        this.leashRadius = 0;
        // Extends range monsters will chase player even if not directly in range
        this.aggroTimer = 0; 
        // If Sheep will alert this monsters
        this.canBeAlerted = false; 
        
        // Marks monster for removal
        this.dead = false;
        this.velocity = { x: 0, y: 0 };
        this.speed = 0;         // Pixels per second
        this.gravity = 3;       // Not used for all monsters
    }

    update() {
        if (this.dead) return;

        if (this.aggroTimer > 0) {
            this.aggroTimer -= this.game.clockTick;
        }

        super.update();
    }

    draw(ctx) {
        if (PARAMS.DEBUG) {
            if (this.leashRadius > 0) {
                ctx.beginPath();
                ctx.strokeStyle = "yellow";
                ctx.lineWidth = 1;
                ctx.arc(this.spawn.x, this.spawn.y, this.leashRadius, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath();
            }

            if (this.spawn !== undefined) {
                ctx.beginPath();
                ctx.fillStyle = "cyan";
                ctx.arc(this.spawn.x, this.spawn.y, 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            }
        }

        super.draw(ctx);
    }

    /**
     * Get a normalized vector {x, y} pointing toward the player.
     * Returns {x: 0, y: 0} if already at target or player missing.
     */
    getVectorToPlayer() {
        const player = this.game.sleepyGuy;
        if (!player || player.dead) return { x: 0, y: 0 };

        const center = {
            x: this.x + (this.width * this.scale) / 2,
            y: this.y + (this.height * this.scale) / 2
        }
        
        const playerPos = {
            x: player.x,
            y: player.y
        }
        
        return getNormalVector(playerPos, center)
    }
}

class Ghost extends Monster {
    constructor(game, x, y) {
        super(game, x, y);

        this.width = 128;
        this.height = 128;
        this.scale = 1.5;

        this.spawn = {
            x: this.x + (this.width * this.scale) / 2,
            y: this.y + (this.height * this.scale) / 2
        }
        
        this.leashRadius = 175
        this.canBeAlerted = true;

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

    onCollision(entity) {
        switch (entity.constructor.name) {
            case "SleepyGuy":
                entity.onHitByGhost(this);
                break;
            default:
                break;
        }
    }

    update() {
        if (this.game.mode !== "gameplay") return;
        if (this.dead) return;
        if (this.state === 3 || this.game.gameOver) return;

        const AGGRO_SPEED = 120;
        const DEFEND_SPEED = 80;
        const TICK = this.game.clockTick;

        // Reset velocity
        this.velocity = { x: 0, y: 0 };

        const playerPos = {
            x: this.game.sleepyGuy.x,
            y: this.game.sleepyGuy.y
        }
        const thisPos = {
            x: this.x + (this.width * this.scale) / 2,
            y: this.y + (this.height * this.scale) / 2
        }

        const distPlayerToSpawn = getDistance(playerPos, this.spawn)
        const distToSpawn = getDistance(thisPos, this.spawn)

        const isAggro = this.aggroTimer > 0;

        let vector = null
        if (isAggro || distPlayerToSpawn < this.leashRadius) {                        
            this.speed = AGGRO_SPEED; // Run
            this.state = 2;

            vector = this.getVectorToPlayer();
        } else if (distToSpawn > 5) {
            this.speed = DEFEND_SPEED; // Walk
            this.state = 1;     
            
            vector = getNormalVector(this.spawn, thisPos)
        }
        
        if (vector) {
            this.velocity.x = vector.x * this.speed;
            this.velocity.y = vector.y * this.speed;
        }

        this.x += this.velocity.x * TICK;
        this.y += this.velocity.y * TICK;

        super.update();
    }

    updateBB() {
        const xScaler = 4/6;
        const yScaler = 2/3;

        const bbWidth = this.width * this.scale * xScaler;
        const bbHeight = this.height * this.scale * yScaler;

        const xOffset = (this.width * this.scale - bbWidth) / 2;
        const yOffset = (this.height * this.scale - bbHeight) / 2;

        this.BB = new BoundingBox(
            this.x + xOffset,
            this.y + yOffset,
            bbWidth,
            bbHeight
        );
    }

    draw(ctx) {
        this.animations[this.state][this.type].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

        super.draw(ctx);
    };

    loadAnimations() {
        for(let i = 0; i < 10; i++) { // states
            this.animations.push([]);
            for(let j = 0; j < 3; j++) { // ghost types 
                this.animations.push([]);
            }
        }
                
        // spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop
        this.animations[0][0] = new Animator(this.spritesheet1, 0, 30, 128, 128, 5, 0.3, 0, 0, 1); // idle
        this.animations[1][0] = new Animator(this.spritesheet1, 0, 158, 128, 128, 5, 0.2, 0, 0, 1); // walk
        this.animations[2][0] = new Animator(this.spritesheet1, 0, 286, 128, 128, 5, 0.2, 0, 0, 1); // run
        this.animations[3][0] = new Animator(this.spritesheet1, 0, 414, 128, 128, 4, 0.2, 0, 0, 1); // attack1
        this.animations[4][0] = new Animator(this.spritesheet1, 0, 542, 128, 128, 4, 0.2, 0, 0, 1); // attack2
        this.animations[5][0] = new Animator(this.spritesheet1, 0, 670, 128, 128, 7, 0.2, 0, 0, 1); // attack3
        this.animations[6][0] = new Animator(this.spritesheet1, 0, 798, 128, 128, 7, 0.2, 0, 0, 1); // attack4
        this.animations[7][0] = new Animator(this.spritesheet1, 0, 926, 128, 128, 4, 0.2, 0, 0, 1); // scream
        this.animations[8][0] = new Animator(this.spritesheet1, 0, 1054, 128, 128, 3, 0.3, 0, 0, 1); // hurt
        this.animations[9][0] = new Animator(this.spritesheet1, 0, 1182, 128, 128, 4, 0.3, 0, 0, 0); // dead

        this.animations[0][1] = new Animator(this.spritesheet2, 0, 30, 128, 128, 6, 0.3, 0, 0, 1); // idle
        this.animations[1][1] = new Animator(this.spritesheet2, 0, 158, 128, 128, 7, 0.2, 0, 0, 1); // walk
        this.animations[2][1] = new Animator(this.spritesheet2, 0, 286, 128, 128, 7, 0.2, 0, 0, 1); // run
        this.animations[3][1] = new Animator(this.spritesheet2, 0, 414, 128, 128, 5, 0.2, 0, 0, 1); // attack1
        this.animations[4][1] = new Animator(this.spritesheet2, 0, 542, 128, 128, 4, 0.2, 0, 0, 1); // attack2
        this.animations[5][1] = new Animator(this.spritesheet2, 0, 670, 128, 128, 4, 0.2, 0, 0, 1); // idle
        this.animations[6][1] = new Animator(this.spritesheet2, 0, 798, 128, 128, 7, 0.2, 0, 0, 1); // walk
        this.animations[7][1] = new Animator(this.spritesheet2, 0, 926, 128, 128, 6, 0.2, 0, 0, 1); // run
        this.animations[8][1] = new Animator(this.spritesheet2, 0, 1054, 128, 128, 3, 0.3, 0, 0, 1); // attack1
        this.animations[9][1] = new Animator(this.spritesheet2, 0, 1182, 128, 128, 6, 0.3, 0, 0, 0); // attack2

        this.animations[0][2] = new Animator(this.spritesheet3, 0, 30, 128, 128, 5, 0.3, 0, 0, 1); // idle
        this.animations[1][2] = new Animator(this.spritesheet3, 0, 158, 128, 128, 6, 0.2, 0, 0, 1); // walk
        this.animations[2][2] = new Animator(this.spritesheet3, 0, 286, 128, 128, 7, 0.2, 0, 0, 1); // run
        this.animations[3][2] = new Animator(this.spritesheet3, 0, 414, 128, 128, 4, 0.2, 0, 0, 1); // attack1
        this.animations[4][2] = new Animator(this.spritesheet3, 0, 542, 128, 128, 4, 0.2, 0, 0, 1); // attack2
        this.animations[5][2] = new Animator(this.spritesheet3, 0, 670, 128, 128, 4, 0.2, 0, 0, 1); // attack3
        this.animations[6][2] = new Animator(this.spritesheet3, 0, 798, 128, 128, 4, 0.2, 0, 0, 1); // scream
        this.animations[7][2] = new Animator(this.spritesheet3, 0, 926, 128, 128, 9, 0.2, 0, 0, 1); // jump
        this.animations[8][2] = new Animator(this.spritesheet3, 0, 1054, 128, 128, 3, 0.3, 0, 0, 1); // hurt
        this.animations[9][2] = new Animator(this.spritesheet3, 0, 1182, 128, 128, 5, 0.3, 0, 0, 0); // dead
    }
}

class Sheep extends Monster {
    constructor(game, x, y) {
        super(game, x, y);

        this.SPRITE_WIDTH = 32;
        this.SPRITE_HEIGHT = 32;
        
        this.width = 32;
        this.height = 32;
        this.scale = 2;
        
        this.spawn = {
            x: this.x + (this.width * this.scale) / 2,
            y: this.y + (this.height * this.scale) / 2
        }
        
        this.speed = 150;
        this.alertRadius = 200;
        this.broadcastRadius = 300;
        this.canBeAlerted = true;

        this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/sheep_shadow.png");
        
        this.state = 4; // 0: left, 1: right, 2: panic L, 3: panic R, 4: idle
        this.facing = true; 

        this.animations = [];
        this.loadAnimations();
        this.updateBB();
    }

    onCollision(entity) {
        switch (entity.constructor.name) {
            case "Block":
                const sheepBB = this.BB;
                const blockBB = entity.BB;

                const overlapX = (sheepBB.right > blockBB.left && sheepBB.left < blockBB.right);
                const overlapY = (sheepBB.bottom > blockBB.top && sheepBB.top < blockBB.bottom);

                if (overlapX && overlapY) {
                    const diffX = (sheepBB.right - blockBB.left) < (blockBB.right - sheepBB.left) 
                                ? (sheepBB.right - blockBB.left) : (blockBB.right - sheepBB.left);
                    const diffY = (sheepBB.bottom - blockBB.top) < (blockBB.bottom - sheepBB.top) 
                                ? (sheepBB.bottom - blockBB.top) : (blockBB.bottom - sheepBB.top);

                    if (diffY < diffX) {
                        // Vertical Collision (Floor or Ceiling)
                        if (this.velocity.y > 0 && sheepBB.bottom > blockBB.top) {
                            // Standing on top of block
                            this.y = blockBB.top - (this.height * this.scale);
                            this.velocity.y = 0;
                            this.onGround = true;
                        } else if (this.velocity.y < 0) { 
                            // Hitting head on ceiling
                            this.y = blockBB.bottom;
                            this.velocity.y = 0;
                        }
                    } else {
                        // Horizontal Collision (Walls)
                        if (this.velocity.x > 0) { 
                            // Hit left side of block
                            this.x = blockBB.left - (this.width * this.scale);
                        } else if (this.velocity.x < 0) { 
                            // Hit right side of block
                            this.x = blockBB.right;
                        }
                        this.velocity.x = 0;
                    }
                }

                // Update BB after snapping position
                this.updateBB();
                break;
            default:
                break;
        }
    }

    update() {
        if (this.game.mode !== "gameplay") return;
        if (this.dead || this.game.gameOver) return;

        const TICK = this.game.clockTick;
        this.onGround = false;

        // Run away from SleepyGuy
        const ent = this.game.sleepyGuy;

        if (ent && !ent.dead) {
            if (!ent.BB) ent.updateBB();

            const thisCX = this.x + (this.width * this.scale) / 2;
            const thisCY = this.y + (this.height * this.scale) / 2;
            const entCX = ent.x;
            const entCY = ent.y;

            const dx = entCX - thisCX;
            const dy = entCY - thisCY;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist !== 0 && dist < this.alertRadius) {
                const nx = dx / dist;

                this.velocity.x = -nx * this.speed;
            } else {
                this.velocity.x = 0;
            }

            this.alertOthers(thisCX, thisCY);
        }

        // Update facing and state based on velocity
        if (this.velocity.x !== 0) {
            this.facing = this.velocity.x > 0;
            this.state = this.facing ? 3 : 2; // panic right : panic left
        } else {
            this.state = 4; // idle
        }

        // Apply gravity
        this.velocity.y += this.gravity;
        if (this.velocity.y > 300) this.velocity.y = 300; // Max fall speed

        this.x += this.velocity.x * TICK;
        this.y += this.velocity.y * TICK;

        this.updateBB();

        super.update();
    }

    alertOthers(myX, myY) {
        for (let i = 0; i < this.game.entities.length; i++) {
            const entity = this.game.entities[i];

            // Checks if the entity is a Monster (but not itself) and can be alerted
            if (entity instanceof Monster && entity !== this && entity.canBeAlerted) {
                const thisPos = {
                    x: myX, 
                    y: myY
                }

                const entityPos = {
                    x: entity.x + (entity.width * entity.scale) / 2,
                    y: entity.y + (entity.height * entity.scale) / 2
                }

                const dist = getDistance(thisPos, entityPos)
                
                if (dist < entity.leashRadius) {
                    entity.aggroTimer = 0.5; 
                }
            }
        }
    }

    loadAnimations() {
        for(let i = 0; i < 5; i++) this.animations.push([]);

        const h = this.SPRITE_HEIGHT;
        const w = this.SPRITE_WIDTH;
        
        this.animations[0] = new Animator(this.spritesheet, 0, h*2, w, h, 6, 0.5, 0, 0, 1); // left
        this.animations[1] = new Animator(this.spritesheet, 0, h*3, w, h, 6, 0.5, 0, 0, 1); // right
        this.animations[2] = new Animator(this.spritesheet, 0, h*2, w, h, 6, 0.25, 0, 0, 1); // panic left
        this.animations[3] = new Animator(this.spritesheet, 0, h*3, w, h, 6, 0.25, 0, 0, 1); // panic right
        this.animations[4] = new Animator(this.spritesheet, 0, 0, w, h, 1, 1, 0, 0, 1); // idle
    }

    draw(ctx) {
        this.animations[this.state].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        
        super.draw(ctx);
    }
}

class Spider extends Monster {
    constructor(game, path) {
        super(game, path[0].x, path[0].y);
        
        this.width = 32;
        this.height = 32;
        this.scale = 2;
        
        this.spawn = {
            x: this.x + (this.width * this.scale) / 2,
            y: this.y + (this.height * this.scale) / 2
        }
        
        this.speed = 150;
        
        this.path = path; 
        this.targetIndex = 1; 

        // TODO: Replace with actual spider spritesheet
        this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/spider.png"); // Placeholder

        this.animations = [];
        this.loadAnimations();
        
        this.updateBB();
    };

    onCollision(entity) {
        switch (entity.constructor.name) {
            case "SleepyGuy":
                entity.onHitByGhost(this);
                break;
            default:
                break;
        }
    }

    //spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop
    loadAnimations() {
        this.animations.push(new Animator(this.spritesheet, 0, 0, this.width, this.height, 1, 1, 0, false, true));
    }

    update() {
        if (this.game.mode !== "gameplay") return;
        if (this.dead) return;

        const TICK = this.game.clockTick;

        // Path Following Logic
        if (this.path && this.path.length > 0) {
            const target = this.path[this.targetIndex];
            
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const move = this.speed * TICK;

            if (dist <= move) {
                // Snap to target
                this.x = target.x;
                this.y = target.y;
                // Next waypoint
                this.targetIndex++;
                if (this.targetIndex >= this.path.length) this.targetIndex = 0;
            } else {
                // Move along line
                this.x += (dx / dist) * move;
                this.y += (dy / dist) * move;
            }
        }

        super.update();
    }

    draw(ctx) {
        if (this.path && this.path.length > 1) {
            ctx.strokeStyle = "white";
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

        super.draw(ctx);
    }
}

class Demon extends Monster {
    constructor(game, x, y) {
        super(game, x, y);

        this.width = 128;
        this.height = 128;
        this.scale = 1.5;

        this.spawn = {
            x: this.x + (this.width * this.scale) / 2,
            y: this.y + (this.height * this.scale) / 2
        }
        
        this.leashRadius = 175
        this.canBeAlerted = true;

        this.dead = false;
        this.state = 0;
        this.type = 2;
        this.facing = { x: 0, y: 0 };

        this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/ghost3.png");

        this.animations = [];
        this.loadAnimations();
        
        this.updateBB();
    };

    onCollision(entity) {
        switch (entity.constructor.name) {
            case "SleepyGuy":
                entity.onHitByGhost(this);
                break;
            case "Block":
                const sheepBB = this.BB;
                const blockBB = entity.BB;

                const overlapX = (sheepBB.right > blockBB.left && sheepBB.left < blockBB.right);
                const overlapY = (sheepBB.bottom > blockBB.top && sheepBB.top < blockBB.bottom);

                if (overlapX && overlapY) {
                    const diffX = (sheepBB.right - blockBB.left) < (blockBB.right - sheepBB.left) 
                                ? (sheepBB.right - blockBB.left) : (blockBB.right - sheepBB.left);
                    const diffY = (sheepBB.bottom - blockBB.top) < (blockBB.bottom - sheepBB.top) 
                                ? (sheepBB.bottom - blockBB.top) : (blockBB.bottom - sheepBB.top);

                    if (diffY < diffX) {
                        // Vertical Collision (Floor or Ceiling)
                        if (this.velocity.y > 0 && sheepBB.bottom > blockBB.top) {
                            // Standing on top of block
                            this.y = blockBB.top - (this.height * this.scale);
                            this.velocity.y = 0;
                            this.onGround = true;
                        } else if (this.velocity.y < 0) { 
                            // Hitting head on ceiling
                            this.y = blockBB.bottom;
                            this.velocity.y = 0;
                        }
                    } else {
                        // Horizontal Collision (Walls)
                        if (this.velocity.x > 0) { 
                            // Hit left side of block
                            this.x = blockBB.left - (this.width * this.scale);
                        } else if (this.velocity.x < 0) { 
                            // Hit right side of block
                            this.x = blockBB.right;
                        }
                        this.velocity.x = 0;
                    }
                }

                // Update BB after snapping position
                this.updateBB();
                break;
            default:
                break;
        }
    }

    update() {
        if (this.game.mode !== "gameplay") return;
        if (this.dead) return;
        if (this.state === 3 || this.game.gameOver) return;

        const AGGRO_SPEED = 120;
        const DEFEND_SPEED = 80;
        const TICK = this.game.clockTick;

        // Reset velocity
        this.velocity = { x: 0, y: 0 };

        const playerPos = {
            x: this.game.sleepyGuy.x,
            y: this.game.sleepyGuy.y
        }
        const thisPos = {
            x: this.x + (this.width * this.scale) / 2,
            y: this.y + (this.height * this.scale) / 2
        }

        const distPlayerToSpawn = getDistance(playerPos, this.spawn)
        const distToSpawn = getDistance(thisPos, this.spawn)

        const isAggro = this.aggroTimer > 0;

        let vector = null
        if (isAggro || distPlayerToSpawn < this.leashRadius) {            
            this.speed = AGGRO_SPEED; // Run
            this.state = 2;

            vector = this.getVectorToPlayer();
        } else if (distToSpawn > 5) {
            this.speed = DEFEND_SPEED; // Walk
            this.state = 1;     
            
            vector = getNormalVector(this.spawn, thisPos)
        }
        
        if (vector) {
            this.velocity.x = vector.x * this.speed;
            this.velocity.y = vector.y * this.speed;
        }

        this.x += this.velocity.x * TICK;
        this.y += this.velocity.y * TICK;

        super.update();
    }

    updateBB() {
        const xScaler = 4/6;
        const yScaler = 2/3;

        const bbWidth = this.width * this.scale * xScaler;
        const bbHeight = this.height * this.scale * yScaler;

        const xOffset = (this.width * this.scale - bbWidth) / 2;
        const yOffset = (this.height * this.scale - bbHeight) / 2;

        this.BB = new BoundingBox(
            this.x + xOffset,
            this.y + yOffset,
            bbWidth,
            bbHeight
        );
    }

    draw(ctx) {
        this.animations[this.state][this.type].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        super.draw(ctx);
    };

    loadAnimations() {
        for(let i = 0; i < 10; i++) { 
            this.animations.push([]);
            for(let j = 0; j < 3; j++) { 
                this.animations.push([]);
            }
        }
                
        // spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop

        this.animations[0][2] = new Animator(this.spritesheet, 0, 30, 128, 128, 5, 0.3, 0, 0, 1); // idle
        this.animations[1][2] = new Animator(this.spritesheet, 0, 158, 128, 128, 6, 0.2, 0, 0, 1); // walk
        this.animations[2][2] = new Animator(this.spritesheet, 0, 286, 128, 128, 7, 0.2, 0, 0, 1); // run
        this.animations[3][2] = new Animator(this.spritesheet, 0, 414, 128, 128, 4, 0.2, 0, 0, 1); // attack1
        this.animations[4][2] = new Animator(this.spritesheet, 0, 542, 128, 128, 4, 0.2, 0, 0, 1); // attack2
        this.animations[5][2] = new Animator(this.spritesheet, 0, 670, 128, 128, 4, 0.2, 0, 0, 1); // attack3
        this.animations[6][2] = new Animator(this.spritesheet, 0, 798, 128, 128, 4, 0.2, 0, 0, 1); // scream
        this.animations[7][2] = new Animator(this.spritesheet, 0, 926, 128, 128, 9, 0.2, 0, 0, 1); // jump
        this.animations[8][2] = new Animator(this.spritesheet, 0, 1054, 128, 128, 3, 0.3, 0, 0, 1); // hurt
        this.animations[9][2] = new Animator(this.spritesheet, 0, 1182, 128, 128, 5, 0.3, 0, 0, 0); // dead
    }
}

class VenusFlyTrap extends Monster {
    constructor(game, x, y) {
        super(game, x, y);

        this.width = 64;
        this.height = 64;
        this.scale = 1.5;

        this.spawn = {
            x: this.x + (this.width * this.scale) / 2,
            y: this.y + (this.height * this.scale) / 2
        }
        
        this.leashRadius = 175
        this.canBeAlerted = true;

        this.dead = false;
        this.state = 0;
        this.type = 0;
        this.facing = { x: 0, y: 0 };

        this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/plant1_idle.png");

        this.animations = [];
        this.loadAnimations();
        
        this.updateBB();
    };

    onCollision(entity) {
        switch (entity.constructor.name) {
            case "SleepyGuy":
                entity.onHitByGhost(this);
                break;
            default:
                break;
        }
    }

    update() {
        if (this.game.mode !== "gameplay") return;
        if (this.dead) return;
        if (this.state === 3 || this.game.gameOver) return;

        const AGGRO_SPEED = 120;
        const DEFEND_SPEED = 80;
        const TICK = this.game.clockTick;

        // Reset velocity
        this.velocity = { x: 0, y: 0 };

        const playerPos = {
            x: this.game.sleepyGuy.x,
            y: this.game.sleepyGuy.y
        }
        const thisPos = {
            x: this.x + (this.width * this.scale) / 2,
            y: this.y + (this.height * this.scale) / 2
        }

        const distPlayerToSpawn = getDistance(playerPos, this.spawn)
        const distToSpawn = getDistance(thisPos, this.spawn)

        const isAggro = this.aggroTimer > 0;

        let vector = null
        if (isAggro || distPlayerToSpawn < this.leashRadius) {                        
            this.speed = AGGRO_SPEED; // Run
            this.state = 2;

            vector = this.getVectorToPlayer();
        } else if (distToSpawn > 5) {
            this.speed = DEFEND_SPEED; // Walk
            this.state = 1;     
            
            vector = getNormalVector(this.spawn, thisPos)
        }
        
        if (vector) {
            this.velocity.x = vector.x * this.speed;
            this.velocity.y = vector.y * this.speed;
        }

        this.x += this.velocity.x * TICK;
        this.y += this.velocity.y * TICK;

        super.update();
    }

    updateBB() {
        const xScaler = 4/6;
        const yScaler = 2/3;

        const bbWidth = this.width * this.scale * xScaler;
        const bbHeight = this.height * this.scale * yScaler;

        const xOffset = (this.width * this.scale - bbWidth) / 2;
        const yOffset = (this.height * this.scale - bbHeight) / 2;

        this.BB = new BoundingBox(
            this.x + xOffset,
            this.y + yOffset,
            bbWidth,
            bbHeight
        );
    }

    draw(ctx) {
        this.animations[this.state][this.type].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

        super.draw(ctx);
    };

    loadAnimations() {
        for(let i = 0; i < 10; i++) { // states
            this.animations.push([]);
            for(let j = 0; j < 3; j++) { // ghost types 
                this.animations.push([]);
            }
        }
                
        // spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop
        this.animations[0][0] = new Animator(this.spritesheet, 0, 0, 64, 64, 4, 0.4, 0, 0, 1); // idle
    }
}