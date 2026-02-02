const NUM_ANIMATIONS = 2;

class SleepyGuy {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });

        this.game.sleepyGuy = this;

        this.spritesheet = ASSET_MANAGER.getAsset("./assets/sleepyGuy.png");

        this.width = 50;
        this.height = 50;
        this.velocity = { x: 100, y: 100 };
        this.scale = 0.5;
        this.BB = null;

        this.state = 0; // 0: idle, 1: damaged
        this.currentFrame = 0;
        this.dead = false;

        this.targetWaypointIndex = null;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {
        for (let i = 0; i < NUM_ANIMATIONS; i++) {
            this.animations.push([]);
        }

        this.animations[0].push([]);//temp fix line
        this.animations[0][0] = new Animator(this.spritesheet, 0, 0, 360, 210, 1, 1, 0, false, true);
    }

    update() {

        if (this.dead) {
            this.attackTimer += TICK;
            if (this.attackTimer > 1) {
                this.game.gameOver = true;
            }
            return;
        }
        
        const TICK = this.game.clockTick;

        // Move along waypoints if they exist
        const waypoints = this.game.waypoints;
        if (waypoints && waypoints.length > 0) {
            // Set target waypoint
            this.target = waypoints[this.targetWaypointIndex || 0];

            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const velocityLength = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y)

            if (distance < velocityLength * TICK) {
                if (this.targetWaypointIndex + 1 >= waypoints.length) {
                    this.targetWaypointIndex = null; // Reached final waypoint
                } else {
                    this.targetWaypointIndex++; // Move to next waypoint
                }
            }

            // Move to target waypoint
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * this.velocity.x * TICK;
            this.y += Math.sin(angle) * this.velocity.y * TICK;
            console.log("Target Waypoint:", this.target, "Current Position:", { x: this.x, y: this.y });
        }
        this.updateBB();
    }

    updateBB() {
    this.BB = new BoundingBox(
        this.x,
        this.y,
        this.width * this.scale,
        this.height * this.scale
    );
}

    draw(ctx) {
        // ctx.fillStyle = "Blue";
        // ctx.fillRect(this.x, this.y, this.width, this.height);

        if (PARAMS.DEBUG && this.BB) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
        }
        this.animations[this.state][this.currentFrame].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }
}