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
  }

  update() {
    this.updateBB();
  }

  draw(ctx) {
    if (PARAMS.DEBUG && this.BB) {
      this.BB.debugDraw();
    }
}

  updateBB() {
    this.BB?.update(this.x, this.y, this.width * this.scale, this.height * this.scale);
  }

  loadAnimation(xStart, yStart, frameCount, frameDuration) {
    return new Animator(
      this.spritesheet,
      xStart,
      yStart,
      this.width,
      this.height,
      frameCount,
      frameDuration,
      0,
      false,
      true,
    );
  }
}

class Bed extends Entity {
  constructor(game, positionX, postionY) {
    this.game = game;
    this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/bed.png");

    this.x = positionX;
    this.y = postionY;
    this.radius = 100;
    this.scale = 0.5;
    this.BB = null;

    this.animations = [];
    this.loadAnimations();
    this.BB = new BoundingBox(this.x, this.y,
        540 * this.scale, 460 * this.scale);//540 = sprite pixel width
  };
  loadAnimations() {
    this.animations.push([]);
    //spritesheet, xStart, yStart, width, height, frameCount, frameDuration, framePadding, reverse, loop
    this.animations[0] = new Animator(this.spritesheet, 0, 0, 540, 460, 1, 1, 0, 0, 1); //bed
  }
  collide(other) {
    return getDistance(this, other) < this.radius + other.radius;
  };
  draw(ctx) {
    this.animations[0].drawFrame(
      this.game.clockTick,
      ctx,
      this.x - this.game.camera.x,
      this.y - this.game.camera.y,
      this.scale,
    );
    super.draw(ctx);
  };
}




class Block extends Entity {
  constructor(game, x, y, opts = {}) {
    super(game, x, y);
    this.width = PARAMS.BLOCKWIDTH;
    this.height = PARAMS.BLOCKWIDTH;

    // Optional sprite rendering (used by sandbags)
    this.sprite = opts.sprite || null;          // Image object
    this.spriteScale = opts.spriteScale ?? 1;   // draw scale (visual only)
    this.spriteYOffset = opts.spriteYOffset ?? 0; // pixel offset (visual only)

    this.updateBB();
  }

  draw(ctx) {
    if (this.sprite) {
      // Bottom-align sprite inside the tile
      const w = this.width * this.spriteScale;
      const h = this.height * this.spriteScale;
      const dx = (this.x - this.game.camera.x);
      const dy = (this.y - this.game.camera.y) + this.spriteYOffset;
      ctx.drawImage(this.sprite, dx, dy, w, h);
    } else {
      ctx.fillStyle = "saddlebrown";
      ctx.fillRect(this.x - this.game.camera.x, this.y - this.game.camera.y, this.width, this.height);
    }
    super.draw(ctx);
  }
}

// ===== TeddyBear decoy entity =====
class TeddyDecoy extends Entity {
  constructor(game, x, y, opts = {}) {
    super(game, x, y);

    // draw
    this.img = ASSET_MANAGER.getAsset("./assets/items/TeddyBear.png");
    this.scale = opts.scale ?? 0.55;

    // time alive (seconds)
    this.lifetime = opts.lifetime ?? 15.0;
    this.age = 0;

    // OPTIONAL: break after N enemy touches (Infinity = never breaks)
    this.maxHits = opts.maxHits ?? Infinity;
    this.hits = 0;
    this.hitCooldown = 0; // small i-frames so it doesn't “multi-hit” instantly

    // Treat x,y as CENTER
    this.baseW = this.img ? this.img.width : 64;
    this.baseH = this.img ? this.img.height : 64;

    this.updateBB();
  }

  updateBB() {
    const w = this.baseW * this.scale;
    const h = this.baseH * this.scale;
    this.BB.update(this.x - w / 2, this.y - h / 2, w, h);
  }

  update() {
    if (this.game.mode !== "gameplay") return;

    const TICK = this.game.clockTick;
    this.age += TICK;

    if (this.hitCooldown > 0) this.hitCooldown -= TICK;

    if (this.age >= this.lifetime) {
      this.removeFromWorld = true;
    }

    this.updateBB();
  }

  onCollision(other) {
    // IMPORTANT: do NOT insta-delete on touch (that causes the “<1 sec” disappear)
    if (!(other instanceof Monster)) return;

    // stop spam hits if already overlapping
    if (this.hitCooldown > 0) return;
    this.hitCooldown = 0.25;

    // OPTIONAL: keep monster committed to the decoy briefly
    other.aggroTimer = Math.max(other.aggroTimer ?? 0, 0.6);

    // OPTIONAL: if you want it breakable, set maxHits = 3 (or any number)
    if (Number.isFinite(this.maxHits)) {
      this.hits++;
      if (this.hits >= this.maxHits) this.removeFromWorld = true;
    }
  }

  draw(ctx) {

    if (this.img) {
      const w = this.baseW * this.scale;
      const h = this.baseH * this.scale;

      // draw teddy
      ctx.drawImage(this.img, (this.x - this.game.camera.x) - w / 2, (this.y - this.game.camera.y) - h / 2, w, h);

      // ===== countdown timer (5..1) drawn in front of teddy =====
      const remaining = Math.max(0, this.lifetime - this.age);
      const secs = Math.ceil(remaining);

      if (secs > 0) {
        const tx = this.x;
        const ty = this.y - h / 2 - 14; // just above the teddy

        ctx.save();
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // shadow/outline
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillText(String(secs), tx + 2, ty + 2);

        // main text
        ctx.fillStyle = "white";
        ctx.fillText(String(secs), tx, ty);

        ctx.restore();
      }
    }

    super.draw(ctx);
  }
}

class Spikes extends Entity {
  constructor(game, x, y) {
    super(game, x, y);

    this.width = 32;
    this.height = 32;
    this.scale = 1;

    this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/spikes.png");

    this.updateBB();
  }

  updateBB() {
    const xScaler = 1;
    const yScaler = 0.6;

    const bbWidth = this.width * this.scale * xScaler;
    const bbHeight = this.height * this.scale * yScaler;

    const xOffset = (this.width * this.scale - bbWidth) / 2;
    const yOffset = this.height * this.scale - bbHeight;

    this.BB.update(this.x + xOffset, this.y + yOffset, bbWidth, bbHeight);
  }

  draw(ctx) {

    const frameWidth = 48;
    const frameHeight = 48;

    ctx.drawImage(
      this.spritesheet,
      frameWidth * 2,
      frameHeight / 2,
      frameWidth,
      frameHeight / 2,
      (this.x - this.game.camera.x) - 16,
      (this.y - this.game.camera.y) + 8,
      frameWidth * this.scale,
      (frameHeight / 2) * this.scale,
    );
    ctx.drawImage(
      this.spritesheet,
      frameWidth * 2,
      frameHeight / 2,
      frameWidth,
      frameHeight / 2,
      (this.x - this.game.camera.x),
      (this.y - this.game.camera.y) + 8,
      frameWidth * this.scale,
      (frameHeight / 2) * this.scale,
    );

    super.draw(ctx);
  }
}

class StickyBush extends Entity {
  static slowFactor = 0.5;

  constructor(game, x, y) {
    super(game, x, y);

    this.width = 32;
    this.height = 32;
    this.scale = 2;

    this.spritesheet = ASSET_MANAGER.getAsset(
      "./assets/entities/Bush_simple2_1.png",
    );

    this.updateBB();
  }

  updateBB() {
    const padding = 10;

    this.BB.update(this.x + padding, this.y + padding,
      this.width * this.scale - padding * 2, this.height * this.scale - padding * 2);
  }

  update() {
    super.update();
  }

  draw(ctx) {
    ctx.drawImage(
      this.spritesheet,
      0,
      0,
      this.width,
      this.height,
      this.x - this.game.camera.x,
      this.y - this.game.camera.y,
      this.width * this.scale,
      this.height * this.scale,
    );

    super.draw(ctx);
  }
}
