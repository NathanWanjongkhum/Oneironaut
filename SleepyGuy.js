const NUM_ANIMATIONS = 2;

class SleepyGuy {
    constructor(game, x, y) {
        Object.assign(this, { game, x, y });

        this.game.sleepyGuy = this;

        this.spritesheet = ASSET_MANAGER.getAsset("./assets/sleepyguy.png");

        this.width = 50;
        this.height = 50;
        this.velocity = { x: 100, y: 100 };

        this.state = 0; // 0: idle, 1: damaged
        this.currentFrame = 0;

        this.targetWaypointIndex = 0;

        this.animations = [];
        this.loadAnimations();
    }

    loadAnimations() {
        for (let i = 0; i < NUM_ANIMATIONS; i++) {
            this.animations.push([]);
        }

        //spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop
        this.animations[0][0] = new Animator(this.spritesheet, 0, 0, 442, 444, 5, 0.5, 0, true, true); // idle
    }

    update() {
        const TICK = this.game.clockTick;

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
    }

    draw(ctx) {
        this.animations[this.state][this.currentFrame].drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
    }
}