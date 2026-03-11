const NUM_ANIMATIONS = 2;

class SleepyGuy { //extends Entity??
  constructor(game, x, y) {
    Object.assign(this, { game, x, y });

    this.game.sleepyGuy = this;

    this.spritesheet = ASSET_MANAGER.getAsset(
      "./assets/entities/sleepyguy.png",
    );

    this.damageCooldown = 0;
    this.damageCooldownDuration = 0.25; // quarter second between hits

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
    this.BB = new BoundingBox(
      this.x - (this.width * this.scale / 2),
      this.y - (this.height * this.scale / 2),
      this.width * this.scale,
      this.height * this.scale,
    );
    this._wasStrangeLamp = false;

    this.game.camera.setPlayer(this);
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
    if (this.damageCooldown > 0) {
      this.damageCooldown -= TICK;
      if (this.damageCooldown < 0) this.damageCooldown = 0;
    }
    if (this.dead) {
      this.updateBB();
      return;
    }

    const phasing = this.game.strangeLampTimer > 0;
    const wasPhasing = this._wasStrangeLamp;
    this._wasStrangeLamp = phasing;

    // Move along waypoints if they exist
    const waypoints = this.game.waypoints;
    if (waypoints && waypoints.length > 0) {
      if (this.targetWaypointIndex >= waypoints.length) {
        this.targetWaypointIndex = waypoints.length - 1;
      }

      let velocityLength = Math.sqrt(
        this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y,
      );

      let slowEffect = this.isStickyBush ? StickyBush.slowFactor : 1;
      velocityLength *= slowEffect;

      // Rocket passive speed boost
      const rocketBoost = this.game.rocketActive ? (this.game.rocketSpeedMultiplier ?? 1.6) : 1;
      velocityLength *= rocketBoost;

      // Use remaining movement this frame
      let remaining = velocityLength * TICK;
      let currentIndex = this.targetWaypointIndex;

      while (remaining > 0 && waypoints.length > 0) {
        // Recompute target and deltas for current index
        this.target = waypoints[currentIndex];
        if (!this.target) {
          this.targetWaypointIndex = Math.max(0, waypoints.length - 1);
          break;
        }
        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
          // Exactly on the point so consume it and continue
          waypoints.shift();
          continue;
        }

        if (distance <= remaining) {
          // Snap to this waypoint, consume movement, and consume the waypoint
          this.x = this.target.x;
          this.y = this.target.y;
          remaining -= distance;
          waypoints.shift();
          continue;
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

    // Safety net: if enemy overlap is detected here, force damage.
    // This catches edge cases where dynamic collision order misses a frame.
    this.checkEnemyContact();

    // If Strange Lamp JUST ended this frame, push SleepyGuy out of any wall/sandbag/spikes
    if (wasPhasing && !phasing) {
      this.pushOutOfSolids();
    }
  }

  checkEnemyContact() {
    if (this.dead || this.game.gameOver) return false;
    if ((this.game.strangeLampTimer ?? 0) > 0) return false;
    if ((this.game.sleepMaskTimer ?? 0) > 0) return false;
    if (this.game.dreamCatcherActive) return false;
    if (!this.BB) return false;

    const pad = 6;
    const probe = new BoundingBox(
      this.BB.left - pad,
      this.BB.top - pad,
      this.BB.width + pad * 2,
      this.BB.height + pad * 2,
    );

    for (const e of this.game.entities) {
      if (!(e instanceof Monster)) continue;
      if (e instanceof Sheep) continue;
      if (e.dead || e.removeFromWorld || !e.BB) continue;
      if (probe.collide(e.BB)) {
        this.onTakeDamage(e);
        return true;
      }
    }

    return false;
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

  handleBlockPhysics(entity, stopPath = true) {
    const thisBB = this.BB;
    const otherBB = entity.BB;
    if (!thisBB || !otherBB) return false;

    const overlapX = thisBB.right > otherBB.left && thisBB.left < otherBB.right;
    const overlapY = thisBB.bottom > otherBB.top && thisBB.top < otherBB.bottom;
    if (!(overlapX && overlapY)) return false;

    const penLeft = thisBB.right - otherBB.left;
    const penRight = otherBB.right - thisBB.left;
    const penTop = thisBB.bottom - otherBB.top;
    const penBottom = otherBB.bottom - thisBB.top;

    const diffX = Math.min(penLeft, penRight);
    const diffY = Math.min(penTop, penBottom);

    if (diffY < diffX) {
      if (penTop < penBottom) this.y -= penTop;
      else this.y += penBottom;
    } else {
      if (penLeft < penRight) this.x -= penLeft;
      else this.x += penRight;
    }

    this.updateBB();

    if (stopPath) {
      if (this.game.waypoints) this.game.waypoints.length = 0;
      this.targetWaypointIndex = 0;
    }

    return true;
  }

  pushOutOfSolids() {
    const bw = PARAMS.BLOCKWIDTH;
    if (!this.game.gridMap || !this.BB) return;

    let moved = false;

    // Try a few times in case we're overlapping multiple blocks/spikes
    for (let iter = 0; iter < 8; iter++) {
      this.updateBB();

      const minGx = Math.floor(this.BB.left / bw) - 1;
      const maxGx = Math.floor(this.BB.right / bw) + 1;
      const minGy = Math.floor(this.BB.top / bw) - 1;
      const maxGy = Math.floor(this.BB.bottom / bw) + 1;

      let anyThisIter = false;

      for (let gy = minGy; gy <= maxGy; gy++) {
        for (let gx = minGx; gx <= maxGx; gx++) {
          const e = this.game.gridMap[`${gx},${gy}`];
          if (!e || e.removeFromWorld || !e.BB) continue;

          // Only push out of walls/sandbags + spikes
          if (!(e instanceof Block) && !(e instanceof Spikes)) continue;

          if (this.BB.collide(e.BB)) {
            // push out, BUT don't kill the waypoint path every tiny correction
            const did = this.handleBlockPhysics(e, false);
            if (did) {
              anyThisIter = true;
              moved = true;
            }
          }
        }
      }

      if (!anyThisIter) break;
    }

    // If we had to push you out after phasing, stop the path once (prevents re-entering)
    if (moved) {
      if (this.game.waypoints) this.game.waypoints.length = 0;
      this.targetWaypointIndex = 0;
    }
  }

  onCollision(entity) {
    if (this.dead) return;

    const phasing = this.game.strangeLampTimer > 0;
    const protectedFromMobs =
      this.game.sleepMaskTimer > 0 ||
      phasing ||
      this.game.dreamCatcherActive;

    switch (entity.constructor.name) {
      case "Block":
        // Strange Lamp lets Sleepy Guy phase through walls/sandbags
        if (phasing) break;
        this.handleBlockPhysics(entity, true);
        break;

      case "Spikes":
        // Ignore spikes while phasing
        if (phasing) break;
        this.onTakeDamage(entity);
        break;

      case "Ghost":
      case "Spider":
      case "Demon":
      case "VenusFlyTrap":
        if (protectedFromMobs) break;
        if (!this.hasBlockBetween(entity)) this.onTakeDamage(entity);
        break;

      case "StickyBush":
        // Optional: ignore sticky slow while phasing
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
    this.game.updateHighest();
    this.game.mode = "pause";
  }

  onTakeDamage(entity) {
    if (entity?.sleepTimer > 0) return;
    if ((this.game.strangeLampTimer ?? 0) > 0) return;
    if (this.game.dreamCatcherActive) return;
    if (this.game.gameOver) return;
    if (this.damageCooldown > 0) return;

    // Pajama Armor blocks 3 hits, then breaks
    if (this.game.pajamaArmorActive && this.game.pajamaArmorHits > 0) {
      this.game.pajamaArmorHits--;
      this.damageCooldown = this.damageCooldownDuration;

      if (this.game.pajamaArmorHits <= 0) {
        this.game.pajamaArmorHits = 0;
        this.game.pajamaArmorActive = false;
      }

      return;
    }

    this.dead = true;
    this.attackTimer = 0;
    this.game.gameWon = false;
    this.game.gameOver = true;
    this.game.mode = "pause";
    if (this.game.waypoints) this.game.waypoints.length = 0;
    this.targetWaypointIndex = 0;
  }

  updateBB() {
    const w = this.width * this.scale;
    const h = this.height * this.scale;
    this.BB.update(
      this.x - (w / 2),
      this.y - (h / 2),
      w,
      h,
    );
  }

  draw(ctx) {

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

    ctx.save();

    if (PARAMS.DEBUG) {
      ctx.fillStyle = "blue";
      ctx.fillRect(offsetX - this.game.camera.x, offsetY - this.game.camera.y, drawW, drawH);
    }

    // ===== Strange Lamp (semi-transparent while active) =====
    if (this.game.strangeLampTimer > 0) {
      const pulse = 0.45 + 0.10 * Math.sin(performance.now() * 0.02);
      ctx.globalAlpha = pulse;
    }

    ctx.drawImage(
      anim.spritesheet,
      anim.xStart + frame * (anim.width + anim.framePadding),
      anim.yStart,
      frameW,
      frameH,
      offsetX - this.game.camera.x,
      offsetY - this.game.camera.y,
      drawW,
      drawH,
    );

    ctx.restore();

    // ===== Sleep Mask overlay (drawn in front of SleepyGuy) =====
    if (this.game.sleepMaskTimer > 0) {
      const maskImg = ASSET_MANAGER.getAsset("./assets/items/SleepMask.png");
      if (maskImg) {
        const mw = drawW * 0.55;
        const mh = mw * (maskImg.height / maskImg.width);

        const mx = this.x - mw / 2 - this.game.camera.x;
        const my = this.y - drawH * 0.10 - mh / 2 - this.game.camera.y;

        ctx.save();
        const a = Math.min(1, this.game.sleepMaskTimer / 0.5);
        ctx.globalAlpha = Math.max(0.4, Math.min(1, a));
        ctx.drawImage(maskImg, mx, my, mw, mh);
        ctx.restore();
      }
    }

    // ===== Pajama overlay (drawn when armor is active) =====
    if (this.game.pajamaArmorActive) {
      const pajamaImg = ASSET_MANAGER.getAsset("./assets/items/Pijama.png");
      if (pajamaImg) {
        const pw = drawW * 0.65; // Scale relative to SleepyGuy
        const ph = pw * (pajamaImg.height / pajamaImg.width);

        // Position on his body
        const px = this.x - pw / 2 - this.game.camera.x;
        const py = this.y - drawH * 0.15 - ph / 2 - this.game.camera.y;

        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.drawImage(pajamaImg, px, py, pw, ph);
        ctx.restore();
      }
    }

    if (PARAMS.DEBUG && this.BB) {
      this.BB.debugDraw(ctx, this.game.camera);
    }

  }
}
