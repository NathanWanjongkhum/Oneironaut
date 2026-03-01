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
    if (waypoints && waypoints.length > 0) {
      let velocityLength = Math.sqrt(
        this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y,
      );

      let slowEffect = this.isStickyBush ? StickyBush.slowFactor : 1;
      velocityLength *= slowEffect;

      // Rocket passive speed boost (after you press T on the Rocket in the dream bubble)
      const rocketBoost = this.game.rocketActive ? (this.game.rocketSpeedMultiplier ?? 1.6) : 1;
      velocityLength *= rocketBoost;


      // Use remaining movement this frame
      let remaining = velocityLength * TICK;
      let currentIndex = this.targetWaypointIndex;

      while (remaining > 0) {
        // Recompute target and deltas for current index
        this.target = waypoints[currentIndex];
        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

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

    // Reset collision flag
    this.isStickyBush = false;
    this.updateBB();
  }

  // Put this helper RIGHT ABOVE handleBlockPhysics(entity)
  hasBlockBetween(other) {
    const bw = PARAMS.BLOCKWIDTH;
    if (!this.game.gridMap) return false;

    const ax = this.x;
    const ay = this.y;

    // enemy center
    const bx = other?.BB ? (other.BB.x + other.BB.width / 2) : other.x;
    const by = other?.BB ? (other.BB.y + other.BB.height / 2) : other.y;

    const dx = bx - ax;
    const dy = by - ay;
    const dist = Math.hypot(dx, dy);
    if (dist <= bw) return false;

    // sample along the line (skip endpoints)
    const steps = Math.ceil(dist / (bw / 2));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const px = ax + dx * t;
      const py = ay + dy * t;

      const gx = Math.floor(px / bw);
      const gy = Math.floor(py / bw);

      const hit = this.game.gridMap[`${gx},${gy}`];
      if (hit instanceof Block) return true;
    }
    return false;
  }

  handleBlockPhysics(entity) {
    const thisBB = this.BB;
    const blockBB = entity.BB;

    const overlapX = thisBB.right > blockBB.left && thisBB.left < blockBB.right;
    const overlapY = thisBB.bottom > blockBB.top && thisBB.top < blockBB.bottom;

    if (overlapX && overlapY) {
      const penLeft = thisBB.right - blockBB.left;
      const penRight = blockBB.right - thisBB.left;
      const penTop = thisBB.bottom - blockBB.top;
      const penBottom = blockBB.bottom - thisBB.top;

      const diffX = Math.min(penLeft, penRight);
      const diffY = Math.min(penTop, penBottom);

      if (diffY < diffX) {
        // Vertical
        if (penTop < penBottom) this.y -= penTop;
        else this.y += penBottom;
      } else {
        // Horizontal
        if (penLeft < penRight) this.x -= penLeft;
        else this.x += penRight;
      }
    }

    this.updateBB();

    // IMPORTANT for click-to-move: stop the current path so you don't "fight" the wall forever
    if (this.game.waypoints) this.game.waypoints.length = 0;
    this.targetWaypointIndex = 0;
  }

  onCollision(entity) {
    if (this.dead) return;

    const lampActive = (this.game.strangeLampTimer ?? 0) > 0;

    switch (entity.constructor.name) {
      case "Block":
        this.handleBlockPhysics(entity);
        break;

      case "Spikes":
        if (!lampActive) this.onTakeDamage(entity);
        break;

      case "Ghost":
      case "Spider":
      case "Demon":
      case "VenusFlyTrap":
        // SleepMask: mobs can't “catch” you while blinded
        if (this.game.sleepMaskTimer > 0) break;

        // Strange Lamp: invulnerable
        if (lampActive) break;

        // Prevent "hit through walls"
        if (!this.hasBlockBetween(entity)) this.onTakeDamage(entity);
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
  onTakeDamage(_ghost) {
    if ((this.game.strangeLampTimer ?? 0) > 0) return;
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

    // ===== Strange Lamp (semi-transparent while active) =====
    const lampActive = (this.game.strangeLampTimer ?? 0) > 0;
    const lampAlpha = lampActive ? 0.45 : 1.0;

    ctx.save();
    ctx.globalAlpha *= lampAlpha;

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
      drawH
    );

    ctx.restore();

    // ===== Sleep Mask overlay (drawn in front of SleepyGuy) =====
    if (this.game.sleepMaskTimer > 0) {
      const maskImg = ASSET_MANAGER.getAsset("./assets/items/SleepMask.png");
      if (maskImg) {
        // Size relative to SleepyGuy draw size
        const mw = drawW * 0.55;
        const mh = mw * (maskImg.height / maskImg.width);

        // Position near the face (slightly above center)
        const mx = this.x - mw / 2;
        const my = this.y - drawH * 0.10 - mh / 2;

        ctx.save();
        // Optional: slight fade when about to end
        const a = Math.min(1, this.game.sleepMaskTimer / 0.5);
        ctx.globalAlpha = Math.max(0.4, Math.min(1, a));
        ctx.drawImage(maskImg, mx, my, mw, mh);
        ctx.restore();
      }
    }

    if (PARAMS.DEBUG && this.BB) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
    }
  }
}
