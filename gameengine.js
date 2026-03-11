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
    this.holdCameraThisFrame = false;

    this.gameOver = false;
    this.gameWon = false;

    this.highestLevel = 0;

    this.bubbleSwapFX = null;  // { t, duration }
    this._sfxCtx = null;       // WebAudio context for tiny SFX

    this.clockTick = 0;
    this.timer = new Timer();

    this.mode = "menu"; // "menu" || "gameplay" || "pause"

    this.options = options || { debugging: false }; //TODO safely remove debugging value?? Not used anywhere
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

    //Menu items
    this.menuRoomController = null;
    this.endGame = null;

    // Side-scroll / parallax functionallity
    this.camera = null;
    this.bg = null;

    // ===== Sandbag state =====
    this.sandbagCooldown = 0;

    this.sleepDustCooldown = 0;
    this.sleepDustSplash = null; // {x,y,t,duration,r}

    // ===== TeddyBear (decoy) state =====
    this.teddyCooldown = 0;
    this.teddyDecoy = null;     // active TeddyDecoy entity
    this.teddyLureRadius = 900; // px radius enemies will prefer the bear

    // ===== Pajama Armor passive =====
    this.pajamaArmorActive = false;
    this.pajamaArmorHits = 0;
    this.pajamaArmorMaxHits = 3;

    // ===== Dream Bubble take (Key T) =====
    this.prevT = false;

    // ===== DreamCatcher passive =====
    this.dreamCatcherActive = false;
    this.dreamCatcherTimer = 0;
    this.dreamCatcherDuration = 5.0;   // lasts 5 seconds
    this.dreamCatcherRadius = 60;      // small radius around Sleepy Guy
    this.dreamCatcherMinRadius = 30;
    this.dreamCatcherMaxRadius = 180;
    this.dreamCatcherRadiusStep = 10;
    this.prevLBracket = false;
    this.prevRBracket = false;

    // ===== Rockets passive =====
    this.rocketActive = false;
    this.rocketTimer = 0;
    this.rocketDuration = 5.0;
    this.rocketSpeedMultiplier = 1.6; // 1.0 = normal, 1.6 = 60% faster

    // ===== Sleep Mask passive =====
    this.sleepMaskTimer = 0;       // seconds remaining
    this.sleepMaskDuration = 5.0;  // seconds

    // ===== Strange Lamp passive =====
    // While > 0: SleepyGuy is invulnerable + drawn semi-transparent
    this.strangeLampTimer = 0;       // seconds remaining
    this.strangeLampDuration = 5.0;  // seconds

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

  loop() {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
  }

  startInput() {
    const canvas = this.ctx.canvas;

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
      const sx = (e.clientX - rect.left) * scaleX;
      const sy = (e.clientY - rect.top) * scaleY;
      const world = this.screenToWorld(sx, sy);

      this.rightClick = {
        x: sx,
        y: sy,
        wx: world.x,
        wy: world.y,
        space: "screen",
      };
    });

    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const sx = (e.clientX - rect.left) * scaleX;
      const sy = (e.clientY - rect.top) * scaleY;
      const world = this.screenToWorld(sx, sy);

      this.click = {
        x: sx,
        y: sy,
        wx: world.x,
        wy: world.y,
        space: "screen",
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

      if (!e.repeat) {
        if (e.code === "Digit1") {
          this.inventory.select(0);
          e.preventDefault();
        } else if (e.code === "Digit2") {
          this.inventory.select(1);
          e.preventDefault();
        } else if (e.code === "Digit3") {
          this.inventory.select(2);
          e.preventDefault();
        }
      }

      if (e.code === "KeyM" && !e.repeat && window.Music) {
        Music.setMuted(!Music.muted);
        const muteEl = document.getElementById("mute");
        if (muteEl) muteEl.checked = Music.muted;
      }
    });


    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  }

  screenToWorld(x, y) {
    return {
      x: x + (this.camera?.x ?? 0),
      y: y + (this.camera?.y ?? 0),
    };
  }

  worldToScreen(x, y) {
    return {
      x: x - (this.camera?.x ?? 0),
      y: y - (this.camera?.y ?? 0),
    };
  }

  addEntity(entity) {
    this.entities.push(entity);
  }

  checkGridCollision(entity) {
    if (this.mode != "gameplay") return;
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
    this.clearMenuState("room");

    this.currentLevel = 1;
    // clear menu + reset overlay
    this.entities = [];

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
    this.dreamCatcherTimer = 0;

    this.pajamaArmorActive = false;
    this.pajamaArmorHits = 0;

    // reset bubble state too
    this.prevB = false;
    if (this.dreamBubble) this.dreamBubble.close(true);

    this.gridMap = {};

    this.rocketActive = false;
    this.rocketTimer = 0;
    this.rocketTimer = 0;

    // Level-specific spawns
    Levels.buildLevel(this);

    this.blockMap = {};

    this.entities.forEach((e) => {
      // Keep this last
      if (e instanceof Block) {
        const gx = Math.floor(e.x / PARAMS.BLOCKWIDTH);
        const gy = Math.floor(e.y / PARAMS.BLOCKWIDTH);

        this.blockMap[`${gx},${gy}`] = e;
      }
    });
  }

  clearMenuState(sceneKey = null) {
    this.hud.showMenu = false;
    this.hud.requestOpenOptions = false;
    this.hud.requestExitToMenu = false;

    if (!this.menuRoomController) return;

    this.menuRoomController.showHelp = false;
    this.menuRoomController.showOptions = false;
    this.menuRoomController.showCredits = false;
    this.menuRoomController.transitioning = false;
    this.menuRoomController.fade = 0;
    this.menuRoomController.fadeDir = 0;
    this.menuRoomController.nextScene = null;

    if (sceneKey) this.menuRoomController.scene = sceneKey;
  }

  goToMainMenu() {
    this.mode = "menu";
    if (window.setMusicMode) window.setMusicMode("menu");
    this.clearMenuState("menu");

    this.entities = [];
    this.inventory.clear();
    this.teddyCooldown = 0;
    this.teddyDecoy = null;
    this.prevT = false;
    this.dreamCatcherActive = false;
    this.sleepMaskTimer = 0;
    this.strangeLampTimer = 0;
    this.dreamCatcherTimer = 0;
    this.rocketActive = false;
    this.rocketTimer = 0;
    this.pajamaArmorActive = false;
    this.pajamaArmorHits = 0;

    this.prevB = false;
    if (this.dreamBubble) this.dreamBubble.close(true);
  }

  update() {
    const cw = this.ctx.canvas.width;
    const ch = this.ctx.canvas.height;

    // HUD layout always updates
    this.hud.update(cw, ch);


    if (this.mode === "gameplay") {
      this.updateGameplay();
      if (this.hud.requestExitToMenu) {
        this.hud.requestExitToMenu = false;
        this.goToMainMenu();
        return;
      }
      if (this.hud.requestOpenOptions) {
        this.hud.requestOpenOptions = false;
        this.mode = "pause";
        this.menuRoomController.showOptions = true;
        return;
      }

    } else if (this.mode === "pause") {
      this.endGame.update();
      // HUD requests
      if (this.hud.requestExitToMenu) {
        this.hud.requestExitToMenu = false;
        this.goToMainMenu();
        return;
      }
      if (this.hud.requestOpenOptions) {
        this.hud.requestOpenOptions = false;
        this.menuRoomController.showOptions = true;
      }
      this.menuRoomController.update();
      if (this.click) {
        const { x, y } = this.click;
        this.click = null;
        if (this.menuRoomController.showOptions) {
          this.menuRoomController.handleClick(x, y);
        } else {
          this.hud.handleClick(x, y);
        }
      }
    } else if (this.mode === "menu") {
      this.menuRoomController.update();
      this.bg.update();
    }
  }

  isAnyDreamEffectActive() {
    return (
      (this.dreamCatcherTimer > 0) ||
      (this.rocketTimer > 0) ||
      (this.sleepMaskTimer > 0) ||
      (this.strangeLampTimer > 0)
    );
  }

  triggerBubbleSwapFX() {
    this.bubbleSwapFX = { t: 0, duration: 0.28 };
    this.playBubblePopSound();
  }

  playBubblePopSound() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;

      if (!this._sfxCtx) this._sfxCtx = new AC();
      const ctx = this._sfxCtx;

      if (ctx.state === "suspended") ctx.resume().catch(() => { });

      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.09);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      // ignore
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    if (this.mode == "gameplay") {
      this.bg.draw(this.ctx);
      this.drawGameplay();
      this.hud.draw(this.ctx);
    } else if (this.mode == "pause") {
      this.bg.draw(this.ctx);
      this.drawGameplay();
      this.hud.draw(this.ctx);
      this.endGame?.draw(this.ctx);
      if (this.menuRoomController.showOptions) {
        this.menuRoomController.drawOptionsModal(this.ctx);
      }
    } else if (this.mode == "menu") {
      this.menuRoomController.draw(this.ctx);
    }

  }

  updateHighest() {
    this.highestLevel = Math.max(this.highestLevel, this.currentLevel);
  }

  // Builds a fresh set of game entities (used for initial load and replay)
  buildWorld() {

    // Level-specific spawns
    Levels.buildLevel(this)

    this.blockMap = {};

    this.entities.forEach(e => { // Keep this last
      if (e instanceof Block) {
        const gx = Math.floor(e.x / PARAMS.BLOCKWIDTH);
        const gy = Math.floor(e.y / PARAMS.BLOCKWIDTH);

        this.blockMap[`${gx},${gy}`] = e;
      }
    });
  }

  loadNextLevel() {
    //this.highestLevel = Math.max(this.highestLevel, this.currentLevel);
    this.currentLevel++;
    this.bg.update();
    this.resetWorld("gameplay");
  }

  // Clears current world state and rebuilds it
  resetWorld(mode, levelNum) {
    this.gameOver = false;
    this.gameWon = false;
    const targetMode = mode ?? this.mode;
    this.mode = targetMode;
    this.currentLevel = levelNum ?? this.currentLevel;

    this.entities = [];
    this.sleepyGuy = null;
    this.waypoints = [];
    this.click = null;

    this.inventory?.clear?.();
    this.swordSwing = null;
    this.swordCooldown = 0;
    this.swordSwingId = 0;

    this.brushSwing = null;
    this.brushCooldown = 0;
    this.brushSwingId = 0;

    this.gridMap = {};        // IMPORTANT: clears old blocks/spikes/sandbags
    this.blockMap = {};       // optional (you rebuild this anyway)

    this.brushSwing = null;   // if ToothBrush exists in your build
    this.brushCooldown = 0;
    this.brushSwingId = 0;

    this.prevT = false;
    this.dreamCatcherActive = false;
    this.dreamCatcherTimer = 0;

    this.pajamaArmorActive = false;
    this.pajamaArmorHits = 0;

    // keep half-sized defaults
    this.dreamCatcherRadius = 60;
    this.dreamCatcherMinRadius = 30;
    this.dreamCatcherMaxRadius = 210;
    this.dreamCatcherRadiusStep = 10;

    this.prevLBracket = false;
    this.prevRBracket = false;

    this.sandbagCooldown = 0; // so sandbags feel fresh on restart

    // reset SleepDust + TeddyBear state too
    this.sleepDustCooldown = 0;
    this.sleepDustSplash = null;

    this.rocketActive = false;
    this.rocketTimer = 0;

    this.sleepMaskTimer = 0;

    this.teddyCooldown = 0;
    if (this.teddyDecoy) this.teddyDecoy.removeFromWorld = true;
    this.teddyDecoy = null;

    this.strangeLampTimer = 0;

    this.prevB = false;
    if (this.dreamBubble) this.dreamBubble.close(true);
    this.clearMenuState(targetMode === "menu" ? "menu" : null);

    if (targetMode !== "menu") this.buildWorld();

    if (window.setMusicMode) {
      window.setMusicMode(targetMode === "menu" ? "menu" : "dream");
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

  takeDreamBubbleItem() {
    const item = this.dreamBubble?.item;
    if (!item) return;

    const hadActive = this.isAnyDreamEffectActive();
    if (hadActive) this.triggerBubbleSwapFX();

    // single-effect rule
    this.clearDreamBubbleEffects();

    switch (item.id) {
      case "TheStrangeLamp":
        this.strangeLampTimer = this.strangeLampDuration;
        break;

      case "Pajama":
        this.pajamaArmorActive = true;
        this.pajamaArmorHits = this.pajamaArmorMaxHits; // 3 hits
        break;

      case "DreamCatcher":
        this.dreamCatcherActive = true;
        this.dreamCatcherTimer = this.dreamCatcherDuration;
        break;

      case "Rocket":
        this.rocketActive = true;
        this.rocketTimer = this.rocketDuration;
        break;

      case "SleepMask":
        this.sleepMaskTimer = this.sleepMaskDuration;
        break;

      case "TheStrangeLamp":
        this.strangeLampTimer = this.strangeLampDuration;
        break;

      default:
        console.log("Bubble item not implemented yet:", item.id);
        break;
    }

    this.dreamBubble.item = null;
    this.dreamBubble.close();
  }

  clearDreamBubbleEffects() {
    this.pajamaArmorActive = false;
    this.pajamaArmorHits = 0;

    this.dreamCatcherActive = false;
    this.dreamCatcherTimer = 0;

    this.rocketActive = false;
    this.rocketTimer = 0;

    this.sleepMaskTimer = 0;
    this.strangeLampTimer = 0;
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

  drawGameplay() {
    for (let i = 0; i < this.entities.length; i++) {
      const ent = this.entities[i];
      if (ent.draw) ent.draw(this.ctx);
    }

    const mouseScreen = this.mouse;
    const mouseWorld = mouseScreen ? this.screenToWorld(mouseScreen.x, mouseScreen.y) : null;

    // ===== SleepDust preview + splash =====
    const bubbleOpen = !!(this.dreamBubble && this.dreamBubble.isOpen);
    const sel = this.inventory.getSelectedItem();
    const dustSelected = !!(sel && sel.id === "SleepDust");
    const R = 70;

    // preview radius at cursor (screen space)
    if (!bubbleOpen && dustSelected && mouseScreen) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.25;
      this.ctx.beginPath();
      this.ctx.arc(mouseScreen.x, mouseScreen.y, R, 0, Math.PI * 2);
      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // splash puff at world position
    if (this.sleepDustSplash) {
      const fx = this.sleepDustSplash;
      const u = Math.min(1, fx.t / fx.duration);
      const rr = fx.r * (0.4 + 0.6 * u);
      const p = this.worldToScreen(fx.x, fx.y);

      this.ctx.save();
      this.ctx.globalAlpha = 0.35 * (1 - u);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
      this.ctx.fillStyle = "white";
      this.ctx.fill();
      this.ctx.restore();
    }

    if (this.dreamBubble) this.dreamBubble.draw(this.ctx);

    // ===== Sword cursor + swing =====
    const swordSelected = !!(sel && sel.id === "Sword");
    const shouldDrawSword = !bubbleOpen && (swordSelected || this.swordSwing);

    if (shouldDrawSword && (mouseScreen || this.swordSwing)) {
      const sg = this.sleepyGuy;
      const swordImg =
        (swordSelected && sel && sel.img) ||
        ASSET_MANAGER.getAsset("./assets/items/Sword.png");

      if (swordImg) {
        let x = mouseScreen ? mouseScreen.x : 0;
        let y = mouseScreen ? mouseScreen.y : 0;
        let angle = 0;

        if (this.swordSwing) {
          const sw = this.swordSwing;
          const u = Math.min(1, sw.t / sw.duration);
          angle = sw.baseAngle - sw.sweep / 2 + sw.sweep * u;
          const p = this.worldToScreen(sw.x, sw.y);
          x = p.x;
          y = p.y;
        } else if (swordSelected && sg && mouseWorld) {
          const dx = mouseWorld.x - sg.x;
          const dy = mouseWorld.y - sg.y;
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
    const brushSelected = !!(sel && sel.id === "ToothBrush");
    const shouldDrawBrush = !bubbleOpen && (brushSelected || this.brushSwing);

    if (shouldDrawBrush && (mouseScreen || this.brushSwing)) {
      const sg = this.sleepyGuy;
      const brushImg =
        (brushSelected && sel && sel.img) ||
        ASSET_MANAGER.getAsset("./assets/items/ToothBrush.png");

      if (brushImg) {
        let x = mouseScreen ? mouseScreen.x : 0;
        let y = mouseScreen ? mouseScreen.y : 0;
        let angle = 0;

        if (this.brushSwing) {
          const sw = this.brushSwing;
          const u = Math.min(1, sw.t / sw.duration);
          angle = sw.baseAngle - sw.sweep / 2 + sw.sweep * u;
          const p = this.worldToScreen(sw.x, sw.y);
          x = p.x;
          y = p.y;
        } else if (brushSelected && sg && mouseWorld) {
          const dx = mouseWorld.x - sg.x;
          const dy = mouseWorld.y - sg.y;
          const len = Math.hypot(dx, dy) || 1;
          const rx = dx / len;
          const ry = dy / len;
          const tx = -ry;
          const ty = rx;
          angle = Math.atan2(ty, tx);
        }

        const SCALE = 0.08;
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

    // ===== Placeable item cursors =====
    const sandSelected = !!(sel && sel.id && sel.id.startsWith("SandBag"));
    const teddySelected = !!(sel && sel.id === "TeddyBear");
    const placeableSelected = teddySelected || dustSelected || sandSelected;

    // Hide normal mouse cursor only for these placeable items
    this.ctx.canvas.style.cursor =
      (!bubbleOpen && mouseScreen && placeableSelected) ? "none" : "default";

    if (!bubbleOpen && mouseScreen && sel?.img && placeableSelected) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.78;

      if (sandSelected && mouseWorld) {
        // snap sandbag preview to tile
        const bw = PARAMS.BLOCKWIDTH;
        const gx = Math.floor(mouseWorld.x / bw);
        const gy = Math.floor(mouseWorld.y / bw);
        const px = gx * bw;
        const py = gy * bw;
        const p = this.worldToScreen(px, py);

        const w = bw * 1.1;
        const h = bw * 1.1;

        this.ctx.drawImage(sel.img, p.x, p.y + 4, w, h);

        const blocked = !!this.gridMap[`${gx},${gy}`];
        this.ctx.strokeStyle = blocked ? "rgba(255,80,80,0.95)" : "rgba(255,255,255,0.95)";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(p.x, p.y, bw, bw);
      } else {
        // teddy + sleep dust icon preview at cursor
        const scale = teddySelected ? 0.09 : 0.10;
        const w = sel.img.width * scale;
        const h = sel.img.height * scale;

        this.ctx.drawImage(
          sel.img,
          mouseScreen.x - w / 2,
          mouseScreen.y - h / 2,
          w,
          h
        );
      }

      this.ctx.restore();
    }

    // ===== DreamCatcher aura visual (matches kill radius exactly) =====
    if (this.mode === "gameplay" && this.dreamCatcherActive && this.sleepyGuy && !this.gameOver) {
      const sg = this.sleepyGuy;
      const r = this.dreamCatcherRadius;
      const p = this.worldToScreen(sg.x, sg.y);

      const pulseA = 0.18 + 0.06 * Math.sin(performance.now() * 0.01);

      this.ctx.save();
      this.ctx.globalAlpha = pulseA;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      this.ctx.strokeStyle = "cyan";
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      this.ctx.globalAlpha = pulseA * 0.35;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      this.ctx.fillStyle = "cyan";
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  updateGameplay() {
    const sel = this.inventory.getSelectedItem();
    const bubbleOpen = !!(this.dreamBubble && this.dreamBubble.isOpen);
    // HUD consumes right clicks in gameplay to remove pathing nodes
    if (this.rightClick && this.waypoints) {
      const rc = this.rightClick.space === "world"
        ? this.rightClick
        : { x: this.rightClick.wx, y: this.rightClick.wy };
      const clickX = rc.x;
      const clickY = rc.y;
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
        this.holdCameraThisFrame = true;
        if (this.sleepyGuy) {
          if (this.waypoints.length === 0) {
            this.sleepyGuy.targetWaypointIndex = 0;
          } else {
            this.sleepyGuy.targetWaypointIndex = Math.min(
              this.sleepyGuy.targetWaypointIndex,
              this.waypoints.length - 1,
            );
          }
        }
      }
      this.rightClick = null;
    }

    if (this.sleepDustCooldown > 0) this.sleepDustCooldown -= this.clockTick;
    if (this.sleepMaskTimer > 0) {
      this.sleepMaskTimer -= this.clockTick;
      if (this.sleepMaskTimer < 0) this.sleepMaskTimer = 0;
    }
    if (this.rocketTimer > 0) {
      this.rocketTimer -= this.clockTick;
      if (this.rocketTimer <= 0) {
        this.rocketTimer = 0;
        this.rocketActive = false;
      }
    }
    if (this.dreamCatcherTimer > 0) {
      this.dreamCatcherTimer -= this.clockTick;
      if (this.dreamCatcherTimer <= 0) {
        this.dreamCatcherTimer = 0;
        this.dreamCatcherActive = false;
      }
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
    // ===== Bubble swap “pop” FX timer tick =====
    if (this.bubbleSwapFX) {
      this.bubbleSwapFX.t += this.clockTick;
      if (this.bubbleSwapFX.t >= this.bubbleSwapFX.duration) {
        this.bubbleSwapFX = null;
      }
    }
    // ===== Dream Bubble toggle (Key B) =====
    const bDown = !!this.keys["KeyB"];
    if (bDown && !this.prevB) {
      // create lazily here (ASSET_MANAGER exists by now)
      if (!this.dreamBubble) this.dreamBubble = new DreamBubbleOverlay(this);
      this.dreamBubble.toggle();
    }
    this.prevB = bDown;
    if (this.dreamBubble) this.dreamBubble.update();
    // ===== Dream Bubble take (Key T) =====
    const tDown = !!this.keys["KeyT"];
    if (tDown && !this.prevT && !this.gameOver && !this.sleepyGuy?.dead) {
      if (this.dreamBubble && this.dreamBubble.item) {
        this.takeDreamBubbleItem();
      }
    }
    this.prevT = tDown;
    // ===== DreamCatcher radius tuning =====
    if (this.dreamCatcherActive) {
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
    if (this.dreamCatcherActive) this.applyDreamCatcherAura();

    // HUD consumes clicks in gameplay
    if (this.click) {
      const { x, y } = this.click;
      if (this.hud.handleClick(x, y)) this.click = null;
    }

    // Remaining gameplay clicks operate in world space.
    if (this.click && this.click.space !== "world") {
      this.click = { x: this.click.wx, y: this.click.wy, space: "world" };
    }

    // ===== Sword weapon (inventory item) =====
    // Cooldown tick
    if (this.swordCooldown > 0) {
      this.swordCooldown -= this.clockTick;
      if (this.swordCooldown < 0) this.swordCooldown = 0;
    }
    const swordSelected = !!(sel && sel.id === "Sword");

    // Start swing on click (and always consume click while sword is selected)
    if (swordSelected && this.click) {
      const { x: mx, y: my } = this.click;
      this.click = null; // prevent waypoint placement
      if (!bubbleOpen && this.swordCooldown <= 0 && this.sleepyGuy) {
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
        const hitApplied = e.applyKnockback?.(px * KNOCK_SPEED, py * KNOCK_SPEED, KNOCK_TIME, sw.id);
        if (hitApplied && sel && sel.id === "Sword") {
          if (typeof sel.count !== "number") sel.count = 5;

          sel.count -= 1;

          if (sel.count <= 0) {
            this.inventory.removeItem(this.inventory.getSelectedIndex());
            break;
          }
        }
      }
      if (sw.t >= sw.duration) this.swordSwing = null;
    }

    // ===== ToothBrush weapon (inventory item) =====
    // Cooldown tick
    if (this.brushCooldown > 0) {
      this.brushCooldown -= this.clockTick;
      if (this.brushCooldown < 0) this.brushCooldown = 0;
    }

    const brushSelected = !!(sel && sel.id === "ToothBrush");

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
          sweep: Math.PI / 2,
          length: 130,
          thickness: 64,
          spent: false // NEW: only allow one spike removal this use
        };
        this.brushCooldown = 0.20;
      }
    }

    // Advance swing and remove ONLY ONE spike block per use
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

      // Only try to remove a spike once during this swing
      if (!sw.spent) {
        for (let i = 0; i < this.entities.length; i++) {
          const e = this.entities[i];
          if (!(e instanceof Spikes)) continue;
          if (e.removeFromWorld) continue;

          const ex = e.x + (e.width * e.scale) / 2;
          const ey = e.y + (e.height * e.scale) / 2;

          const d2 = dist2PointToSegment(ex, ey, ax, ay, bx, by);
          if (d2 > r2) continue;

          // Remove only this one spike block
          e.removeFromWorld = true;

          // Clear it from gridMap too
          const gx = Math.floor(e.x / PARAMS.BLOCKWIDTH);
          const gy = Math.floor(e.y / PARAMS.BLOCKWIDTH);
          const key = `${gx},${gy}`;
          if (this.gridMap && this.gridMap[key] === e) delete this.gridMap[key];

          // Consume 1 toothbrush use
          if (sel && sel.id === "ToothBrush") {
            if (typeof sel.count !== "number") sel.count = 5;
            sel.count -= 1;

            if (sel.count <= 0) {
              this.inventory.removeItem(this.inventory.getSelectedIndex());
            }
          }
          sw.spent = true; // IMPORTANT: prevents deleting more than one spike
          break;
        }
      }

      // Let the animation finish naturally
      if (sw.t >= sw.duration) {
        this.brushSwing = null;
      }
    }

    // ===== Sandbags (x3) placeable wall =====
    if (this.sandbagCooldown > 0) {
      this.sandbagCooldown -= this.clockTick;
      if (this.sandbagCooldown < 0) this.sandbagCooldown = 0;
    }

    const sandSelected = !!(sel && sel.id && sel.id.startsWith("SandBag"));


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

    // ===== TeddyBear (decoy) =====
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
          lifetime: 5.0,
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

    // ===== SleepDust (splash sleep) =====
    const dustSelected = !!(sel && sel.id === "SleepDust");

    const DUST_RADIUS = 70;   // small splash radius (tweak)
    const DUST_TIME = 10.0;    // seconds asleep (tweak)

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

    // Update all entities
    for (let i = 0; i < this.entities.length; i++) {
      const ent = this.entities[i];
      if (!ent.removeFromWorld && ent.update) {
        ent.update();
      }
    }
    // Adjust camera, unless waypoint interaction requested a one-frame hold.
    if (this.holdCameraThisFrame) {
      this.holdCameraThisFrame = false;
    } else {
      this.camera.update();
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
}