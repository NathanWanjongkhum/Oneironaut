class GameEngine {
  constructor(options) {
    this.ctx = null;
    this.entities = [];

    this.click = null;
    this.rightClick = null;
    this.mouse = null;
    this.rightClickDown = false;
    this.wheel = null;
    this.keys = {};

    this.gameOver = false;
    this.gameWon = false;

    this.clockTick = 0;
    this.timer = new Timer();

    this.mode = "menu"; // "menu" || "gameplay"

    this.options = options || { debugging: false };
    this.inLevel = true;

    this.currentLevel = 0; //initial state 0 marks not in a level
    this.gridMap = {};

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

    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault(); 
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 2) {
        this.rightClickDown = true;
      }
    });

    canvas.addEventListener("mouseup", (e) => {
      if (e.button === 2) {
        this.rightClickDown = false;
      }
    });

    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      this.rightClick = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    });

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

  checkGridCollision(entity) {
    if (!entity.BB) return;

    const left = Math.floor(entity.BB.left / PARAMS.BLOCKWIDTH);
    const right = Math.floor(entity.BB.right / PARAMS.BLOCKWIDTH);
    const top = Math.floor(entity.BB.top / PARAMS.BLOCKWIDTH);
    const bottom = Math.floor(entity.BB.bottom / PARAMS.BLOCKWIDTH);

    for (let x = left; x <= right; x++) {
      for (let y = top; y <= bottom; y++) {
        const gridEntity = this.gridMap[`${x},${y}`];

        if (gridEntity && entity.onCollision) {
          if (entity.BB.collide(gridEntity.BB)) {
            entity.onCollision(gridEntity);
          }
        }
      }
    }
  }

  // Call when you press "New Dream"
  startGameplay() {
    this.mode = "gameplay";
    if (window.setMusicMode) window.setMusicMode("dream");

    this.currentLevel = 1;
    // clear menu + reset overlay
    this.entities = [];
    this.optionsOverlay = null;

    this.addEntity(new Background(this));

    // Level-specific spawns
    Levels.buildLevel(this);

    // Common entities
    this.addEntity(new EndGame(this));
    this.addEntity(new MenuRoomController(this));

    this.blockMap = {};

    this.entities.forEach((e) => {
      // Keep this last
      if (e instanceof Block) {
        const gx = Math.floor(e.x / PARAMS.BLOCKWIDTH);
        const gy = Math.floor(e.y / PARAMS.BLOCKWIDTH);

        engine.blockMap[`${gx},${gy}`] = e;
      }
    });

    // // reset dream bubble state
    // this.prevB = false;
    // if (this.dreamBubble) this.dreamBubble.close(true);

    // const cw = this.ctx.canvas.width;
    // const ch = this.ctx.canvas.height;

    // const keys = Object.keys(ITEM_DEFS);
    // const startX = 260;
    // const startY = 160;
    // const gapX = 140;
    // const gapY = 120;
    // const cols = 3;

    // for (let i = 0; i < keys.length; i++) {
    //   const id = keys[i];
    //   const col = i % cols;
    //   const row = Math.floor(i / cols);

    //   let x = startX + col * gapX;
    //   let y = startY + row * gapY;

    //   x = Math.min(cw - 120, Math.max(120, x));
    //   y = Math.min(ch - 120, Math.max(120, y));

    //   this.addEntity(new PickupItem(this, x, y, id));
    // }

    // this.addEntity(new EndGame(this));
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

    // HUD consumes right clicks in gameplay
if (this.mode === "gameplay" && this.rightClickDown && this.mouse && this.waypoints) {
      const clickX = this.mouse.x;
      const clickY = this.mouse.y;
      const clickRadius = 30; 

      let foundIndex = -1;

      for (let i = 0; i < this.waypoints.length; i++) {
        const wp = this.waypoints[i];
        const dist = Math.sqrt((wp.x - clickX) ** 2 + (wp.y - clickY) ** 2);

        if (dist <= clickRadius) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex !== -1) {
        this.waypoints.splice(foundIndex);
      }
      
      this.rightClick = null; 
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

    // Update all entities
    for (let i = 0; i < this.entities.length; i++) {
      const ent = this.entities[i];
      if (!ent.removeFromWorld && ent.update) {
        ent.update();
      }
    }

    // Grid Collisions
    for (let i = 0; i < this.entities.length; i++) {
      const ent = this.entities[i];

      // grid-aligned static entities
      if (
        !ent.removeFromWorld &&
        !(ent instanceof Block) &&
        !(ent instanceof Spikes)
      ) {
        this.checkGridCollision(ent);
      }
    }

    // Dynamic Collisions
    for (let i = 0; i < this.entities.length; i++) {
      const entA = this.entities[i];

      // Skip entities that don't participate in collisions
      if (!entA.BB || entA.removeFromWorld) continue;

      // Skip checking the same pair twice
      for (let j = i + 1; j < this.entities.length; j++) {
        const entB = this.entities[j];
        
        if (!entB.BB || entB.removeFromWorld) continue;

        // If their bounding boxes overlap, trigger the collision response
        if (entA.BB.collide(entB.BB)) {
          // Notify both entities so they can react independently
          if (entA.onCollision) entA.onCollision(entB);
          if (entB.onCollision) entB.onCollision(entA);
        }
      }
    }

    // Clean up dead entities
    for (let i = this.entities.length - 1; i >= 0; --i) {
      if (this.entities[i].removeFromWorld) {
        this.entities.splice(i, 1);
      }
    }
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
