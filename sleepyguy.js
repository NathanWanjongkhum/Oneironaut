const NUM_ANIMATIONS = 2;

class SleepyGuy {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });

        this.game.sleepyGuy = this;

        this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/sleepyguy.png");

        this.width = 200;
        this.height = 100;
        this.velocity = { x: 100, y: 100 };
        this.scale = 0.3;
        this.BB = null;

        this.state = 0; // 0: idle, 1: damaged
        this.currentFrame = 0;
        this.dead = false;
        this.attackTimer = 0;

        this.targetWaypointIndex = 0;

        this.animations = [];
        this.loadAnimations();
        this.updateBB();
    }

    loadAnimations() {
        for (let i = 0; i < NUM_ANIMATIONS; i++) {
            this.animations.push([]);
        }

        //spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop
        this.animations[0][0] = new Animator(this.spritesheet, 0, 0, 442, 247, 5, 0.5, 0, true, true); // idle
    }

    update() {
        if (this.game.mode !== "gameplay") return;
        const TICK = this.game.clockTick;
        if (this.dead) {
            this.attackTimer += TICK;
            if (this.attackTimer > 1) {
                this.game.gameOver = true;
            }
            this.updateBB();
            return;

        }

        // Move along waypoints if they exist
        const waypoints = this.game.waypoints;
        if (waypoints && waypoints.length > 0) {
            // Set target waypoint (use explicit index)
            const targetIndex = this.targetWaypointIndex;
            this.target = waypoints[targetIndex];

            let dx = this.target.x - this.x;
            let dy = this.target.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            const velocityLength = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);

            // Use remaining movement this frame
            let remaining = velocityLength * TICK;
            let currentIndex = targetIndex;

            while (remaining > 0) {
                // Recompute target and deltas for current index
                this.target = waypoints[currentIndex];
                dx = this.target.x - this.x;
                dy = this.target.y - this.y;
                distance = Math.sqrt(dx * dx + dy * dy);

                if (distance === 0) {
                    // Exactly on the point so advance if possible, otherwise stop
                    if (currentIndex + 1 < waypoints.length) {
                        currentIndex++;
                        this.targetWaypointIndex = currentIndex;
                        continue;
                    } else {
                        this.targetWaypointIndex = currentIndex;
                        break;
                    }
                }

                if (distance <= remaining) {
                    // Snap to this waypoint and consume movement, then try next
                    this.x = this.target.x;
                    this.y = this.target.y;
                    remaining -= distance;

                    if (currentIndex + 1 < waypoints.length) {
                        currentIndex++;
                        this.targetWaypointIndex = currentIndex;
                        // loop to attempt to use leftover movement on next waypoint
                        continue;
                    } else {
                        // Reached final waypoint
                        this.targetWaypointIndex = currentIndex;
                        break;
                    }
                } else {
                    // Move part-way towards the current target and finish this frame
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * remaining;
                    this.y += Math.sin(angle) * remaining;
                    break;
                }
            }
        }
        this.updateBB();
        this.handleCollisions();
    }
    //sleepGuy now handles all win/lose conditions and collision logic. 
    handleCollisions() {
        if (!this.BB || this.dead) return; 

        for(let i = 0; i < this.game.entities.length; i++) {
            const ent = this.game.entities[i];
            if (ent === this || ent.dead) continue;
            if(!ent.BB) continue;

            if (this.BB.collide(ent.BB)) {
                const entType = ent.constructor.name;
                switch (entType) {
                    case "Bed":
                        this.onReachBed(ent);
                    case "Ghost":
                        this.onHitByGhost(ent);
                    default:
                        break;
                }
            }
        }
    }

    //triggers win condition when SleepyGuy reaches bed 
    onReachBed(_bed) {
        this.game.gameWon = true;
        this.game.gameOver = true;
    }
    //triggers lose condition when SleepyGuy hit by ghost
    onHitByGhost(_ghost) {
        this.dead = true;
        this.attackTimer = 0;
    }

    updateBB() {
        const w = this.width * this.scale;
        const h = this.height * this.scale;
        this.BB = new BoundingBox(
            this.x - w,// / 2,
            this.y - h,// / 2,
            w * 2,
            h * 2
        );
    }

    draw(ctx) {
        //TODO: best practices use the animator.drawframe method.
        //Custom logic can be helpful, but work with the existing framework, not against.
        //Causes issues in boundary handling.
        const anim = this.animations[this.state][this.currentFrame];

        // Advance animator time and preserve loop/finished behavior, then draw
        anim.elapsedTime += this.game.clockTick;

        if (anim.isDone()) {
            if (anim.loop) {
                anim.elapsedTime -= anim.totalTime;
            } else {
                return;
            }
        }

        let frame = anim.currentFrame();
        if (anim.reverse) frame = anim.frameCount - frame - 1;

        // Preserves aspect ratio
        const frameW = anim.width;
        const frameH = anim.height;
        const drawW = frameW * this.scale;
        const drawH = frameH * this.scale;

        // Draw centered on that point
        const offsetX = this.x - drawW / 2;
        const offsetY = this.y - drawH / 2;

        if (this.game.options.debugging) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(offsetX, offsetY, drawW, drawH); // debug box
            console.log(anim.height, this.scale, drawH, offsetY);
        }

        
        
        ctx.drawImage(anim.spritesheet,
            anim.xStart + frame * (anim.width + anim.framePadding), anim.yStart,
            frameW, frameH,
            offsetX, offsetY,
            drawW, drawH);
        // ctx.fillStyle = "Blue";
        // ctx.fillRect(this.x, this.y, this.width, this.height);

        if (PARAMS.DEBUG && this.BB) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
    }
}