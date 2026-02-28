// ===== Geometry helpers (used by Sword) =====
function clamp01(t) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

// Squared distance from point P to segment AB
function dist2PointToSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const abLen2 = abx * abx + aby * aby;
  const t = abLen2 === 0 ? 0 : clamp01((apx * abx + apy * aby) / abLen2);
  const cx = ax + abx * t;
  const cy = ay + aby * t;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy;
}

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

    // ===== Sword weapon state =====
    this.swordSwing = null; // {id,x,y,baseAngle,t,duration,sweep,length,thickness}
    this.swordSwingId = 0;
    this.swordCooldown = 0;

    // Dream Bubble (create lazily later)
    this.dreamBubble = null;
    this.prevB = false;

    // Inventory + HUD (HUD draws in gameplay only)
    this.inventory = new Inventory(3);
    this.hud = new HUD(this, this.inventory);

    // In-game Options overlay
    this.optionsOverlay = null;

    // ===== Sandbag state =====
    this.sandbagCooldown = 0;

    this.sleepDustCooldown = 0;
    this.sleepDustSplash = null; // {x,y,t,duration,r}

    // ===== TeddyBear (decoy) state =====
    this.teddyCooldown = 0;
    this.teddyDecoy = null;     // active TeddyDecoy entity
    this.teddyLureRadius = 900; // px radius enemies will prefer the bear

    // ===== Dream Bubble take (Key T) =====
    this.prevT = false;

    // ===== Passive items =====
    this.dreamCatcherActive = false;
    this.dreamCatcherRadius = 85;
    this.dreamCatcherMinRadius = 30;
    this.dreamCatcherMaxRadius = 210;
    this.dreamCatcherRadiusStep = 10;
    this.prevLBracket = false;
    this.prevRBracket = false;

    // ===== Rockets passive =====
    this.rocketActive = false;
    this.rocketSpeedMultiplier = 1.6; // 1.0 = normal, 1.6 = 60% faster

    // ===== Sleep Mask passive =====
    this.sleepMaskTimer = 0;       // seconds remaining
    this.sleepMaskDuration = 4.0;  // tweak (4 sec is a good start)

    // ===== Pajama Armor passive =====
    this.pajamaArmorActive = false;

    // ===== Strange Lamp passive =====
    // While > 0: SleepyGuy is invulnerable + drawn semi-transparent
    this.strangeLampTimer = 0;       // seconds remaining
    this.strangeLampDuration = 3.0;  // tweak duration (seconds)


    this.nextBtnRect = { x: 0, y: 0, w: 0, h: 0, visible: false };
    this.maxLevel = 4;


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

  getActiveTeddy() {
    if (this.teddyDecoy && !this.teddyDecoy.removeFromWorld) return this.teddyDecoy;
    return null;
  }

  // Monsters call this to decide whether to chase SleepyGuy or the Teddy.
  getLureTargetFor(monster) {
    const sg = this.sleepyGuy;
    const teddy = this.getActiveTeddy();
    if (!teddy || !monster) return sg;

    const mx = monster.x + (monster.width * monster.scale) / 2;
    const my = monster.y + (monster.height * monster.scale) / 2;

    const dx = teddy.x - mx;
    const dy = teddy.y - my;
    const r = this.teddyLureRadius;

    if (dx * dx + dy * dy <= r * r) return teddy;
    return sg;
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
    this.currentLevel = 1;
    // clear menu + reset overlay
    this.entities = [];
    this.optionsOverlay = null;

    // NEW RUN: clear inventory + weapon state
    this.inventory.clear();
    this.swordSwing = null;
    this.swordCooldown = 0;
    this.swordSwingId = 0;

    // ===== ToothBrush weapon state =====
    this.brushSwing = null; // {id,x,y,baseAngle,t,duration,sweep,length,thickness}
    this.brushSwingId = 0;
    this.brushCooldown = 0;

    this.sandbagCooldown = 0;

    this.sleepDustCooldown = 0;
    this.sleepDustSplash = null;

    this.teddyCooldown = 0;
    this.teddyDecoy = null;

    this.prevT = false;
    this.dreamCatcherActive = false;
    this.sleepMaskTimer = 0;
    this.strangeLampTimer = 0;
    this.pajamaArmorActive = false;

    // reset bubble state too
    this.prevB = false;
    if (this.dreamBubble) this.dreamBubble.close(true);

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

        this.blockMap[`${gx},${gy}`] = e;
      }
    });
    this.addEntity(new MenuRoomController(this));

    this.blockMap = {};

    this.entities.forEach((e) => {
      // Keep this last
      if (e instanceof Block) {
        const gx = Math.floor(e.x / PARAMS.BLOCKWIDTH);
        const gy = Math.floor(e.y / PARAMS.BLOCKWIDTH);

        this.blockMap[`${gx},${gy}`] = e;
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
    this.teddyCooldown = 0;
    this.teddyDecoy = null;
    this.prevT = false;
    this.dreamCatcherActive = false;
    this.sleepMaskTimer = 0;
    this.strangeLampTimer = 0;
    this.pajamaArmorActive = false;

    this.prevB = false;
    if (this.dreamBubble) this.dreamBubble.close(true);

    this.addEntity(new MenuRoomController(this));
  }

  update() {
    const cw = this.ctx.canvas.width;
    const ch = this.ctx.canvas.height;

    if (this.sleepDustCooldown > 0) this.sleepDustCooldown -= this.clockTick;

    if (this.sleepMaskTimer > 0) {
      this.sleepMaskTimer -= this.clockTick;
      if (this.sleepMaskTimer < 0) this.sleepMaskTimer = 0;
    }

    if (this.strangeLampTimer > 0) {
      this.strangeLampTimer -= this.clockTick;
      if (this.strangeLampTimer < 0) this.strangeLampTimer = 0;
    }

    if (this.sleepDustSplash) {
      this.sleepDustSplash.t += this.clockTick;
      if (this.sleepDustSplash.t >= this.sleepDustSplash.duration) {
        this.sleepDustSplash = null;
      }
    }

    if (this.teddyCooldown > 0) {
      this.teddyCooldown -= this.clockTick;
      if (this.teddyCooldown < 0) this.teddyCooldown = 0;
    }
    if (this.teddyDecoy && this.teddyDecoy.removeFromWorld) this.teddyDecoy = null;

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

    // ===== Dream Bubble take (Key T) =====
    if (this.mode === "gameplay") {
      const tDown = !!this.keys["KeyT"];
      if (tDown && !this.prevT && !this.gameOver && !this.sleepyGuy?.dead) {
        if (this.dreamBubble && this.dreamBubble.item) {
          this.takeDreamBubbleItem();
        }
      }
      this.prevT = tDown;
    } else {
      this.prevT = false;
    }

    // ===== DreamCatcher radius tuning =====
    if (this.mode === "gameplay" && this.dreamCatcherActive) {
      const lDown = !!this.keys["BracketLeft"];   // [
      const rDown = !!this.keys["BracketRight"];  // ]

      if (lDown && !this.prevLBracket) {
        this.dreamCatcherRadius = Math.max(
          this.dreamCatcherMinRadius,
          this.dreamCatcherRadius - this.dreamCatcherRadiusStep
        );
      }

      if (rDown && !this.prevRBracket) {
        this.dreamCatcherRadius = Math.min(
          this.dreamCatcherMaxRadius,
          this.dreamCatcherRadius + this.dreamCatcherRadiusStep
        );
      }

      this.prevLBracket = lDown;
      this.prevRBracket = rDown;
    } else {
      this.prevLBracket = false;
      this.prevRBracket = false;
    }

    // ===== Dream Catcher passive aura =====
    if (this.mode === "gameplay" && this.dreamCatcherActive && !this.gameOver) {
      this.applyDreamCatcherAura();
    }

    // HUD consumes clicks in gameplay
    // Next Level button consumes click too
    // if (this.mode === "gameplay" && this.click && this.nextBtnRect.visible) {
    //   const { x, y } = this.click;
    //   const r = this.nextBtnRect;

    //   const hit = x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
    //   if (hit) {
    //     this.click = null;
    //     if (this.startLevel) this.startLevel(this.currentLevel + 1);
    //     return;
    //   }
    // }
      if (this.mode === "gameplay" && this.click) {
        const { x, y } = this.click;
        if (this.hud && this.hud.handleClick(x, y)) {
          this.click = null; // 🚨 kill the click so gameplay/pathing never sees it
      }
    }

    // ===== Sword weapon (inventory item) =====
    if (this.mode === "gameplay") {
      // Cooldown tick
      if (this.swordCooldown > 0) {
        this.swordCooldown -= this.clockTick;
        if (this.swordCooldown < 0) this.swordCooldown = 0;
      }

      const sel = this.inventory.getSelectedItem();
      const swordSelected = !!(sel && sel.id === "Sword");
      const bubbleOpen = !!(this.dreamBubble && this.dreamBubble.isOpen);

      // Start swing on click (and always consume click while sword is selected)
      if (swordSelected && this.click) {
        const { x: mx, y: my } = this.click;
        this.click = null; // prevent waypoint placement

        if (!this.gameOver && !bubbleOpen && this.swordCooldown <= 0 && this.sleepyGuy) {
          const sx = this.sleepyGuy.x;
          const sy = this.sleepyGuy.y;
          const dx = mx - sx;
          const dy = my - sy;
          const len = Math.hypot(dx, dy) || 1;
          const rx = dx / len;
          const ry = dy / len;

          // Tangent direction (perpendicular to line from SleepyGuy -> cursor)
          const tx = -ry;
          const ty = rx;
          const baseAngle = Math.atan2(ty, tx);

          this.swordSwingId++;
          this.swordSwing = {
            id: this.swordSwingId,
            x: mx,
            y: my,
            baseAngle,
            t: 0,
            duration: 0.18,
            sweep: Math.PI / 2, // 90° sweep
            length: 160,
            thickness: 42,
          };

          this.swordCooldown = 0.22;
        }
      }

      // Advance swing and apply hits
      if (this.swordSwing && !bubbleOpen && !this.gameOver) {
        const sw = this.swordSwing;
        sw.t += this.clockTick;

        const u = Math.min(1, sw.t / sw.duration);
        const angle = sw.baseAngle - sw.sweep / 2 + sw.sweep * u;
        const dirx = Math.cos(angle);
        const diry = Math.sin(angle);

        const ax = sw.x;
        const ay = sw.y;
        const bx = ax + dirx * sw.length;
        const by = ay + diry * sw.length;

        const r = sw.thickness / 2;
        const r2 = r * r;

        const sg = this.sleepyGuy;
        const sgx = sg ? sg.x : 0;
        const sgy = sg ? sg.y : 0;

        const KNOCK_SPEED = 900; // px/sec
        const KNOCK_TIME = 0.18;

        for (let i = 0; i < this.entities.length; i++) {
          const e = this.entities[i];
          if (!(e instanceof Monster)) continue;
          if (e instanceof Sheep) continue; // not an enemy
          if (e.dead || e.removeFromWorld) continue;

          const ex = e.x + (e.width * e.scale) / 2;
          const ey = e.y + (e.height * e.scale) / 2;

          const d2 = dist2PointToSegment(ex, ey, ax, ay, bx, by);
          if (d2 > r2) continue;

          // Push away from SleepyGuy
          let px = ex - sgx;
          let py = ey - sgy;
          let plen = Math.hypot(px, py);

          if (plen === 0) {
            px = dirx;
            py = diry;
            plen = 1;
          }
          px /= plen;
          py /= plen;

          e.applyKnockback?.(px * KNOCK_SPEED, py * KNOCK_SPEED, KNOCK_TIME, sw.id);
        }

        if (sw.t >= sw.duration) this.swordSwing = null;
      }
    }

    // ===== ToothBrush weapon (inventory item) =====
    if (this.mode === "gameplay") {
      // Cooldown tick
      if (this.brushCooldown > 0) {
        this.brushCooldown -= this.clockTick;
        if (this.brushCooldown < 0) this.brushCooldown = 0;
      }

      const sel = this.inventory.getSelectedItem();
      const brushSelected = !!(sel && sel.id === "ToothBrush");
      const bubbleOpen = !!(this.dreamBubble && this.dreamBubble.isOpen);

      // Start scrub-swing on click (consume click so no waypoint)
      if (brushSelected && this.click) {
        const { x: mx, y: my } = this.click;
        this.click = null;

        if (!this.gameOver && !bubbleOpen && this.brushCooldown <= 0 && this.sleepyGuy) {
          const sx = this.sleepyGuy.x;
          const sy = this.sleepyGuy.y;

          const dx = mx - sx;
          const dy = my - sy;
          const len = Math.hypot(dx, dy) || 1;
          const rx = dx / len;
          const ry = dy / len;

          // Perpendicular direction (same idea as sword)
          const tx = -ry;
          const ty = rx;
          const baseAngle = Math.atan2(ty, tx);

          this.brushSwingId++;
          this.brushSwing = {
            id: this.brushSwingId,
            x: mx,
            y: my,
            baseAngle,
            t: 0,
            duration: 0.16,
            sweep: Math.PI / 2, // 90°
            length: 130,
            thickness: 64,
          };

          this.brushCooldown = 0.20;
        }
      }

      // Advance swing and remove spikes it hits
      if (this.brushSwing && !bubbleOpen && !this.gameOver) {
        const sw = this.brushSwing;
        sw.t += this.clockTick;

        const u = Math.min(1, sw.t / sw.duration);
        const angle = sw.baseAngle - sw.sweep / 2 + sw.sweep * u;
        const dirx = Math.cos(angle);
        const diry = Math.sin(angle);

        const ax = sw.x;
        const ay = sw.y;
        const bx = ax + dirx * sw.length;
        const by = ay + diry * sw.length;

        const r = sw.thickness / 2;
        const r2 = r * r;

        for (let i = 0; i < this.entities.length; i++) {
          const e = this.entities[i];
          if (!(e instanceof Spikes)) continue;
          if (e.removeFromWorld) continue;

          const ex = e.x + (e.width * e.scale) / 2;
          const ey = e.y + (e.height * e.scale) / 2;

          const d2 = dist2PointToSegment(ex, ey, ax, ay, bx, by);
          if (d2 > r2) continue;

          // Delete the spikes
          e.removeFromWorld = true;

          // Also clear from gridMap if it's stored there (LevelBuilder uses gridMap)
          const gx = Math.floor(e.x / PARAMS.BLOCKWIDTH);
          const gy = Math.floor(e.y / PARAMS.BLOCKWIDTH);
          const key = `${gx},${gy}`;
          if (this.gridMap && this.gridMap[key] === e) delete this.gridMap[key];
        }

        if (sw.t >= sw.duration) this.brushSwing = null;
      }
    }

    // ===== Sandbags (x3) placeable wall =====
    if (this.mode === "gameplay") {
      if (this.sandbagCooldown > 0) {
        this.sandbagCooldown -= this.clockTick;
        if (this.sandbagCooldown < 0) this.sandbagCooldown = 0;
      }

      const sel = this.inventory.getSelectedItem();
      const sandSelected = !!(sel && sel.id && sel.id.startsWith("SandBag"));
      const bubbleOpen = !!(this.dreamBubble && this.dreamBubble.isOpen);

      if (sandSelected && this.click) {
        const { x: mx, y: my } = this.click;
        this.click = null; // don't let waypointbuilder place a path point

        if (!this.gameOver && !bubbleOpen && this.sandbagCooldown <= 0) {
          const bw = PARAMS.BLOCKWIDTH;

          const gx = Math.floor(mx / bw);
          const gy = Math.floor(my / bw);

          const px = gx * bw;
          const py = gy * bw;

          // bounds check
          if (px >= 0 && py >= 0 && px < PARAMS.CANVAS_WIDTH && py < PARAMS.CANVAS_HEIGHT) {
            const key = `${gx},${gy}`;

            // must be empty tile
            if (!this.gridMap[key]) {
              // don't place on top of SleepyGuy
              const tempBB = new BoundingBox(px, py, bw, bw);
              const sg = this.sleepyGuy;
              if (!sg?.BB) sg?.updateBB?.();

              const overlapsPlayer = sg?.BB && tempBB.collide(sg.BB);

              if (!overlapsPlayer) {
                // place the wall as a Block with a sandbag sprite
                const sandSprite = ASSET_MANAGER.getAsset("./assets/items/SandBag1.png") || sel.img;
                const wall = new Block(this, px, py, {
                  sprite: sandSprite,
                  spriteScale: 1.1,     // tweak visuals
                  spriteYOffset: 4,     // tweak visuals
                });

                this.addEntity(wall);
                this.gridMap[key] = wall;

                // consume 1 charge
                if (typeof sel.count !== "number") sel.count = 1;
                sel.count -= 1;

                if (sel.count <= 0) {
                  this.inventory.removeItem(this.inventory.getSelectedIndex());
                }

                this.sandbagCooldown = 0.18;
              }
            }
          }
        }
      }
    }

    // ===== TeddyBear (decoy) =====
    if (this.mode === "gameplay") {
      const bubbleOpen = !!(this.dreamBubble && this.dreamBubble.isOpen);
      const sel = this.inventory.getSelectedItem();
      const teddySelected = !!(sel && sel.id === "TeddyBear");

      // Click places the teddy (consume click either way so no waypoint happens)
      if (teddySelected && this.click) {
        const { x, y } = this.click;
        this.click = null;

        if (!this.gameOver && !bubbleOpen && this.teddyCooldown <= 0) {
          // remove existing teddy if there is one
          if (this.teddyDecoy && !this.teddyDecoy.removeFromWorld) {
            this.teddyDecoy.removeFromWorld = true;
          }

          const teddy = new TeddyDecoy(this, x, y, {
            lifetime: 20.0,
            scale: 0.09,
            maxHits: Infinity,
          });

          this.teddyDecoy = teddy;
          this.addEntity(teddy);

          // consume item (single use)
          this.inventory.removeItem(this.inventory.getSelectedIndex());

          this.teddyCooldown = 0.20;
        }
      }
    }

    // ===== SleepDust (splash sleep) =====
    {
      const bubbleOpen = !!(this.dreamBubble && this.dreamBubble.isOpen);
      const sel = this.inventory.getSelectedItem();
      const dustSelected = !!(sel && sel.id === "SleepDust");

      const DUST_RADIUS = 70;   // small splash radius (tweak)
      const DUST_TIME = 3.0;    // seconds asleep (tweak)

      if (dustSelected && !bubbleOpen && !this.gameOver) {
        if (this.click && this.sleepDustCooldown <= 0) {
          const { x, y } = this.click;

          const r2 = DUST_RADIUS * DUST_RADIUS;

          for (let i = 0; i < this.entities.length; i++) {
            const e = this.entities[i];
            if (!(e instanceof Monster)) continue;
            if (e.dead || e.removeFromWorld) continue;

            const ex = e.x + (e.width * e.scale) / 2;
            const ey = e.y + (e.height * e.scale) / 2;

            const dx = ex - x;
            const dy = ey - y;

            if (dx * dx + dy * dy <= r2) {
              e.applySleep?.(DUST_TIME);
            }
          }

          // little visual puff
          this.sleepDustSplash = { x, y, t: 0, duration: 0.35, r: DUST_RADIUS };

          // consume item (single use)
          this.inventory.removeItem(this.inventory.getSelectedIndex());

          this.sleepDustCooldown = 0.18;

          // consume click so it doesn't place a waypoint
          this.click = null;
        }
      }
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
  const ctx = this.ctx;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < this.entities.length; i++) {
      const ent = this.entities[i];
      if (ent.draw) ent.draw(this.ctx);
    }

    // ===== SleepDust preview + splash =====
    {
      const bubbleOpen = !!(this.dreamBubble && this.dreamBubble.isOpen);
      const sel = this.inventory.getSelectedItem();
      const dustSelected = !!(sel && sel.id === "SleepDust");
      const R = 70;

      // preview radius
      if (!bubbleOpen && dustSelected && this.mouse) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.25;
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.x, this.mouse.y, R, 0, Math.PI * 2);
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.restore();
      }

      // splash puff
      if (this.sleepDustSplash) {
        const fx = this.sleepDustSplash;
        const u = Math.min(1, fx.t / fx.duration);
        const rr = fx.r * (0.4 + 0.6 * u);

        this.ctx.save();
        this.ctx.globalAlpha = 0.35 * (1 - u);
        this.ctx.beginPath();
        this.ctx.arc(fx.x, fx.y, rr, 0, Math.PI * 2);
        this.ctx.fillStyle = "white";
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    if (this.mode === "gameplay") {
      if (this.dreamBubble) this.dreamBubble.draw(this.ctx);

      // ===== Sword cursor + swing =====
      const bubbleOpen = !!(this.dreamBubble && this.dreamBubble.isOpen);
      const sel = this.inventory.getSelectedItem();
      const swordSelected = !!(sel && sel.id === "Sword");

      // ONLY draw if sword is selected OR a swing is currently happening
      const shouldDrawSword = !bubbleOpen && (swordSelected || this.swordSwing);

      if (shouldDrawSword && (this.mouse || this.swordSwing)) {
        const sg = this.sleepyGuy;

        // Only load the sword image when we actually need to draw it
        const swordImg =
          (swordSelected && sel && sel.img) ||
          ASSET_MANAGER.getAsset("./assets/items/Sword.png");

        if (swordImg) {
          let x = this.mouse ? this.mouse.x : 0;
          let y = this.mouse ? this.mouse.y : 0;
          let angle = 0;

          if (this.swordSwing) {
            const sw = this.swordSwing;
            const u = Math.min(1, sw.t / sw.duration);
            angle = sw.baseAngle - sw.sweep / 2 + sw.sweep * u;
            x = sw.x;
            y = sw.y;
          } else if (swordSelected && sg && this.mouse) {
            const dx = this.mouse.x - sg.x;
            const dy = this.mouse.y - sg.y;
            const len = Math.hypot(dx, dy) || 1;
            const rx = dx / len;
            const ry = dy / len;
            const tx = -ry;
            const ty = rx;
            angle = Math.atan2(ty, tx);
          }

          const SCALE = 0.06;
          const w = swordImg.width * SCALE;
          const h = swordImg.height * SCALE;
          const handleX = w * 0.22;

          this.ctx.save();
          this.ctx.translate(x, y);
          this.ctx.rotate(angle);
          this.ctx.drawImage(swordImg, -handleX, -h / 2, w, h);
          this.ctx.restore();
        }
      }

      // ===== ToothBrush cursor + swing =====
      {
        const bubbleOpen = !!(this.dreamBubble && this.dreamBubble.isOpen);
        const sel = this.inventory.getSelectedItem();
        const brushSelected = !!(sel && sel.id === "ToothBrush");
        const shouldDrawBrush = !bubbleOpen && (brushSelected || this.brushSwing);

        if (shouldDrawBrush && (this.mouse || this.brushSwing)) {
          const sg = this.sleepyGuy;

          const brushImg =
            (brushSelected && sel && sel.img) ||
            ASSET_MANAGER.getAsset("./assets/items/ToothBrush.png");

          if (brushImg) {
            let x = this.mouse ? this.mouse.x : 0;
            let y = this.mouse ? this.mouse.y : 0;
            let angle = 0;

            if (this.brushSwing) {
              const sw = this.brushSwing;
              const u = Math.min(1, sw.t / sw.duration);
              angle = sw.baseAngle - sw.sweep / 2 + sw.sweep * u;
              x = sw.x;
              y = sw.y;
            } else if (brushSelected && sg && this.mouse) {
              const dx = this.mouse.x - sg.x;
              const dy = this.mouse.y - sg.y;
              const len = Math.hypot(dx, dy) || 1;
              const rx = dx / len;
              const ry = dy / len;
              const tx = -ry;
              const ty = rx;
              angle = Math.atan2(ty, tx);
            }

            const SCALE = 0.08; // tweak like you did for sword (try 0.05–0.10)
            const w = brushImg.width * SCALE;
            const h = brushImg.height * SCALE;
            const handleX = w * 0.22;

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(angle);
            this.ctx.drawImage(brushImg, -handleX, -h / 2, w, h);
            this.ctx.restore();
          }
        }
      }

      // ===== DreamCatcher aura visual (matches kill radius exactly) =====
      if (this.mode === "gameplay" && this.dreamCatcherActive && this.sleepyGuy && !this.gameOver) {
        const sg = this.sleepyGuy;
        const r = this.dreamCatcherRadius;

        const pulseA = 0.18 + 0.06 * Math.sin(performance.now() * 0.01);

        this.ctx.save();
        this.ctx.globalAlpha = pulseA;
        this.ctx.beginPath();
        this.ctx.arc(sg.x, sg.y, r, 0, Math.PI * 2);
        this.ctx.strokeStyle = "cyan";
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.globalAlpha = pulseA * 0.35;
        this.ctx.beginPath();
        this.ctx.arc(sg.x, sg.y, r, 0, Math.PI * 2);
        this.ctx.fillStyle = "cyan";
        this.ctx.fill();
        this.ctx.restore();
      }

    this.hud.draw(ctx);
    this.drawLevelBadge(ctx);

    if (this.optionsOverlay) {
      const cw = ctx.canvas.width;
      const ch = ctx.canvas.height;
      this.optionsOverlay.draw(ctx, cw, ch);
    }
  }
}

 drawLevelBadge(ctx) {
  const pad = 18;
  const y = 18, w = 130, h = 36;
  const x = PARAMS.CANVAS_WIDTH - w - pad; // ✅ top-right

  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = "rgba(20, 24, 40, 0.85)";
  ctx.fillRect(x, y, w, h);

  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "700 18px serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`Level ${this.currentLevel}`, x + 14, y + h / 2 + 1);
  ctx.restore();
}

  loop() {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
  }

  takeDreamBubbleItem() {
    const item = this.dreamBubble?.item;
    if (!item) return;

    switch (item.id) {
      case "DreamCatcher":
        this.dreamCatcherActive = true;
        break;

      case "Rocket":
        this.rocketActive = true;   // <<< add this
        break;

      case "SleepMask":
        this.sleepMaskTimer = this.sleepMaskDuration; // start blind
        break;

      case "TheStrangeLamp":
        this.strangeLampTimer = this.strangeLampDuration;
        break;

      case "Pajama":
        this.pajamaArmorActive = true;
        break;

      default:
        console.log("Bubble item not implemented yet:", item.id);
        break;
    }

    this.dreamBubble.item = null;
    this.dreamBubble.close();
  }

  applyDreamCatcherAura() {
    const sg = this.sleepyGuy;
    if (!sg) return;

    const r = this.dreamCatcherRadius;

    for (const e of this.entities) {
      if (!(e instanceof Monster)) continue;
      if (e instanceof Sheep) continue;
      if (e.dead || e.removeFromWorld) continue;

      // Enemy center + radius (use BB if available)
      let ex, ey, er;
      if (e.BB) {
        ex = e.BB.x + e.BB.width / 2;
        ey = e.BB.y + e.BB.height / 2;
        er = Math.max(e.BB.width, e.BB.height) / 2;
      } else {
        ex = e.x + (e.width * e.scale) / 2;
        ey = e.y + (e.height * e.scale) / 2;
        er = Math.max(e.width * e.scale, e.height * e.scale) / 2;
      }

      const dx = ex - sg.x;
      const dy = ey - sg.y;

      // Kill when enemy's edge touches aura circle
      const R = r + er;
      if (dx * dx + dy * dy <= R * R) {
        e.dead = true;
        e.removeFromWorld = true;
      }
    }
  }
}
