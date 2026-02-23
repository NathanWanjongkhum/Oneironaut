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
