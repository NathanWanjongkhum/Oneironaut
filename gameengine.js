// gameengine.js
class GameEngine {
  constructor(options) {
    this.ctx = null;
    this.entities = [];

    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.keys = {};

    this.gameOver = false;
    this.gameWon = false;

    this.clockTick = 0;
    this.timer = new Timer();

    this.mode = "menu"; // "menu" || "gameplay"

    this.options = options || { debugging: false };
    this.inLevel = true;

    // Dream Bubble (create lazily later)
    this.dreamBubble = null;
    this.prevB = false;

    // Inventory + HUD (HUD draws in gameplay only)
    this.inventory = new Inventory(3);
    this.hud = new HUD(this, this.inventory);

    // In-game Options overlay
    this.optionsOverlay = null;
  }

  init(ctx) {
    this.ctx = ctx;
    this.startInput();
  }

  start() {
    const loop = () => {
      this.loop();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  startInput() {
    const canvas = this.ctx.canvas;

    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      this.click = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    });

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      this.mouse = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    });

    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  // Call when you press "New Dream"
  startGameplay() {
    this.mode = "gameplay";
    if (window.setMusicMode) window.setMusicMode("dream");

    // clear menu + reset overlay
    this.entities = [];
    this.optionsOverlay = null;

    // reset dream bubble state
    this.prevB = false;
    if (this.dreamBubble) this.dreamBubble.close(true);

    // Spawn gameplay entities
    this.addEntity(new Background(this));
    this.addEntity(new Ghost(this, 700, 50));
    this.addEntity(new Ghost(this, 775, 350));
    this.addEntity(new Ghost(this, 300, 400));
    this.addEntity(new Bed(this, 700, 300));
    this.addEntity(new SleepyGuy(this, 100, 100));
    this.addEntity(new WaypointBuilder(this));

    // Spawn ALL items (test)
    const cw = this.ctx.canvas.width;
    const ch = this.ctx.canvas.height;

    const keys = Object.keys(ITEM_DEFS);
    const startX = 260;
    const startY = 160;
    const gapX = 140;
    const gapY = 120;
    const cols = 3;

    for (let i = 0; i < keys.length; i++) {
      const id = keys[i];
      const col = i % cols;
      const row = Math.floor(i / cols);

      let x = startX + col * gapX;
      let y = startY + row * gapY;

      x = Math.min(cw - 120, Math.max(120, x));
      y = Math.min(ch - 120, Math.max(120, y));

      this.addEntity(new PickupItem(this, x, y, id));
    }

    this.addEntity(new EndGame(this));
  }

  goToMainMenu() {
    this.mode = "menu";
    if (window.setMusicMode) window.setMusicMode("menu");

    this.entities = [];
    this.inventory.clear();
    this.optionsOverlay = null;

    this.prevB = false;
    if (this.dreamBubble) this.dreamBubble.close(true);

    this.addEntity(new MenuRoomController(this));
  }

  update() {
    const cw = this.ctx.canvas.width;
    const ch = this.ctx.canvas.height;

    // HUD layout always updates
    this.hud.update(cw, ch);

    // Options overlay pauses gameplay
    if (this.mode === "gameplay" && this.optionsOverlay) {
      this.optionsOverlay.update(cw, ch);

      if (this.click) {
        const { x, y } = this.click;
        this.click = null;
        this.optionsOverlay.handleClick(x, y);
      }

      if (!this.optionsOverlay.isOpen) this.optionsOverlay = null;
      return;
    }

    // ===== Dream Bubble toggle (Key B) =====
    if (this.mode === "gameplay") {
      const bDown = !!this.keys["KeyB"];
      if (bDown && !this.prevB) {
        // create lazily here (ASSET_MANAGER exists by now)
        if (!this.dreamBubble) this.dreamBubble = new DreamBubbleOverlay(this);
        this.dreamBubble.toggle();
      }
      this.prevB = bDown;

      if (this.dreamBubble) this.dreamBubble.update();
    } else {
      this.prevB = false;
      if (this.dreamBubble) this.dreamBubble.close(true);
    }

    // HUD consumes clicks in gameplay
    if (this.mode === "gameplay" && this.click) {
      const { x, y } = this.click;
      if (this.hud.handleClick(x, y)) this.click = null;
    }

    // HUD requests
    if (this.hud.requestExitToMenu) {
      this.hud.requestExitToMenu = false;
      this.goToMainMenu();
      return;
    }

    if (this.hud.requestOpenOptions) {
      this.hud.requestOpenOptions = false;
      this.optionsOverlay = new OptionsOverlay(this);
      return;
    }

    // Update entities
    for (let i = 0; i < this.entities.length; i++) {
      const ent = this.entities[i];
      if (!ent.removeFromWorld && ent.update) ent.update();
    }

    // Remove entities marked for deletion
    this.entities = this.entities.filter((e) => !e.removeFromWorld);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    for (let i = 0; i < this.entities.length; i++) {
      const ent = this.entities[i];
      if (ent.draw) ent.draw(this.ctx);
    }

    if (this.mode === "gameplay") {
      if (this.dreamBubble) this.dreamBubble.draw(this.ctx);

      this.hud.draw(this.ctx);

      if (this.optionsOverlay) {
        const cw = this.ctx.canvas.width;
        const ch = this.ctx.canvas.height;
        this.optionsOverlay.draw(this.ctx, cw, ch);
      }
    }
  }

  loop() {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
  }
}
