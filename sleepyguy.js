const NUM_ANIMATIONS = 2;

class SleepyGuy {
  constructor(game, x, y) {
    Object.assign(this, { game, x, y });

    this.game.sleepyGuy = this;

    this.spritesheet = ASSET_MANAGER.getAsset(
      "./assets/entities/sleepyguy.png",
    );

    this.width = 200;
    this.height = 100;
    this.velocity = { x: 100, y: 100 };
    this.scale = 0.3;
    this.BB = null;

    this.state = 0; // 0: idle, 1: damaged
    this.currentFrame = 0;
    this.attackTimer = 0;
    this.isStickyBush = false;

    this.targetWaypointIndex = 0;
    this.lastSafeSpot = { x: this.x, y: this.y };

    this.animations = [];
    this.loadAnimations();
    this.updateBB();
  }

  loadAnimations() {
    for (let i = 0; i < NUM_ANIMATIONS; i++) {
      this.animations.push([]);
    }

    //spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop
    this.animations[0][0] = new Animator(
      this.spritesheet,
      0,
      0,
      442,
      247,
      5,
      0.5,
      0,
      true,
      true,
    ); // idle
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
    let targetPoint = null;

    if (waypoints && waypoints.length > 0) {
      this.isRetreating = false;
      targetPoint = waypoints[0];
    } else {
      // The path is empty (or was deleted). Check if we need to retreat.
      const distToSafe = Math.sqrt((this.lastSafeSpot.x - this.x)**2 + (this.lastSafeSpot.y - this.y)**2);
      if (distToSafe > 1) {
        this.isRetreating = true;
        targetPoint = this.lastSafeSpot;
      }
    }

    if (targetPoint) {
      let velocityLength = Math.sqrt(
        this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y
      );

      let slowEffect = this.isStickyBush ? StickyBush.slowFactor : 1;
      velocityLength *= slowEffect;      

      let remaining = velocityLength * TICK;

      while (remaining > 0) {
        let dx = targetPoint.x - this.x;
        let dy = targetPoint.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= remaining) {
          this.x = targetPoint.x;
          this.y = targetPoint.y;
          remaining -= distance;

          if (this.isRetreating) {
            // Reached last spot. Stop moving.
            this.isRetreating = false;
            break; 
          } else {
            this.lastSafeSpot = { x: this.x, y: this.y }; 
            
            let reachedNode = waypoints.shift(); 
            if (reachedNode) reachedNode.removeFromWorld = true;

            if (waypoints.length > 0) {
              targetPoint = waypoints[0];
            } else {
              break;
            }
          }
        } else {
          // Move part-way towards the target and finish this frame
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * remaining;
          this.y += Math.sin(angle) * remaining;
          break;
        }
      }
    }
    // Reset collision flag
    this.isStickyBush = false;
    this.updateBB();
  }

  handleBlockPhysics(entity) {
    const thisBB = this.BB;
    const blockBB = entity.BB;

    const overlapX = thisBB.right > blockBB.left && thisBB.left < blockBB.right;
    const overlapY = thisBB.bottom > blockBB.top && thisBB.top < blockBB.bottom;

    if (overlapX && overlapY) {
      // Calculate penetration depths from all 4 sides
      const penLeft = thisBB.right - blockBB.left;
      const penRight = blockBB.right - thisBB.left;
      const penTop = thisBB.bottom - blockBB.top;
      const penBottom = blockBB.bottom - thisBB.top;

      // Find the smallest penetration on each axis
      const diffX = Math.min(penLeft, penRight);
      const diffY = Math.min(penTop, penBottom);

      if (diffY < diffX) {
        // Vertical Collision
        if (penTop < penBottom) {
          // Standing on top of block
          this.y -= penTop;
          this.velocity.y = 0;
          this.onGround = true;
        } else {
          // Hitting head on ceiling
          this.y += penBottom;
          this.velocity.y = 0;
        }
      } else {
        // Horizontal Collision
        if (penLeft < penRight) {
          // Hit left side of block
          this.x -= penLeft;
          this.velocity.x = 0;
        } else {
          // Hit right side of block
          this.x += penRight;
          this.velocity.x = 0;
        }
      }
    }

    // Update BB after snapping position
    this.updateBB();
  }

  onCollision(entity) {
    if (this.dead) return;

    switch (entity.constructor.name) {
      case "Block":
        this.handleBlockPhysics(entity);
        break;
      case "Spikes":
      case "Ghost":
      case "Spider":
      case "Demon":
      case "VenusFlyTrap":
        this.onTakeDamage(entity);
        break;
      case "StickyBush":
        this.isStickyBush = true;
        break;
      case "Bed":
        this.onReachBed(entity);
        break;
      default:
        break;
    }
  }

  //triggers win condition when SleepyGuy reaches bed
  onReachBed(_bed) {
    this.game.gameWon = true;
    this.game.gameOver = true;
  }
  //triggers lose condition when SleepyGuy hit by ghost
  onTakeDamage(_ghost) {
    this.dead = true;
    this.attackTimer = 0;
  }

  updateBB() {
    const w = this.width * this.scale;
    const h = this.height * this.scale;
    this.BB = new BoundingBox(
      this.x - w, // / 2,
      this.y - h, // / 2,
      w * 2,
      h * 2,
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
      ctx.fillStyle = "blue";
      ctx.fillRect(offsetX, offsetY, drawW, drawH); // debug box
      console.log(anim.height, this.scale, drawH, offsetY);
    }

    ctx.drawImage(
      anim.spritesheet,
      anim.xStart + frame * (anim.width + anim.framePadding),
      anim.yStart,
      frameW,
      frameH,
      offsetX,
      offsetY,
      drawW,
      drawH,
    );
    // ctx.fillStyle = "Blue";
    // ctx.fillRect(this.x, this.y, this.width, this.height);

    if (PARAMS.DEBUG && this.BB) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
    }
  }
}
