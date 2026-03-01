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
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1;
      ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
    }
  }

  updateBB() {
    this.BB = new BoundingBox(
      this.x,
      this.y,
      this.width * this.scale,
      this.height * this.scale,
    );
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
      const dx = this.x + (this.width - w) / 2;
      const dy = this.y + (this.height - h) + this.spriteYOffset;
      ctx.drawImage(this.sprite, dx, dy, w, h);
    } else {
      ctx.fillStyle = "saddlebrown";
      ctx.fillRect(this.x, this.y, this.width, this.height);
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
    this.BB = new BoundingBox(this.x - w / 2, this.y - h / 2, w, h);
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
      ctx.drawImage(this.img, this.x - w / 2, this.y - h / 2, w, h);
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

    this.BB = new BoundingBox(
      this.x + xOffset,
      this.y + yOffset,
      bbWidth,
      bbHeight,
    );
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
      this.x - 16,
      this.y + 8,
      frameWidth * this.scale,
      (frameHeight / 2) * this.scale,
    );
    ctx.drawImage(
      this.spritesheet,
      frameWidth * 2,
      frameHeight / 2,
      frameWidth,
      frameHeight / 2,
      this.x,
      this.y + 8,
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

    this.BB = new BoundingBox(
      this.x + padding,
      this.y + padding,
      this.width * this.scale - padding * 2,
      this.height * this.scale - padding * 2,
    );
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
      this.x,
      this.y,
      this.width * this.scale,
      this.height * this.scale,
    );

    super.draw(ctx);
  }
}
