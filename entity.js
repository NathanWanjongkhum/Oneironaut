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
  constructor(game, x, y) {
    super(game, x, y);
    this.width = PARAMS.BLOCKWIDTH;
    this.height = PARAMS.BLOCKWIDTH;
    this.updateBB();
  }

  draw(ctx) {
    ctx.fillStyle = "saddlebrown";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    super.draw(ctx);
  }
}

class Spikes extends Entity {
  constructor(game, x, y) {
    super(game, x, y);

    this.width = 32;
    this.height = 32;
    this.scale = 1;

    this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/spider.png");

    this.updateBB();
  }

  updateBB() {
    const xScaler = 0.8;
    const yScaler = 0.5;

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
    // Draw spikes as triangles
    ctx.fillStyle = "#888888";
    const spikeWidth = this.width * this.scale;
    const spikeHeight = this.height * this.scale;

    // Draw 3 spikes
    const spikeCount = 3;
    const spikeSpacing = spikeWidth / spikeCount;

    for (let i = 0; i < spikeCount; i++) {
      ctx.beginPath();
      ctx.moveTo(this.x + i * spikeSpacing, this.y + spikeHeight);
      ctx.lineTo(this.x + i * spikeSpacing + spikeSpacing / 2, this.y);
      ctx.lineTo(this.x + (i + 1) * spikeSpacing, this.y + spikeHeight);
      ctx.closePath();
      ctx.fill();
    }

    if (PARAMS.DEBUG && this.BB) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(this.BB.x, this.BB.y, this.BB.width, this.BB.height);
    }
  }
}

class StickyBush extends Entity {
  static slowFactor = 0.5;

  constructor(game, x, y) {
    super(game, x, y);

    this.width = 64;
    this.height = 64;
    this.scale = 1;

    // this.spritesheet = ASSET_MANAGER.getAsset("./assets/entities/bush.png");

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
    // this.animations[0].drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

    // Placeholder
    ctx.beginPath();
    ctx.arc(this.x, this.y, 50, 0, Math.PI * 2);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();

    super.draw(ctx);
  }
}
